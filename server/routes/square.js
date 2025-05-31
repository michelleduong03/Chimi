const express = require('express');
const router = express.Router();
const axios = require('axios');
const { orders, completedOrders, deletedOrderIds } = require('../utils/orderStorage');

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

// Get orders from Square
router.get('/square-orders', async (req, res) => {
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

// Import and store Square orders into "making"
router.post('/import-square-orders', async (req, res) => {
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
            customerPhone = customer.phone_number || null;
          } catch (err) {
            console.warn(`Failed to fetch customer ${order.customer_id}:`, err.message);
          }
        }

        return {
          id: order.id,
          nameOrNumber: `${customerName} - ${drinks}`,
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

module.exports = router;
