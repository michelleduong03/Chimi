import React from 'react';

export default function Metrics({ metrics }) {
  return (
    <div className="metrics">
      <h3>📈 Metrics</h3>
      <p>Total Orders: {metrics.totalOrders}</p>
      <p>Making: {metrics.making}</p>
      <p>Pickup: {metrics.pickup}</p>
      <p>Complete: {metrics.complete}</p>
    </div>
  );
}

