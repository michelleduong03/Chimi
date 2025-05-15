const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
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
  orders.making.push({ id: Date.now(), nameOrNumber });
  res.status(201).send('Order added');
});

// Move order between buckets
app.post('/orders/move', (req, res) => {
  const { from, to, id } = req.body;
  const orderIndex = orders[from].findIndex(o => o.id === id);
  if (orderIndex !== -1) {
    const [order] = orders[from].splice(orderIndex, 1);
    orders[to].push(order);
    res.send('Order moved');
  } else {
    res.status(404).send('Order not found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});