import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, DT } from '../../../utils/datatables-imports.jsx';
import { Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';

DataTable.use(DT);

const OrderManagement = () => {
  const API_URL = process.env.REACT_APP_URL || '';
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('daily'); // 'all', 'daily', 'weekly', 'monthly'

  // Price formatter
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(price);
  }, []);

  // Status priority sorter: Preparing & Serving first
  const sortByStatusPriority = useCallback((ordersList) => {
    const priority = { Preparing: 1, Serving: 2, Completed: 3, Cancelled: 4 };
    return [...ordersList].sort((a, b) => {
      const pa = priority[a.status] || 99;
      const pb = priority[b.status] || 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, []);

  // Filter orders based on time filter
  const filterOrders = useCallback((ordersList, filter) => {
    const now = new Date();
    let startDate;
    let endDate;

    switch (filter) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'weekly': {
        const dayIndex = now.getDay(); // 0 = Sunday
        const diffToMonday = (dayIndex + 6) % 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diffToMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default:
        return sortByStatusPriority(ordersList);
    }

    const filtered = ordersList.filter((order) => {
      const date = new Date(order.createdAt);
      return date >= startDate && date <= endDate;
    });

    return sortByStatusPriority(filtered);
  }, [sortByStatusPriority]);

  // Apply filter when timeFilter or orders change
  useEffect(() => {
    setFilteredOrders(filterOrders(orders, timeFilter));
  }, [timeFilter, orders, filterOrders]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/orders`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [API_URL]);

  // Update status
  const updateStatus = useCallback(async (orderNumber, status) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setOrders((prev) => prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o)));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Status update failed');
    }
  }, [API_URL]);

  // Delegate button clicks
  useEffect(() => {
    const handler = (e) => {
      const serve = e.target.closest('.serve-btn');
      const complete = e.target.closest('.complete-btn');
      const cancel = e.target.closest('.cancel-btn');
      if (serve) updateStatus(serve.dataset.id, 'Serving');
      if (complete) updateStatus(complete.dataset.id, 'Completed');
      if (cancel) updateStatus(cancel.dataset.id, 'Cancelled');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [updateStatus]);

  if (loading) return (
    <div className="text-center my-5">
      <Spinner animation="border" />
      <p>Loading orders...</p>
    </div>
  );

  if (error) return (
    <Alert variant="danger">
      {error}
      <Button variant="link" onClick={() => window.location.reload()}>Refresh</Button>
    </Alert>
  );

  const columns = [
    { title: 'Order #', data: 'orderNumber' },
    { title: 'Items', data: 'items', render: (items) => items ?
        `<ul class="mb-0">${items.map(i => `<li>${i.quantity}x ${i.name} (${formatPrice(i.price)})</li>`).join('')}</ul>` : ''
    },
    { title: 'Total', data: 'total', render: (t) => formatPrice(t) },
    { title: 'Status', data: 'status', render: (s) => {
        const variants = { Preparing: 'warning', Serving: 'primary', Completed: 'success', Cancelled: 'danger' };
        return `<span class="badge bg-${variants[s]}">${s}</span>`;
      }
    },
    { title: 'Date', data: 'createdAt', render: (d) => new Date(d).toLocaleString() },
    { title: 'Actions', data: null, orderable: false, searchable: false, render: (data, type, row) => {
        const btns = [];
        if (row.status === 'Preparing') btns.push(`<button class="btn btn-sm btn-secondary serve-btn" data-id="${row.orderNumber}">Serve</button>`);
        if (row.status === 'Serving') btns.push(`<button class="btn btn-sm btn-success complete-btn" data-id="${row.orderNumber}">Complete</button>`);
        if (!['Completed','Cancelled'].includes(row.status)) btns.push(`<button class="btn btn-sm btn-danger cancel-btn" data-id="${row.orderNumber}">Cancel</button>`);
        return `<div class="d-flex gap-2">${btns.join('')}</div>`;
      }
    }
  ];

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
        <div className="d-flex align-items-center gap-2">
          <span>Filter:</span>
          <ButtonGroup>
            <Button variant={timeFilter === 'all' ? 'primary' : 'outline-primary'} onClick={() => setTimeFilter('all')}>All Orders</Button>
            <Button variant={timeFilter === 'daily' ? 'primary' : 'outline-primary'} onClick={() => setTimeFilter('daily')}>Today</Button>
            <Button variant={timeFilter === 'weekly' ? 'primary' : 'outline-primary'} onClick={() => setTimeFilter('weekly')}>This Week</Button>
            <Button variant={timeFilter === 'monthly' ? 'primary' : 'outline-primary'} onClick={() => setTimeFilter('monthly')}>This Month</Button>
          </ButtonGroup>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Alert variant="info">No orders found for the selected filter</Alert>
      ) : (
        <DataTable
          className="display cell-border"
          columns={columns}
          data={filteredOrders}
          options={{
            responsive: true,
            dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print', 'colvis'],
            pageLength: 10,
            lengthChange: true,
            autoWidth: false,
          }}
        />
      )}
    </div>
  );
};

export default OrderManagement;
