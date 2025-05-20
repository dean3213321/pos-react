import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button, Modal, ListGroup, Spinner } from 'react-bootstrap';

const URL = process.env.REACT_APP_URL || 'http://localhost:5000';

const WispayPayment = ({ cart, calculateTotal, formatPrice, onOrderSuccess, clearAllItems }) => {
  const [rfid, setRfid] = useState('');
  const [credit, setCredit] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderData, setOrderData] = useState(null);
  const rfidInputRef = useRef(null);

  useEffect(() => {
    rfidInputRef.current?.focus();
  }, []);

  const total = useMemo(() => calculateTotal(), [calculateTotal]);

  const itemsListDisplay = useMemo(() => (
    cart.map(item => (
      <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center border-0 px-0">
        <span>{item.quantity}x {item.name}</span>
        <span>{formatPrice(item.price * item.quantity)}</span>
      </ListGroup.Item>
    ))
  ), [cart, formatPrice]);

  const itemsForApi = useMemo(() => (
    cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price, name: i.name }))
  ), [cart]);

  const checkCredit = async () => {
    if (!rfid) {
      setErrorMessage('Please enter RFID');
      setShowErrorModal(true);
      return;
    }
    setIsChecking(true);
    setErrorMessage('');
    try {
      const res = await fetch(`${URL}/api/wispay/credit?rfid=${encodeURIComponent(rfid)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch credit');
      setCredit(data.credit);
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred while checking credit.');
      setShowErrorModal(true);
      setCredit(null);
    } finally {
      setIsChecking(false);
    }
  };

  const submitOrder = async () => {
    const res = await fetch(`${URL}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsForApi, paymentType: 'Wispay', rfid, total }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data;
  };

  const handleOpenConfirmModal = () => {
    if (!rfid || cart.length === 0) return;
    setShowConfirmModal(true);
  };
  const handleCloseConfirmModal = () => setShowConfirmModal(false);

  const handleConfirmOrder = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const paymentRes = await fetch(`${URL}/api/wispay/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid,
          amount: total.toString(),
          empid: process.env.REACT_APP_EMP_ID || 'POS_USER',
          username: process.env.REACT_APP_EMP_USERNAME || 'POS Operator',
          product_name: cart.map(i => i.name).join(', '),
          quantity: cart.reduce((s, i) => s + i.quantity, 0),
        }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok || !paymentData.success) throw new Error(paymentData.error || 'Payment failed');

      const orderResult = await submitOrder();

      setOrderData({
        orderNumber: orderResult.orderNumber,
        itemsDisplay: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        newBalance: paymentData.newBalance
      });
      onOrderSuccess();
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred while processing your payment. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setOrderData(null);
    clearAllItems();
  };
  const handleCloseErrorModal = () => setShowErrorModal(false);

  return (
    <>
      <div className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter RFID"
            value={rfid}
            onChange={e => setRfid(e.target.value)}
            ref={rfidInputRef}
            disabled={isChecking}
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
      </div>

      <Button
        variant="success"
        className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center"
        size="lg"
        onClick={handleOpenConfirmModal}
        disabled={cart.length === 0 || !rfid || isProcessing}
      >
        {isProcessing ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
            Processing…
          </>
        ) : (
          <>
            <i className="bi bi-lock-fill me-2"></i>
            <span>Place Order (Pay with Wispay)</span>
          </>
        )}
      </Button>

      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-credit-card-2-front me-2"></i>Confirm Wispay Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please review and confirm payment:</p>
          <ListGroup variant="flush" className="mb-3">
            {itemsListDisplay}
          </ListGroup>
          <div className="d-flex justify-content-between mb-2">
            <span><strong>Order Total:</strong></span>
            <span>{formatPrice(total)}</span>
          </div>
          {credit !== null && (
            <>
              <div className="d-flex justify-content-between mb-2">
                <span><strong>Current Balance:</strong></span>
                <span>{formatPrice(credit)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span><strong>New Balance:</strong></span>
                <span>{formatPrice(credit - total)}</span>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            <i className="bi bi-x-circle me-1"></i>Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmOrder} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Processing…
              </>
            ) : (
              <>
                <i className="bi bi-check-circle-fill me-1"></i>Confirm Payment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {orderData && (
        <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered backdrop="static">
          <Modal.Header>
            <Modal.Title className="text-success">
              <i className="bi bi-patch-check-fill me-2"></i>Wispay Order Confirmed!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="fs-5">Your order has been placed successfully.</p>
            <ListGroup variant="flush" className="mb-3">
              <ListGroup.Item className="px-0">
                <strong>ORDER #:</strong> {orderData.orderNumber}
              </ListGroup.Item>
            </ListGroup>
            <strong>ITEMS:</strong>
            <ListGroup variant="flush" className="mb-3 order-items-scrollable">
              {orderData.itemsDisplay.map(item => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center border-0 px-0">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <div className="d-flex justify-content-between fw-bold fs-5 mb-2">
              <span>TOTAL:</span><span>{formatPrice(orderData.total)}</span>
            </div>
            {orderData.newBalance !== undefined && (
              <div className="d-flex justify-content-between fw-bold fs-5 mb-2">
                <span>NEW BALANCE:</span><span>{formatPrice(orderData.newBalance)}</span>
              </div>
            )}
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <i className="bi bi-hourglass-split me-2 fs-4"></i>
              <div><strong>STATUS:</strong> Preparing</div>
            </div>
            <p className="mt-3 text-muted small">
              Please keep this confirmation for your records.{credit !== null ? ' Your balance has been updated.' : ''}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseSuccessModal} className="w-100">
              <i className="bi bi-hand-thumbs-up me-1"></i>OK
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal show={showErrorModal} onHide={handleCloseErrorModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>Payment Failed
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>There was an issue processing your Wispay payment:</p>
          <p className="text-danger">{errorMessage}</p>
          <p>Please try again or contact support if the problem persists.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseErrorModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      <style jsx global>{`
        .order-items-scrollable { max-height: 200px; overflow-y: auto; }
      `}</style>
    </>
  );
};

export default WispayPayment;
