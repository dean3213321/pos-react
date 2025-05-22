// src/components/OrderScreencast.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';

const OrderScreencast = () => {
  const API_URL = process.env.REACT_APP_URL || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // initial load + polling every 5s
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // filter to Preparing / Serving
  const liveOrders = orders.filter(o =>
    o.status === 'Preparing' || o.status === 'Serving'
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" /> Loading…
      </div>
    );
  }

  return (
    <div className="px-3 py-4">
      {liveOrders.length === 0 ? (
        <p className="text-muted">No active (Preparing/Serving) orders.</p>
      ) : (
        liveOrders.map(o => (
          <div
            key={o.orderNumber}
            className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
          >
            <strong>Order #{o.orderNumber}</strong>
            <span
              className={`badge bg-${
                o.status === 'Preparing' ? 'warning' : 'primary'
              }`}
            >
              {o.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderScreencast;
