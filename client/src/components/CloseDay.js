import React from 'react';

function CloseDay({ onCloseDay }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Close Out the Day</h2>
      <p>Click the button below to save the day’s metrics and clear orders.</p>
      <button onClick={onCloseDay}>Close Day</button>
    </div>
  );
}

export default CloseDay;
