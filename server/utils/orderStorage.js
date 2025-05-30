// orders buckets
const orders = {
  making: [],
  pickup: [],
  complete: [],
};

// Completed orders history
const completedOrders = [];

// Keep track of deleted order IDs to avoid re-adding
const deletedOrderIds = new Set();

module.exports = {
  orders,
  completedOrders,
  deletedOrderIds,
};
