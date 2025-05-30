const axios = require('axios');
const { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID } = process.env;

const squareApi = axios.create({
  baseURL: 'https://connect.squareupsandbox.com/v2',
  headers: {
    'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Square-Version': '2024-05-15'
  }
});

async function fetchSquareOrders() {
  const response = await squareApi.post('/orders/search', {
    location_ids: [SQUARE_LOCATION_ID]
  });
  return response.data.orders || [];
}

async function fetchSquareCustomer(customerId) {
  const response = await squareApi.get(`/customers/${customerId}`);
  return response.data.customer;
}

async function importSquareOrders(req, res) {
  try {
    const response = await axios.post('http://localhost:5001/import-square-orders');
    console.log('Orders imported on startup:', response.data);
  } catch (err) {
    console.error('Failed to import orders on startup:', err.message);
  }
};

module.exports = {
  fetchSquareOrders,
  fetchSquareCustomer,
  importSquareOrders,
};
