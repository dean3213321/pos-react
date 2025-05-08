// src/components/Cart.js
import React from 'react';
import { ListGroup, Button, Alert } from 'react-bootstrap';

const Cart = ({ cart, formatPrice, removeFromCart, calculateTotal }) => {
  return (
    <div className="bg-light p-4 h-100 border-start">
      <h3 className="mb-4">Shopping Cart</h3>
      {cart.length === 0 ? (
        <Alert variant="info">Your cart is empty</Alert>
      ) : (
        <>
          <ListGroup>
            {cart.map(item => (
              <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{item.name}</strong>
                  <div className="text-muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </div>
                </div>
                <div>
                  <span className="fw-bold me-2">
                    {formatPrice((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}
                  </span>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ×
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="d-flex justify-content-between">
              <span>Total:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </h4>
            <Button variant="success" className="w-100 mt-3" size="lg">
              Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;