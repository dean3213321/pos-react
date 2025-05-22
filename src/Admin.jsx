import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Admin = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_URL || '';

  const boxes = [
    {
      title: "Category",
      description: "Manage food categories",
      path: "/category",
      icon: "📋",
      color: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    },
    {
      title: "Items",
      description: "Manage menu items",
      path: "/items",
      icon: "🍽️",
      color: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)"
    },
    {
      title: "Transactions",
      description: "View order history and receipts",
      path: "/Transactions",
      icon: "🧾",
      color: "linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)"
    },
    {
      title: "Top-up",
      description: "Add credit to user accounts",
      path: "/Wispay",
      icon: "💳",
      color: "linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)"
    }
  ];

  // Function to check if a date is today
  const isToday = useCallback((someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  }, []);

  // Fetch and filter active orders (Preparing and Serving) from today
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
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleBoxClick = (path) => {
    navigate(path);
  };

  return (
    <div className="d-flex" style={{ overflow: 'hidden', height: '100vh' }}>
      {/* Left Side - Admin Boxes (30% width) */}
      <div className="p-4" style={{ width: '30%', minWidth: '900px' }}>
        <div className="d-flex flex-wrap gap-4">
          {boxes.map((box, index) => (
            <div 
              key={index}
              className="p-3 rounded-3 border-0 shadow-sm cursor-pointer"
              style={{
                width: '370px',
                height: '200px',
                background: box.color,
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onClick={() => handleBoxClick(box.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.075)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="text-center">
                <div style={{ fontSize: '3rem' }}>{box.icon}</div>
                <h3>{box.title}</h3>
                <p>{box.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Today's Order Display (70% width) */}
      <div style={{ 
        width: '70%', 
        backgroundColor: '#f0f2f5',
        padding: '20px',
        overflowY: 'auto',
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
              {/* Preparing Orders Column */}
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="p-3" style={{ 
                  backgroundColor: '#fff8e1', 
                  borderRadius: '8px',
                  minHeight: '300px'
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
                        .filter(order => order.status === 'Preparing')
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
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Serving Orders Column */}
              <div className="col-md-6">
                <div className="p-3" style={{ 
                  backgroundColor: '#e8f5e9', 
                  borderRadius: '8px',
                  minHeight: '300px'
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
                        .filter(order => order.status === 'Serving')
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
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
