import React from 'react';

export default function Metrics({ metrics }) {
  return (
    <div className="metrics-container">
      <h3 className="metrics-header">Daily Metrics Overview</h3>
      <div className="metrics-cards">
        <div className="metric-card">Total Orders: <strong>{metrics.totalOrders}</strong></div>
        <div className="metric-card">Making: <strong>{metrics.making}</strong></div>
        <div className="metric-card">Pickup: <strong>{metrics.pickup}</strong></div>
        <div className="metric-card">Complete: <strong>{metrics.complete}</strong></div>
      </div>

      <h4 className="metrics-subheader">Analytics Dashboard</h4>
      <div className="metrics-cards">
        <div className="metric-card">
          Average prep time: <strong>{metrics.avgPrepTime || 'N/A'} mins</strong>
        </div>
        <div className="metric-card">
          Peak order time(s): <strong>{metrics.peakTimes?.join(', ') || 'N/A'}</strong>
        </div>
        <div className="metric-card">
          Order volume per hour:
          {metrics.ordersPerHour ? (
            <ul className="volume-list">
              {Object.entries(metrics.ordersPerHour).map(([hour, count]) => (
                <li key={hour}>{hour}: <strong>{count} orders</strong></li>
              ))}
            </ul>
          ) : (
            <strong> N/A</strong>
          )}
        </div>
      </div>
    </div>
  );
}
