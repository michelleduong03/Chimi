import React from 'react';

function DisplayView({ orders }) {
  const makingOrders = orders.making || [];
  const pickupOrders = orders.pickup || [];

  // const containerStyle = {
  //   padding: '40px',
  //   background: '#fffaf0',
  //   minHeight: '100vh',
  //   fontFamily: 'sans-serif',
  // };

  // const sectionContainerStyle = {
  //   display: 'flex',
  //   gap: '20px',
  //   justifyContent: 'center',
  //   flexWrap: 'wrap',
  //   marginTop: '30px',
  // };

  // const sectionStyle = {
  //   background: '#fdf6ec',
  //   padding: '20px',
  //   borderRadius: '20px',
  //   width: '360px',
  //   boxShadow: '0 4px 12px rgba(204, 178, 154, 0.2)',
  // };

  // const titleStyle = {
  //   textAlign: 'center',
  //   color: '#7d5f4c', 
  //   marginBottom: '12px',
  //   fontSize: '24px',
  //   fontWeight: 'bold',
  // };

  // const cardStyle = {
  //   background: '#f3e0d8', 
  //   padding: '14px 20px',
  //   borderRadius: '14px',
  //   marginBottom: '10px',
  //   fontSize: '18px',
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   color: '#6b4e4e', 
  // };

  return (
    <div style={{ 
      padding: '40px',
      background: '#fffaf0',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{ textAlign: 'center', color: '#a65973' }}>Live Orders</h1>

      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '30px',
      }}>
        <div style={{
          background: '#fdf6ec', 
          padding: '20px',
          borderRadius: '20px',
          width: '360px',
          boxShadow: '0 4px 12px rgba(204, 178, 154, 0.2)',
          color: '#6b4e4e',
        }}>
          <h2 style={{
            textAlign: 'center',
            color: '#a65973', 
            marginBottom: '12px',
            fontSize: '24px',
            fontWeight: 'bold',
          }}>
            In Progress
          </h2>
          {makingOrders.length === 0 ? (
            <p style={{ color: '#b86a84', textAlign: 'center' }}>No orders in progress.</p>
          ) : (
            makingOrders.map((order) => (
              <div key={order._id} style={{
                background: '#f3e0d8',
                padding: '14px 20px',
                borderRadius: '14px',
                marginBottom: '10px',
                fontSize: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#6b4e4e',
              }}>
                <span>{order.nameOrNumber || order.item}</span>
              </div>
            ))
          )}
        </div>

        <div style={{
          background: '#fdf6ec',
          padding: '20px',
          borderRadius: '20px',
          width: '360px',
          boxShadow: '0 4px 12px rgba(204, 178, 154, 0.2)',
          color: '#6b4e4e',
        }}>
          <h2 style={{
            textAlign: 'center',
            color: '#a65973',
            marginBottom: '12px',
            fontSize: '24px',
            fontWeight: 'bold',
          }}>
            Ready for Pickup
          </h2>
          {pickupOrders.length === 0 ? (
            <p style={{ color: '#b86a84', textAlign: 'center' }}>No orders ready yet.</p>
          ) : (
            pickupOrders.map((order) => (
              <div key={order._id} style={{
                background: '#f3e0d8',
                padding: '14px 20px',
                borderRadius: '14px',
                marginBottom: '10px',
                fontSize: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#6b4e4e',
              }}>
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
