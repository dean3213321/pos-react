import React, { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const OrderManagement = ({ formatPrice }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderNumber, status) => {
    try {
      await fetch(`${URL}/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
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

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="mt-4">
      <h2>Order Management</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
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
                  {order.items.map(item => (
                    <li key={item.id}>
                      {item.quantity}x {item.name} ({formatPrice(item.price)})
                    </li>
                  ))}
                </ul>
              </td>
              <td>{formatPrice(order.total)}</td>
              <td>
                {order.paymentType} 
                {order.rfid && <div className="text-muted small">{order.rfid}</div>}
              </td>
              <td>{getStatusBadge(order.status)}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>
                <div className="d-flex flex-column gap-2">
                  {order.status === 'Preparing' && (
                    <Button variant="primary" size="sm" onClick={() => updateStatus(order.orderNumber, 'Serving')}>
                      Mark as Serving
                    </Button>
                  )}
                  {order.status === 'Serving' && (
                    <Button variant="success" size="sm" onClick={() => updateStatus(order.orderNumber, 'Completed')}>
                      Mark as Completed
                    </Button>
                  )}
                  {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                    <Button variant="outline-danger" size="sm" onClick={() => updateStatus(order.orderNumber, 'Cancelled')}>
                      Cancel Order
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default OrderManagement;