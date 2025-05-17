require('dotenv').config();
const axios = require('axios');

const token = process.env.SANDBOX_ACCESS_TOKEN;
const locationId = process.env.SANDBOX_LOCATION_ID;

console.log('Token:', token);
console.log('Location ID:', locationId);

async function test() {
  try {
    const response = await axios.post(
      'https://connect.squareupsandbox.com/v2/orders/search',
      { location_ids: [locationId] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-05-15',
        },
      }
    );
    console.log('Response:', response.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
