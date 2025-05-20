import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';

const OrderManagement = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Built-in price formatter
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(price);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/orders`);
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL]);

  const updateStatus = async (orderNumber, status) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh orders after update
      setOrders(orders.map(order => 
        order.orderNumber === orderNumber 
          ? { ...order, status } 
          : order
      ));
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Status update failed');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Preparing: 'warning',
      Serving: 'primary',
      Completed: 'success',
      Cancelled: 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <Button variant="link" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </Alert>
    );
  }

  return (
    <div className="p-3">
      <h2 className="mb-4">Order Management</h2>
      
      {orders.length === 0 ? (
        <Alert variant="info">No orders found</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.orderNumber}>
                <td>{order.orderNumber}</td>
                <td>
                  <ul className="mb-0">
                    {order.items?.map(item => (
                      <li key={item.id}>
                        {item.quantity}x {item.name} ({formatPrice(item.price)})
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{formatPrice(order.total)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    {order.status === 'Preparing' && (
                      <Button size="sm" onClick={() => updateStatus(order.orderNumber, 'Serving')}>
                        Serve
                      </Button>
                    )}
                    {order.status === 'Serving' && (
                      <Button variant="success" size="sm" 
                        onClick={() => updateStatus(order.orderNumber, 'Completed')}>
                        Complete
                      </Button>
                    )}
                    {!['Completed', 'Cancelled'].includes(order.status) && (
                      <Button variant="danger" size="sm"
                        onClick={() => updateStatus(order.orderNumber, 'Cancelled')}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default OrderManagement;