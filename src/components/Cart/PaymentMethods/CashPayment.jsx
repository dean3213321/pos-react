import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const URL = process.env.REACT_APP_URL;

const CashPayment = ({ cart, calculateTotal, formatPrice, onOrderSuccess, clearAllItems }) => {
  const [isProcessing, setIsProcessing] = useState(false);

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
        paymentType: 'Cash',
        total
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data.orderNumber;
  };

  const handleCashPayment = async () => {
  const total = calculateTotal();
  const itemsList = cart.map(item => 
    `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
  ).join('\n');

  const confirmationMessage = `🛒 CASH PAYMENT CONFIRMATION 🛒
─────────────────────────
ITEMS:
${itemsList}
─────────────────────────
TOTAL: ${formatPrice(total)}
─────────────────────────
OK to confirm order or Cancel to abort`;

  if (!window.confirm(confirmationMessage)) {
    return;
  }

  setIsProcessing(true);
  try {
    const orderNumber = await submitOrder();
    onOrderSuccess();
    alert(`🛒 CASH ORDER CONFIRMED 🛒
─────────────────────────
ORDER #: ${orderNumber}
ITEMS:
${itemsList}
─────────────────────────
TOTAL: ${formatPrice(total)}
STATUS: 🟡 Preparing
─────────────────────────
Please keep your receipt`);
    clearAllItems();
  } catch (err) {
    alert(err.message);
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <Button
      variant="primary"
      className="w-100 py-1 fw-bold d-flex align-items-center justify-content-center"
      size="lg"
      onClick={handleCashPayment}
      disabled={cart.length === 0 || isProcessing}
    >
      {isProcessing ? 'Processing…' : (
        <>
          <i className="bi bi-check-circle me-2"></i>
          <span>Place Order (Pay with Cash)</span>
        </>
      )}
    </Button>
  );
};

export default CashPayment;