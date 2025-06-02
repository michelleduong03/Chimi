import React from 'react';

function Logs({ logsTab, logs, orderHistory }) {
  return (
    <div style={{ padding: 20 }}>
      {logsTab === 'logs' && (
        <>
          <h3>Saved Metrics Logs</h3>
          {logs.length === 0 ? (
            <p>No logs yet.</p>
          ) : (
            <ul>
              {logs.map((log, i) => (
                <li key={i} style={{ marginBottom: 15 }}>
                  <strong>{new Date(log.date).toLocaleString()}:</strong>
                  <ul>
                    <li>Total Orders: {log.totalOrders}</li>
                    <li>Making: {log.making}</li>
                    <li>Pickup: {log.pickup}</li>
                    <li>Complete: {log.complete}</li>
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {logsTab === 'history' && (
        <>
          <h3>Completed Order History</h3>
          {orderHistory.length === 0 ? (
            <p>No completed orders yet.</p>
          ) : (
            <ul>
              {orderHistory.map((order, i) => (
                <li key={i}>
                  <strong>{order.nameOrNumber}</strong> – Completed at{' '}
                  {new Date(order.completedAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}


export default Logs;
