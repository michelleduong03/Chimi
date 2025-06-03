import React, { useEffect, useState } from 'react';
// import axios from 'axios';

function DisplayView() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
  const fetchOrders = async () => {
    const res = await fetch('/orders'); // matches your existing route
    const data = await res.json();
    setOrders(data);
  };

  fetchOrders();

  const interval = setInterval(fetchOrders, 5000); // refresh every 5 seconds

  return () => clearInterval(interval);
}, []);


  return (
    <div style={{ padding: '40px', background: '#fff0f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#ad1457' }}>Live Order Display</h1>
      <div style={{ maxWidth: '800px', margin: 'auto' }}>
        {orders.map(order => (
          <div
            key={order._id}
            style={{
              background: '#fce4ec',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '12px',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>{order.item}</span>
            <span>{order.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayView;
