import React, { useState, useMemo } from 'react';
import { Button, Modal, ListGroup, Spinner } from 'react-bootstrap'; // Added Modal, ListGroup, Spinner

const URL = process.env.REACT_APP_URL || 'http://localhost:5000'; // Fallback for local dev

const CashPayment = ({ cart, calculateTotal, formatPrice, onOrderSuccess, clearAllItems }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [orderData, setOrderData] = useState(null); // To store order number and details for success modal
  const [errorMessage, setErrorMessage] = useState('');

  // Memoize these values to avoid recalculating on every render unless cart changes
  const total = useMemo(() => calculateTotal(), [cart, calculateTotal]);
  const itemsListDisplay = useMemo(() => (
    cart.map(item => (
      <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center border-0 px-0">
        <span>{item.quantity}x {item.name}</span>
        <span>{formatPrice(item.price * item.quantity)}</span>
      </ListGroup.Item>
    ))
  ), [cart, formatPrice]);

  const itemsForApi = useMemo(() => (
    cart.map(i => ({
      id: i.id,
      quantity: i.quantity,
      price: i.price,
      name: i.name
    }))
  ), [cart]);

  const submitOrder = async () => {
    const res = await fetch(`${URL}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: itemsForApi,
        paymentType: 'Cash',
        total
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data; // Return the whole data object which might contain orderNumber and other details
  };

  const handleOpenConfirmModal = () => {
    if (cart.length === 0) return;
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmOrder = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    try {
      const result = await submitOrder(); // Expecting { orderNumber: '...', ... }
      setOrderData({
        orderNumber: result.orderNumber, // Ensure your API returns orderNumber
        itemsDisplay: itemsListDisplay, // Use the pre-rendered items list
        total: total,
      });
      onOrderSuccess();
      setShowSuccessModal(true);
      // clearAllItems(); // Moved to after success modal is closed for better UX
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setOrderData(null);
    clearAllItems(); // Clear items after user acknowledges the success
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  return (
    <>
      <Button
        variant="primary"
        className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center" // py-3 for more height
        size="lg"
        onClick={handleOpenConfirmModal}
        disabled={cart.length === 0 || isProcessing}
      >
        {isProcessing ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Processing…
          </>
        ) : (
          <>
            <i className="bi bi-cash-coin me-2 fs-4"></i> {/* Changed icon */}
            <span>Place Order (Pay with Cash)</span>
          </>
        )}
      </Button>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cart-check me-2"></i>Confirm Cash Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please review your order before confirming:</p>
          <ListGroup variant="flush" className="mb-3">
            {itemsListDisplay}
          </ListGroup>
          <hr />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span>TOTAL:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            <i className="bi bi-x-circle me-1"></i>Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmOrder}>
            <i className="bi bi-check-circle-fill me-1"></i>Confirm Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      {orderData && (
        <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered backdrop="static">
          <Modal.Header> {/* No closeButton here, force user to click OK */}
            <Modal.Title className="text-success">
              <i className="bi bi-patch-check-fill me-2"></i>Cash Order Confirmed!
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
            <ListGroup variant="flush" className="mb-3 mt-1 order-items-scrollable">
              {orderData.itemsDisplay}
            </ListGroup>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5 mb-2">
              <span>TOTAL:</span>
              <span>{formatPrice(orderData.total)}</span>
            </div>
            <div className="alert alert-warning d-flex align-items-center" role="alert">
                <i className="bi bi-hourglass-split me-2 fs-4"></i>
                <div>
                    <strong>STATUS:</strong> Preparing
                </div>
            </div>
            <p className="mt-3 text-muted small">Please keep this confirmation for your records. You will pay upon pickup/delivery.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseSuccessModal} className="w-100">
              <i className="bi bi-hand-thumbs-up me-1"></i>OK
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      
      {/* CSS for scrollable items in success modal if list is long */}
      <style jsx global>{`
        .order-items-scrollable {
          max-height: 200px; /* Adjust as needed */
          overflow-y: auto;
        }
      `}</style>

      {/* Error Modal */}
      <Modal show={showErrorModal} onHide={handleCloseErrorModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>Order Failed
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>There was an issue placing your order:</p>
          <p className="text-danger">{errorMessage}</p>
          <p>Please try again or contact support if the problem persists.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseErrorModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CashPayment;