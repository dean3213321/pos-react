import React from 'react';
import { ButtonGroup, Button, Alert } from 'react-bootstrap';
import CashPayment from './CashPayment';
import WispayPayment from './WispayPayment';

const PaymentSelector = ({
  paymentMethod,
  setPaymentMethod,
  cart,
  calculateTotal,
  formatPrice,
  onOrderSuccess,
  clearAllItems,
}) => {
  return (
    <div className="mt-4 p-3 bg-white rounded border">
      <h4 className="d-flex justify-content-between mb-3">
        <span>Total:</span>
        <span className="text-primary fw-bold">{formatPrice(calculateTotal())}</span>
      </h4>

      <div className="mb-4">
        <h5 className="fw-bold mb-3 text-center">Select Payment Method</h5>
        <ButtonGroup className="w-100 mb-3">
          <Button
            variant={paymentMethod === 'cash' ? 'primary' : 'outline-primary'}
            onClick={() => setPaymentMethod('cash')}
            className="py-2 d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-cash-coin me-3"></i><span>Cash</span>
          </Button>
          <Button
            variant={paymentMethod === 'wispay' ? 'success' : 'outline-success'}
            onClick={() => setPaymentMethod('wispay')}
            className="py-2 d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-credit-card me-3"></i><span>Wispay</span>
          </Button>
        </ButtonGroup>

        {paymentMethod === 'cash' ? (
          <CashPayment
            cart={cart}
            calculateTotal={calculateTotal}
            formatPrice={formatPrice}
            onOrderSuccess={onOrderSuccess}
            clearAllItems={clearAllItems}
          />
        ) : (
          <WispayPayment
            cart={cart}
            calculateTotal={calculateTotal}
            formatPrice={formatPrice}
            onOrderSuccess={onOrderSuccess}
            clearAllItems={clearAllItems}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentSelector;