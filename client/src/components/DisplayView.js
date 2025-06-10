import React from 'react';

function DisplayView({ orders }) {
  const makingOrders = orders.making || [];
  const pickupOrders = orders.pickup || [];

  const containerStyle = {
  padding: '40px',
  background: '#fff0f5', // baby pink background
  minHeight: '100vh',
  fontFamily: 'sans-serif',
};

const sectionContainerStyle = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: '30px',
};

const sectionStyle = {
  background: '#ffe6f0', // lighter pink card background
  padding: '20px',
  borderRadius: '20px',
  width: '360px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

const titleStyle = {
  textAlign: 'center',
  color: '#c2185b', // deeper pink for headers
  marginBottom: '12px',
  fontSize: '24px',
  fontWeight: 'bold',
};

const cardStyle = {
  background: '#fcd6e8', // soft bubble pink
  padding: '14px 20px',
  borderRadius: '14px',
  marginBottom: '10px',
  fontSize: '18px',
  display: 'flex',
  justifyContent: 'space-between',
  color: '#8b3a62', // muted berry text
};


  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#c2185b' }}>Live Orders</h1>
      <div style={sectionContainerStyle}>
        <div style={sectionStyle}>
          <h2 style={titleStyle}>In Progress</h2>
          {makingOrders.length === 0 ? (
            <p style={{ color: '#7b4f2c', textAlign: 'center' }}>No orders in progress.</p>
          ) : (
            makingOrders.map((order) => (
              <div key={order._id} style={cardStyle}>
                <span>{order.nameOrNumber || order.item}</span>
              </div>
            ))
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={titleStyle}>Ready for Pickup</h2>
          {pickupOrders.length === 0 ? (
            <p style={{ color: '#7b4f2c', textAlign: 'center' }}>No orders ready yet.</p>
          ) : (
            pickupOrders.map((order) => (
              <div key={order._id} style={cardStyle}>
                <span>{order.nameOrNumber || order.item}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayView;
