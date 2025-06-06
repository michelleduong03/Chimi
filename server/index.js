require('dotenv').config();
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;
const axios = require('axios');
const deletedOrderIds = new Set();

const SQUARE_ACCESS_TOKEN = process.env.SANDBOX_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SANDBOX_LOCATION_ID;  
console.log('Square Access Token:', SQUARE_ACCESS_TOKEN ? 'Loaded' : 'Missing');
console.log('Square Location ID:', SQUARE_LOCATION_ID ? 'Loaded' : 'Missing');

// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use(express.json());

let orders = {
  making: [],
  pickup: [],
  complete: [],
};

// Get all orders
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Add order to "making"
app.post('/orders', (req, res) => {
  const { nameOrNumber } = req.body;
  console.log('Received order:', nameOrNumber);
  orders.making.push({ id: Date.now(), nameOrNumber, createdAt: new Date() });
  res.status(201).send('Order added');
});

let completedOrders = []; 

// Move order between buckets
app.post('/orders/move', (req, res) => {
  const { from, to, id } = req.body;
  const orderIndex = orders[from].findIndex(o => o.id === id);

  if (orderIndex !== -1) {
    const [order] = orders[from].splice(orderIndex, 1);
    orders[to].push(order);

    // if (to == 'pickup') {
    //   if (order.phone) {
    //     sendReadyText(order.phone, order.nameOrNumber);
    //   }
    // }
    // move to complete, save to completedOrders
    if (to === 'complete' || to === 'pickup') {
      order.completedAt = new Date();
      completedOrders.push(order);
    }

    res.send('Order moved');
  } else {
    res.status(404).send('Order not found');
  }
});

// View completed orders
app.get('/orders/history', (req, res) => {
  const { start, end, query } = req.query;

  let filtered = completedOrders;

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    filtered = filtered.filter(order => {
      const completedAt = new Date(order.completedAt);
      return completedAt >= startDate && completedAt <= endDate;
    });
  }

  if (query) {
    filtered = filtered.filter(order =>
      order.nameOrNumber?.toLowerCase().includes(query.toLowerCase())
    );
  }

  res.json(filtered);
});

// Get orders from Square (testing sandbox)
app.get('/square-orders', async (req, res) => {
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return res.status(500).json({ error: 'Missing Square access token or location ID' });
  }

  try {
    const response = await axios.post(
      'https://connect.squareupsandbox.com/v2/orders/search',
      {
        location_ids: [SQUARE_LOCATION_ID]
      },
      {
        headers: {
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-05-15'
        }
      }
    );

    const squareOrders = (response.data.orders || []).map(order => ({
      id: order.id,
      nameOrNumber: order.line_items?.[0]?.name || 'Unknown',
      state: order.state
    }));

    res.json(squareOrders);
  } catch (error) {
    console.error('Error fetching Square orders:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Square orders' });
  }
});

// Stores the square orders
app.post('/import-square-orders', async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setUTCHours(23, 59, 59, 999);

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return res.status(500).json({ error: 'Missing Square credentials' });
  }

  try {
    const response = await axios.post(
      'https://connect.squareupsandbox.com/v2/orders/search',
      {
        location_ids: [SQUARE_LOCATION_ID],
        query: {
          filter: {
            date_time_filter: {
              created_at: {
                start_at: startOfToday.toISOString(),
                end_at: endOfToday.toISOString()
              }
            }
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-05-15'
        }
      }
    );

    const ordersData = response.data.orders || [];

    const enrichedOrders = await Promise.all(
      ordersData.map(async (order) => {
        const drinks = (order.line_items || []).map(item => item.name).join(', ') || 'Unknown';

        let customerName = 'Unknown';
        let customerPhone = null;
        if (order.customer_id) {
          try {
            console.log(`Fetching customer for ID: ${order.customer_id}`);
            const customerResponse = await axios.get(
              `https://connect.squareupsandbox.com/v2/customers/${order.customer_id}`,
              {
                headers: {
                  'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
                  'Square-Version': '2024-05-15'
                }
              }
            );
            const customer = customerResponse.data.customer;
            customerName = customer.given_name || customer.family_name || customer.nickname || 'Unknown';
            
            if (customer.phone_number) {
              customerPhone = customer.phone_number;
            }
            console.log('Customer response:', customerResponse.data);
          } catch (err) {
            console.warn(`Failed to fetch customer ${order.customer_id}:`, err.message);
          }
        }

        return {
          id: order.id,
          nameOrNumber: `${customerName} - ${drinks}`,
          drinks: drinks,
          state: order.state,
          phone: customerPhone
        };
      })
    );

    const existingMakingIds = new Set(orders.making.map(o => o.id));
    const existingCompletedIds = new Set(completedOrders.map(o => o.id));

    for (const order of enrichedOrders) {
      if (
        !existingMakingIds.has(order.id) &&
        !existingCompletedIds.has(order.id) &&
        !deletedOrderIds.has(order.id)
      ) {
        orders.making.push(order);
      }
    }

    res.json({ message: 'Square orders imported to making bucket', count: enrichedOrders.length });
  } catch (error) {
    console.error('Import error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to import Square orders' });
  }
});

// Delete an order
// app.post('/orders/delete', (req, res) => {
//   const { from, id } = req.body;
//   const index = orders[from].findIndex(o => o.id === id);
//   if (index !== -1) {
//     deletedOrderIds.add(id);
//     orders[from].splice(index, 1);
//     res.send('Order deleted');
//   } else {
//     res.status(404).send('Order not found');
//   }
// });
app.post('/orders/delete', (req, res) => {
  const { from, id } = req.body;

  let removed = false;

  if (orders[from]) {
    const index = orders[from].findIndex(o => o.id === id);
    if (index !== -1) {
      orders[from].splice(index, 1);
      removed = true;
    }
  }

  // Also remove from completedOrders if deleting from 'complete'
  if (from === 'complete') {
    const compIndex = completedOrders.findIndex(o => o.id === id);
    if (compIndex !== -1) {
      completedOrders.splice(compIndex, 1);
      removed = true;
    }
  }

  if (removed) {
    deletedOrderIds.add(id);
    res.send('Order deleted');
  } else {
    res.status(404).send('Order not found');
  }
});


// Get metrics
app.get('/metrics', (req, res) => {
  // res.json({
  //   totalOrders: orders.making.length + orders.pickup.length + orders.complete.length,
  //   making: orders.making.length,
  //   pickup: orders.pickup.length,
  //   complete: orders.complete.length,
  // });
  const totalOrders = orders.making.length + orders.pickup.length + orders.complete.length;

  // Prep time in minutes for completed orders
  const avgPrepTime = (() => {
    const times = completedOrders
      .filter(o => o.createdAt && o.completedAt)
      .map(o => (new Date(o.completedAt) - new Date(o.createdAt)) / 60000);
    return times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
  })();

  // Orders per hour
  const allOrders = [...orders.making, ...orders.pickup, ...orders.complete, ...completedOrders];
  const ordersPerHour = {};
  allOrders.forEach(o => {
    if (!o.createdAt) return;
    const hour = new Date(o.createdAt).getHours().toString().padStart(2, '0') + ':00';
    ordersPerHour[hour] = (ordersPerHour[hour] || 0) + 1;
  });

  // Peak times (most active hours)
  const peakTimes = (() => {
    const entries = Object.entries(ordersPerHour);
    if (!entries.length) return null;
    const max = Math.max(...entries.map(([, count]) => count));
    return entries.filter(([, count]) => count === max).map(([hour]) => hour);
  })();

  res.json({
    totalOrders,
    making: orders.making.length,
    pickup: orders.pickup.length,
    complete: orders.complete.length,
    avgPrepTime,
    ordersPerHour,
    peakTimes,
  });
});

let metricsLog = [];

app.get('/logs', (req, res) => {
  res.json(metricsLog);
});

app.post('/close-day', (req, res) => {
  try {
    const date = new Date();
    const metrics = {
      date,
      totalOrders: orders.making.length + orders.pickup.length + orders.complete.length,
      making: orders.making.length,
      pickup: orders.pickup.length,
      complete: orders.complete.length,
    };

    // Save metrics to log
    metricsLog.push(metrics);

    // Reset orders
    orders = { making: [], pickup: [], complete: [] };

    res.json({ message: 'Day closed and metrics logged.', metrics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to close day.' });
  }
});

const importSquareOrders = async () => {
  try {
    const response = await axios.post('http://localhost:5001/import-square-orders');
    console.log('Orders imported on startup:', response.data);
  } catch (err) {
    console.error('Failed to import orders on startup:', err.message);
  }
};

// for SMS notifications (LATER IMPLEMENTATION TOO COSTLY)
// const twilio = require('twilio');

// const accountSid = process.env.TWILIO_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhone = process.env.TWILIO_PHONE;
// const client = twilio(accountSid, authToken);
// console.log('Twilio SID:', accountSid ? 'Loaded' : 'Missing');
// console.log('Twilio Auth Token:', authToken ? 'Loaded' : 'Missing');
// console.log('Twilio Phone:', twilioPhone ? 'Loaded' : 'Missing');

// async function sendReadyText(customerPhone, nameOrNumber) {
//   try {
//     await client.messages.create({
//       body: `Hi! Your order (${nameOrNumber}) is ready for pickup. ☕`,
//       from: twilioPhone,
//       to: customerPhone 
//     });
//   } catch (err) {
//     console.error('Failed to send SMS:', err.message);
//   }
// }

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  importSquareOrders();
});

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const PORT = 5001;

// const { importSquareOrders } = require('./services/square');
// const ordersRouter = require('./routes/orders');
// const squareRouter = require('./routes/square');
// const webhookRouter = require('./routes/webhook');

// process.on('uncaughtException', err => console.error('Uncaught Exception:', err));
// process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection:', promise, 'reason:', reason));

// app.use(cors({ origin: 'http://localhost:3000' }));
// app.use(express.json());

// app.use('/orders', ordersRouter);
// app.use('/square', squareRouter);
// app.use('/webhook', webhookRouter);

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   importSquareOrders();
// });
