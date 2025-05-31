const express = require('express');
const router = express.Router();
const {
  orders, completedOrders, deletedOrderIds,
  sendReadyText, metricsLog
} = require('../utils/orderStorage');

// Get all orders
router.get('/orders', (req, res) => {
  res.json(orders);
});

// Add order to "making"
router.post('/orders', (req, res) => {
  const { nameOrNumber } = req.body;
  console.log('Received order:', nameOrNumber);
  orders.making.push({ id: Date.now(), nameOrNumber });
  res.status(201).send('Order added');
});

// Move order between buckets
router.post('/orders/move', (req, res) => {
  const { from, to, id } = req.body;
  const orderIndex = orders[from].findIndex(o => o.id === id);

  if (orderIndex !== -1) {
    const [order] = orders[from].splice(orderIndex, 1);
    orders[to].push(order);

    if (to === 'pickup' && order.phone) {
      sendReadyText(order.phone, order.nameOrNumber);
    }

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
router.get('/orders/history', (req, res) => {
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

// Delete an order
router.post('/orders/delete', (req, res) => {
  const { from, id } = req.body;
  const index = orders[from].findIndex(o => o.id === id);
  if (index !== -1) {
    deletedOrderIds.add(id);
    orders[from].splice(index, 1);
    res.send('Order deleted');
  } else {
    res.status(404).send('Order not found');
  }
});

module.exports = router;
