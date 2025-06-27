import React, { useState } from 'react';

function CloseDay({ onCloseDay, metricsSummary }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // success or error message

  const handleCloseDay = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await onCloseDay();
      setFeedback({ type: 'success', message: "Day closed successfully!" });
    } catch {
      setFeedback({ type: 'error', message: "Oops! Something went wrong." });
    }
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <div className="close-day-container">
      <h2 className="close-day-title">Close Out the Day</h2>
      <p className="close-day-text">Save today's metrics and clear orders.</p>

      {metricsSummary && (
        <div className="metrics-summary">
          <strong>Today's Summary:</strong>
          <ul>
            <li>Total Orders: {metricsSummary.totalOrders}</li>
            <li>Making: {metricsSummary.making}</li>
            <li>Pickup: {metricsSummary.pickup}</li>
            <li>Complete: {metricsSummary.complete}</li>
          </ul>
        </div>
      )}

      <button
        className="close-day-button"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        {loading ? 'Closing...' : 'Close Day'}
      </button>

      {showConfirm && (
        <div className="confirm-modal">
          <div className="confirm-box">
            <p>Are you sure you want to close the day?</p>
            <button
              className="confirm-btn confirm-yes"
              onClick={handleCloseDay}
              disabled={loading}
            >
              Yes
            </button>
            <button
              className="confirm-btn confirm-no"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              No
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

export default CloseDay;

