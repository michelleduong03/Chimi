import React from 'react';

export default function BucketColumn({ bucket, orders, isOwner, onMove, onDelete }) {
  return (
    <div className="bucket">
      <h2>{bucket.toUpperCase()}</h2>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <span>{order.nameOrNumber}</span>
          {order.drink && (
            <div style={{ fontSize: '0.8em', color: '#777', marginTop: 4 }}>
              {order.drink}
            </div>
          )}
          {isOwner && (
            <div className="order-actions">
              {['making', 'pickup', 'complete']
                .filter((b) => b !== bucket)
                .map((target) => (
                  <button key={target} onClick={() => onMove(bucket, target, order.id, order.nameOrNumber)}>
                    → {target}
                  </button>
                ))}
              <button className="delete" onClick={() => onDelete(bucket, order.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
