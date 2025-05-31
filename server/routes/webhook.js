const express = require('express');
const router = express.Router();
const { orders, completedOrders, deletedOrderIds } = require('../utils/orderStorage');
const { sendReadyText } = require('../services/sms');

router.post('/square-webhook', (req, res) => {
  const event = req.body;

  if (!event || !event.type) {
    return res.status(400).send('Invalid webhook event');
  }

  console.log('Received Square webhook:', event.type);

  if (event.type === 'order.created' || event.type === 'order.updated') {
    const order = event.data.object;

    // Example: add or update order in your in-memory order buckets
    const existingIndex = orders.making.findIndex(o => o.id === order.id);

    if (existingIndex !== -1) {
      // Update order
      orders.making[existingIndex] = order;
    } else {
      // Add new order to making bucket
      orders.making.push(order);
    }

    if (order.state === 'COMPLETED') {
      // Move order to completedOrders if needed
      const idx = orders.making.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        const [completedOrder] = orders.making.splice(idx, 1);
        completedOrders.push(completedOrder);

        if (completedOrder.phone) {
          sendReadyText(completedOrder.phone, completedOrder.nameOrNumber);
        }
      }
    }

    res.status(200).send('Order processed');
  } else {
    // For unhandled event types
    res.status(200).send('Event ignored');
  }
});

module.exports = router;
