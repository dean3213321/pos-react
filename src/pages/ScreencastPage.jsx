import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ScreencastPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_URL || '';

  // Memoize isToday so it can go into fetchOrders' deps
  const isToday = useCallback((someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  }, []);

  // Memoize fetchOrders to satisfy the useEffect dependency rule
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();

      const activeOrders = data
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return ['Preparing', 'Serving'].includes(order.status) && isToday(orderDate);
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(activeOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, isToday]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div style={{
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        minHeight: '100%'
      }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: '#333', margin: 0 }}>Today's Active Orders</h2>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading orders...</p>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="p-3" style={{
                backgroundColor: '#fff8e1',
                borderRadius: '8px',
                minHeight: '80vh'
              }}>
                <h3 className="text-center mb-3" style={{ color: '#ff8f00' }}>
                  Preparing ({orders.filter(o => o.status === 'Preparing').length})
                </h3>
                {orders.filter(o => o.status === 'Preparing').length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No orders currently preparing</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {orders
                      .filter(o => o.status === 'Preparing')
                      .map(order => (
                        <div key={order.orderNumber} className="p-3" style={{
                          backgroundColor: 'white',
                          borderRadius: '5px',
                          borderLeft: '4px solid #ffc107',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Order #{order.orderNumber}</h4>
                            <small className="text-muted">
                              {new Date(order.createdAt)
                                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3" style={{
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                minHeight: '80vh'
              }}>
                <h3 className="text-center mb-3" style={{ color: '#2e7d32' }}>
                  Serving ({orders.filter(o => o.status === 'Serving').length})
                </h3>
                {orders.filter(o => o.status === 'Serving').length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No orders currently serving</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {orders
                      .filter(o => o.status === 'Serving')
                      .map(order => (
                        <div key={order.orderNumber} className="p-3" style={{
                          backgroundColor: 'white',
                          borderRadius: '5px',
                          borderLeft: '4px solid #4caf50',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Order #{order.orderNumber}</h4>
                            <small className="text-muted">
                              {new Date(order.createdAt)
                                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreencastPage;
