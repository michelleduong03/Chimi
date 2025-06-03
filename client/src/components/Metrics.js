import React from 'react';

export default function Metrics({ metrics }) {
  return (
    <div className="metrics-container">
      <h3 className="metrics-header">📈 Daily Metrics Overview</h3>
      <ul className="metrics-list">
        <li className="metrics-list-item">Total Orders: <strong>{metrics.totalOrders}</strong></li>
        <li className="metrics-list-item">Making: <strong>{metrics.making}</strong></li>
        <li className="metrics-list-item">Pickup: <strong>{metrics.pickup}</strong></li>
        <li className="metrics-list-item">Complete: <strong>{metrics.complete}</strong></li>
      </ul>

      <h4 className="metrics-subheader">Analytics Dashboard for Staff</h4>
      <p>Backend view with metrics:</p>
      <ul className="metrics-list">
        <li className="metrics-list-item">Average prep time: <strong>{metrics.avgPrepTime || 'N/A'} mins</strong></li>
        <li className="metrics-list-item">Peak order time(s): <strong>{metrics.peakTimes?.join(', ') || 'N/A'}</strong></li>
        <li className="metrics-list-item">
          Order volume per hour:
          {metrics.ordersPerHour ? (
            <ul className="metrics-list" style={{ marginTop: 6, paddingLeft: '1rem' }}>
              {Object.entries(metrics.ordersPerHour).map(([hour, count]) => (
                <li key={hour} className="metrics-list-item">{hour}: <strong>{count} orders</strong></li>
              ))}
            </ul>
          ) : (
            <span> N/A</span>
          )}
        </li>
      </ul>
      <p style={{ fontStyle: 'italic', color: '#555' }}>
        Useful for optimizing service 🌟
      </p>
    </div>
  );
}
