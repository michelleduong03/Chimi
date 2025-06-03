import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Metrics from './components/Metrics';
import BucketColumn from './components/BucketColumn';
import DisplayView from './components/DisplayView';
import VerticalNav from './components/VerticalNav';
import Logs from './components/Logs';
import CloseDay from './components/CloseDay';

const BUCKETS = ['making', 'pickup'];

function App() {
  const [orders, setOrders] = useState({ making: [], pickup: [], complete: [] });
  const [input, setInput] = useState('');
  const [metrics, setMetrics] = useState({});
  const [isOwner, setIsOwner] = useState(true);
  const [navSelection, setNavSelection] = useState('orders');
  const [logs, setLogs] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [logsTab, setLogsTab] = useState('logs');

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

 const syncSquareOrders = async () => {
    await axios.post('http://localhost:5001/import-square-orders');
    fetchOrders(); // refresh the frontend with the new data
  };

  useEffect(() => {
    const interval = setInterval(() => {
      syncSquareOrders();
    }, 15000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
          <button className="view-toggle" onClick={() => setIsOwner(!isOwner)}>
            Switch to {isOwner ? 'Customer' : 'Owner'} View
          </button>
          {isOwner && <button onClick={syncSquareOrders}>Sync Orders from Square</button>}
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
          isOwner ? (
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
          ) : (
            <DisplayView orders={orders} />
          )
        )}

        {isOwner && navSelection === 'metrics' && <Metrics metrics={metrics} />}
        {isOwner && navSelection === 'closeDay' && <CloseDay onCloseDay={closeDay} />}
        {isOwner && navSelection === 'logs' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <button
                className={`tab-button ${logsTab === 'logs' ? 'active' : ''}`}
                onClick={() => setLogsTab('logs')}
              >
                Logs
              </button>

              <button
                className={`tab-button ${logsTab === 'history' ? 'active' : ''}`}
                onClick={() => setLogsTab('history')}
              >
                Order History
              </button>
            </div>
            <Logs logsTab={logsTab} logs={logs} orderHistory={orderHistory} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
