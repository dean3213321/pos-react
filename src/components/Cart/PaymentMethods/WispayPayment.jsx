import React, { useState, useRef, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';

const URL = process.env.REACT_APP_URL;

const WispayPayment = ({ cart, calculateTotal, formatPrice, onOrderSuccess, clearAllItems }) => {
  const [rfid, setRfid] = useState('');
  const [credit, setCredit] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wispayError, setWispayError] = useState(null);
  const rfidInputRef = useRef(null);

  useEffect(() => {
    rfidInputRef.current?.focus();
  }, []);

  const submitOrder = async () => {
    const total = calculateTotal();
    const res = await fetch(`${URL}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({ 
          id: i.id, 
          quantity: i.quantity,
          price: i.price,
          name: i.name
        })),
        paymentType: 'Wispay',
        rfid,
        total
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data.orderNumber;
  };

  const checkCredit = async () => {
    if (!rfid) {
      setWispayError('Please enter RFID');
      return;
    }
    setIsChecking(true);
    setWispayError(null);
    try {
      const res = await fetch(`${URL}/api/wispay/credit?rfid=${encodeURIComponent(rfid)}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch credit');
      const data = await res.json();
      if (data.success) setCredit(data.credit);
      else throw new Error(data.error || 'Failed to fetch credit');
    } catch (err) {
      setWispayError(err.message);
      setCredit(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleWispayPayment = async () => {
    if (!rfid) {
      setWispayError('Please enter RFID');
      rfidInputRef.current?.focus();
      return;
    }
    setIsProcessing(true);
    setWispayError(null);
    try {
      const total = calculateTotal();
      
      // Process Wispay payment first
      const paymentRes = await fetch(`${URL}/api/wispay/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid,
          amount: total.toString(),
          empid: 'POS_USER',
          username: 'POS Operator',
          product_name: cart.map(i => i.name).join(', '),
          quantity: cart.reduce((s, i) => s + i.quantity, 0),
        }),
      });
      
      if (!paymentRes.ok) throw new Error((await paymentRes.json()).error || 'Payment failed');
      const paymentData = await paymentRes.json();
      if (!paymentData.success) throw new Error(paymentData.error || 'Payment failed');

      // Create the order after successful payment
      const orderNumber = await submitOrder();
      
      onOrderSuccess();
      alert(`Order #${orderNumber} placed! Status: Preparing. New balance: ${formatPrice(paymentData.newBalance)}`);
      setCredit(paymentData.newBalance);
      clearAllItems();
    } catch (err) {
      setWispayError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mb-3">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Enter RFID"
          value={rfid}
          onChange={e => setRfid(e.target.value)}
          ref={rfidInputRef}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={checkCredit}
          disabled={isChecking}
        >
          {isChecking ? 'Checking…' : 'Check Credit'}
        </button>
      </div>
      {credit !== null && (
        <div className="mt-2 text-end">
          <strong>Available Credit:</strong> {formatPrice(credit)}
        </div>
      )}
      {wispayError && (
        <Alert variant="danger" className="mt-2" dismissible onClose={() => setWispayError(null)}>
          {wispayError}
        </Alert>
      )}

      <Button
        variant="success"
        className="w-100 py-1 fw-bold d-flex align-items-center justify-content-center mt-3"
        size="lg"
        onClick={handleWispayPayment}
        disabled={cart.length === 0 || !rfid || credit === null || credit < calculateTotal() || isProcessing}
      >
        {isProcessing ? 'Processing…' : (
          <>
            <i className="bi bi-lock-fill me-2"></i>
            <span>Place Order (Pay with Wispay)</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default WispayPayment;