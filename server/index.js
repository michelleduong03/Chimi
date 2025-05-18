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
  orders.making.push({ id: Date.now(), nameOrNumber });
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

    // move to complete, save to completedOrders
    if (to === 'complete') {
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
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return res.status(500).json({ error: 'Missing Square credentials' });
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

    // Store in "making" for example — you can change this logic
    for (const order of squareOrders) {
      orders.making.push(order);
    }

    res.json({ message: 'Square orders imported to making bucket', count: squareOrders.length });
  } catch (error) {
    console.error('Import error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to import Square orders' });
  }
});

// Delete an order
app.post('/orders/delete', (req, res) => {
  const { from, id } = req.body;
  const index = orders[from].findIndex(o => o.id === id);
  if (index !== -1) {
    orders[from].splice(index, 1);
    res.send('Order deleted');
  } else {
    res.status(404).send('Order not found');
  }
});

// Get metrics
app.get('/metrics', (req, res) => {
  res.json({
    totalOrders: orders.making.length + orders.pickup.length + orders.complete.length,
    making: orders.making.length,
    pickup: orders.pickup.length,
    complete: orders.complete.length,
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});