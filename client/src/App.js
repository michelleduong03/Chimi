import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BUCKETS = ['making', 'pickup', 'complete'];

function App() {
  const [orders, setOrders] = useState({ making: [], pickup: [], complete: [] });
  const [input, setInput] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5001/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };  

  const addOrder = async () => {
    try {
      await axios.post('http://localhost:5001/orders', { nameOrNumber: input });
      setInput('');
      fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Failed to add order. Please try again.');
    }
  };
  
  const moveOrder = async (from, to, id, nameOrNumber) => {
    try {
      await axios.post('http://localhost:5001/orders/move', { from, to, id });
      fetchOrders();
  
      if (to === 'pickup') {
        const msg = new SpeechSynthesisUtterance(`Order for ${nameOrNumber} is ready for pickup`);
        window.speechSynthesis.speak(msg);
      }
    } catch (error) {
      console.error('Error moving order:', error);
      alert('Failed to move order. Please try again.');
    }
  };  

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>☕ Chimi Order System</h1>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Name or number" />
      <button onClick={addOrder}>Add Order</button>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {BUCKETS.map(bucket => (
          <div key={bucket}>
            <h2>{bucket.toUpperCase()}</h2>
            {orders[bucket]?.map(order => (
              <div key={order.id} style={{ border: '1px solid gray', padding: '5px', margin: '5px' }}>
                {order.nameOrNumber}
                <div>
                  {BUCKETS.filter(b => b !== bucket).map(target => (
                    <button key={target} onClick={() => moveOrder(bucket, target, order.id, order.nameOrNumber)}>{`→ ${target}`}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
