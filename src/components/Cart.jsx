import React, { useState, useRef, useEffect } from 'react';
import { ListGroup, Button, Alert, ButtonGroup } from 'react-bootstrap';

const URL = process.env.REACT_APP_URL;

const Cart = ({
  cart,
  formatPrice,
  removeFromCart,
  calculateTotal,
  updateQuantity,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [rfid, setRfid] = useState('');
  const [credit, setCredit] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wispayError, setWispayError] = useState(null);

  const rfidInputRef = useRef(null);

  // Focus RFID input when Wispay is selected
  useEffect(() => {
    if (paymentMethod === 'wispay') {
      rfidInputRef.current?.focus();
    }
  }, [paymentMethod]);

  // Clear entire cart by removing each item and reset payment state
  const clearAllItems = () => {
    cart.forEach(item => removeFromCart(item.id));
    // reset payment form
    setRfid('');
    setCredit(null);
    setPaymentMethod('cash');
  };

  // Fetch total credit (optional check)
  const checkCredit = async () => {
    if (!rfid) {
      setWispayError('Please enter RFID');
      return;
    }
    setIsChecking(true);
    setWispayError(null);
    try {
      const res = await fetch(`${URL}/api/wispay/credit?rfid=${encodeURIComponent(rfid)}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch credit');
      }
      const data = await res.json();
      if (data.success) {
        setCredit(data.credit);
      } else {
        throw new Error(data.error || 'Failed to fetch credit');
      }
    } catch (err) {
      setWispayError(err.message);
      setCredit(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle Wispay payment (allow paying without explicit credit check)
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
      const res = await fetch(`${URL}/api/wispay/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid,
          amount: total.toString(),
          empid: 'POS_USER',
          username: 'POS Operator',
          product_name: cart.map(item => item.name).join(', '),
          quantity: cart.reduce((sum, item) => sum + item.quantity, 0)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const data = await res.json();
      if (data.success) {
        alert(`Payment successful! New balance: ${formatPrice(data.newBalance)}`);
        setCredit(data.newBalance);
        clearAllItems();
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (err) {
      setWispayError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cash payment
  const handleCashPayment = () => {
    alert(`Processing Cash on Delivery for ${formatPrice(calculateTotal())}`);
    clearAllItems();
  };

  return (
    <div className="bg-light p-4 h-100 border-start">
      <h3 className="mb-4">Shopping Cart</h3>
      {cart.length === 0 ? (
        <Alert variant="info">Your cart is empty</Alert>
      ) : (
        <>
          <ListGroup className="overflow-auto" style={{ maxHeight: '60vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.overflow-auto::-webkit-scrollbar { display: none; }`}</style>
            {cart.map(item => (
              <ListGroup.Item key={item.id} className="p-3">
                <div className="d-flex justify-content-between">
                  <div className="flex-grow-1 pe-3" style={{ minWidth: 0 }}>
                    <div className="fw-bold text-truncate" title={item.name}>{item.name}</div>
                    <div className="text-muted small">{formatPrice(item.price)} each</div>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <div className="d-flex align-items-center mb-2">
                      <Button variant="outline-secondary" size="sm" className="px-2 py-0" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                      <span className="mx-2" style={{ minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <Button variant="outline-secondary" size="sm" className="px-2 py-0" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="fw-bold me-2">{formatPrice((parseFloat(item.price) || 0) * item.quantity)}</span>
                      <Button variant="outline-danger" size="sm" className="px-2 py-0" onClick={() => removeFromCart(item.id)}>×</Button>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="d-flex justify-content-between mb-3">
              <span>Total:</span>
              <span className="text-primary fw-bold">{formatPrice(calculateTotal())}</span>
            </h4>

            <div className="mb-4">
              <h5 className="fw-bold mb-3 text-center">Select Payment Method</h5>
              <ButtonGroup className="w-100 mb-3">
                <Button variant={paymentMethod === 'cash' ? 'primary' : 'outline-primary'} onClick={() => setPaymentMethod('cash')} className="py-2 d-flex align-items-center justify-content-center"><i className="bi bi-cash-coin me-3"></i><span>Cash</span></Button>
                <Button variant={paymentMethod === 'wispay' ? 'success' : 'outline-success'} onClick={() => setPaymentMethod('wispay')} className="py-2 d-flex align-items-center justify-content-center"><i className="bi bi-credit-card me-3"></i><span>Wispay</span></Button>
              </ButtonGroup>

              {paymentMethod === 'wispay' && (
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
                    <button className="btn btn-outline-secondary" type="button" onClick={checkCredit} disabled={isChecking}>{isChecking ? 'Checking...' : 'Check Credit'}</button>
                  </div>
                  {credit !== null && <div className="mt-2 text-end"><strong>Available Credit:</strong> {formatPrice(credit)}</div>}
                  {wispayError && <Alert variant="danger" className="mt-2" dismissible onClose={() => setWispayError(null)}>{wispayError}</Alert>}
                </div>
              )}
            </div>

            <Button
              variant={paymentMethod === 'cash' ? 'primary' : 'success'}
              className="w-100 py-1 fw-bold d-flex align-items-center justify-content-center"
              size="lg"
              onClick={paymentMethod === 'cash' ? handleCashPayment : handleWispayPayment}
              disabled={paymentMethod === 'wispay' && (!rfid || isProcessing)}
            >
              {isProcessing ? <span>Processing...</span> : paymentMethod === 'cash' ? <><i className="bi bi-check-circle me-2"></i><span>Place Order (Pay with Cash)</span></> : <><i className="bi bi-lock-fill me-2"></i><span>Place Order (Pay with Wispay)</span></>}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
