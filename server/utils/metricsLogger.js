const metrics = [];

function logEvent(eventType, details = {}) {
  const event = {
    eventType,
    timestamp: new Date(),
    details,
  };
  metrics.push(event);
  console.log('Metrics logged:', event);
}

function getMetrics() {
  return metrics;
}

module.exports = {
  logEvent,
  getMetrics,
};
