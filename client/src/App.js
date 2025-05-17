import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Metrics from './components/Metrics';
import BucketColumn from './components/BucketColumn';

const BUCKETS = ['making', 'pickup', 'complete'];

// Simple vertical nav component
function VerticalNav({ selected, setSelected }) {
  return (
    <nav className="vertical-nav">
      <h2>Owner Menu</h2>
      <button
        className={selected === 'orders' ? 'nav-button active' : 'nav-button'}
        onClick={() => setSelected('orders')}
      >
        Orders
      </button>
      <button
        className={selected === 'metrics' ? 'nav-button active' : 'nav-button'}
        onClick={() => setSelected('metrics')}
      >
        Metrics
      </button>
      <button
        className={selected === 'closeDay' ? 'nav-button active' : 'nav-button'}
        onClick={() => setSelected('closeDay')}
      >
        Close Day
      </button>
      <button
        className={selected === 'logs' ? 'nav-button active' : 'nav-button'}
        onClick={() => setSelected('logs')}
      >
        Logs
      </button>
    </nav>
  );
}

function Logs({ logs, orderHistory }) {
  return (
    <div style={{ padding: 20 }}>
      <h3>Saved Metrics Logs</h3>
      {logs.length === 0 ? <p>No logs yet.</p> : (
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

      <h3 style={{ marginTop: 40 }}>Completed Order History</h3>
      {orderHistory.length === 0 ? <p>No completed orders yet.</p> : (
        <ul>
          {orderHistory.map((order, i) => (
            <li key={i}>
              <strong>{order.nameOrNumber}</strong> – Completed at{' '}
              {new Date(order.completedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function App() {
  const [orders, setOrders] = useState({ making: [], pickup: [], complete: [] });
  const [input, setInput] = useState('');
  const [metrics, setMetrics] = useState({});
  const [isOwner, setIsOwner] = useState(true);
  const [navSelection, setNavSelection] = useState('orders');
  const [logs, setLogs] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  const fetchOrderHistory = async () => {
    const res = await axios.get('http://localhost:5001/orders/history');
    setOrderHistory(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get('http://localhost:5001/orders');
    setOrders(res.data);
  };

  const fetchLogs = async () => {
    const res = await axios.get('http://localhost:5001/logs');
    setLogs(res.data);
  };

  const fetchMetrics = async () => {
    const res = await axios.get('http://localhost:5001/metrics');
    setMetrics(res.data);
  };

  const addOrder = async () => {
    if (!input) return;
    await axios.post('http://localhost:5001/orders', { nameOrNumber: input });
    setInput('');
    fetchOrders();
    if (isOwner) fetchMetrics();
  };

  const moveOrder = async (from, to, id, nameOrNumber) => {
    await axios.post('http://localhost:5001/orders/move', { from, to, id });
    fetchOrders();
    if (isOwner) fetchMetrics();

    if (to === 'pickup') {
      const msg = new SpeechSynthesisUtterance(`Order for ${nameOrNumber} is ready for pickup`);
      window.speechSynthesis.speak(msg);
    }
    if (to === 'complete') {
      setTimeout(() => {
        deleteOrder('complete', id);
      }, 5 * 60 * 100);
    }
  };

  const deleteOrder = async (from, id) => {
    await axios.post('http://localhost:5001/orders/delete', { from, id });
    fetchOrders();
    if (isOwner) fetchMetrics();
  };

  const closeDay = async () => {
    try {
      await axios.post('http://localhost:5001/close-day');
      alert('Day closed and metrics logged!');
      fetchOrders();
      fetchMetrics();
    } catch (error) {
      alert('Failed to close day.');
    }
  };

  useEffect(() => {
    fetchOrders();
    if (isOwner) fetchMetrics();
  }, [isOwner]);

  useEffect(() => {
    if (navSelection === 'logs') {
      fetchLogs();
      fetchOrderHistory();
    }
  }, [navSelection]);

  return (
    <div className={`app ${isOwner ? 'owner-view' : ''}`}>
      {isOwner && <VerticalNav selected={navSelection} setSelected={setNavSelection} />}

      <div className="main-content">
        <header className="header">
          <h1>☕ Chimi Order System</h1>
          <button
            className="view-toggle"
            onClick={() => setIsOwner(!isOwner)}
          >
            Switch to {isOwner ? 'Customer' : 'Owner'} View
          </button>
        </header>

        {isOwner && navSelection === 'orders' && (
          <div className="add-order">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Name or number"
            />
            <button onClick={addOrder}>Add Order</button>
          </div>
        )}

        {navSelection === 'orders' && (
          <div className="bucket-container">
            {BUCKETS.map((bucket) => (
              <BucketColumn
                key={bucket}
                bucket={bucket}
                orders={orders[bucket]}
                isOwner={isOwner}
                onMove={moveOrder}
                onDelete={deleteOrder}
              />
            ))}
          </div>
        )}

        {isOwner && navSelection === 'metrics' && <Metrics metrics={metrics} />}
        {isOwner && navSelection === 'closeDay' && <closeDay onCloseDay={closeDay} />}
        {isOwner && navSelection === 'logs' && <Logs logs={logs} orderHistory={orderHistory} />}
      </div>
    </div>
  );
}

export default App;
