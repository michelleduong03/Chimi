import React from 'react';

function Logs({ logsTab, logs, orderHistory }) {
  return (
    <div className="logs-container">
      {logsTab === 'logs' && (
        <>
          <h3 className="logs-header">📊 Saved Metrics Logs</h3>
          {logs.length === 0 ? (
            <p className="empty-msg">No logs yet. ✨</p>
          ) : (
            <ul className="logs-list">
              {logs.map((log, i) => (
                <li key={i} className="log-item">
                  <strong className="log-date">{new Date(log.date).toLocaleString()}:</strong>
                  <ul className="log-details">
                    <li>Total Orders: <span className="log-number">{log.totalOrders}</span></li>
                    <li>Making: <span className="log-number">{log.making}</span></li>
                    <li>Pickup: <span className="log-number">{log.pickup}</span></li>
                    <li>Complete: <span className="log-number">{log.complete}</span></li>
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {logsTab === 'history' && (
        <>
          <h3 className="logs-header">🎉 Completed Order History</h3>
          {orderHistory.length === 0 ? (
            <p className="empty-msg">No completed orders yet.</p>
          ) : (
            <ul className="logs-list">
              {orderHistory.map((order, i) => {
                // Split nameOrNumber by ' - ', take the second part (drinks), or fallback to whole string
                const drinks = order.nameOrNumber.split(' - ')[1] || order.nameOrNumber;

                return (
                  <li key={i} className="log-item">
                    <strong className="order-drinks">{drinks}</strong> – Completed at{' '}
                    <span className="order-date">{new Date(order.completedAt).toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Logs;
