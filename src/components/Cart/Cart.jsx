import React, { useState, useRef, useEffect } from 'react';
import { ListGroup, Alert } from 'react-bootstrap';
import CartItem from './CartItem';
import PaymentSelector from './PaymentMethods/PaymentSelector';

const URL = process.env.REACT_APP_URL;

const Cart = ({
  cart,
  formatPrice,
  removeFromCart,
  calculateTotal,
  updateQuantity,
  onOrderSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const cartRef = useRef(cart);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const clearAllItems = () => {
    cart.forEach(item => removeFromCart(item.id));
    setPaymentMethod('cash');
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
              <CartItem
                key={item.id}
                item={item}
                formatPrice={formatPrice}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                cartRef={cartRef}
              />
            ))}
          </ListGroup>

          <PaymentSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cart={cart}
            calculateTotal={calculateTotal}
            formatPrice={formatPrice}
            onOrderSuccess={onOrderSuccess}
            clearAllItems={clearAllItems}
          />
        </>
      )}
    </div>
  );
};

export default Cart;