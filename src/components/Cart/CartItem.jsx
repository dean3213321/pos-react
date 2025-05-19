import React from 'react';
import { ListGroupItem, Button } from 'react-bootstrap';

const INITIAL_HOLD_DELAY = 400;
const RAPID_UPDATE_INTERVAL = 80;

const CartItem = ({ item, formatPrice, removeFromCart, updateQuantity, cartRef }) => {
  const holdTimerRef = React.useRef({
    itemId: null,
    operation: null,
    timeoutId: null,
    intervalId: null,
  });

  const clearHoldTimers = () => {
    if (holdTimerRef.current.timeoutId) clearTimeout(holdTimerRef.current.timeoutId);
    if (holdTimerRef.current.intervalId) clearInterval(holdTimerRef.current.intervalId);
    holdTimerRef.current = { itemId: null, operation: null, timeoutId: null, intervalId: null };
  };

  const handleQuantityButtonMouseDown = (operation) => {
    clearHoldTimers();
    holdTimerRef.current.itemId = item.id;
    holdTimerRef.current.operation = operation;

    const performUpdate = () => {
      const currentItem = cartRef.current.find(i => i.id === holdTimerRef.current.itemId);
      if (!currentItem) {
        clearHoldTimers();
        return;
      }

      if (operation === 'increment' && currentItem.quantity < currentItem.stock) {
        updateQuantity(currentItem.id, currentItem.quantity + 1);
      } else if (operation === 'decrement' && currentItem.quantity > 1) {
        updateQuantity(currentItem.id, currentItem.quantity - 1);
      } else {
        clearHoldTimers();
      }
    };

    performUpdate();

    holdTimerRef.current.timeoutId = setTimeout(() => {
      holdTimerRef.current.intervalId = setInterval(performUpdate, RAPID_UPDATE_INTERVAL);
    }, INITIAL_HOLD_DELAY);
  };

  const handleQuantityButtonMouseUpOrLeave = () => {
    clearHoldTimers();
  };

  return (
    <ListGroupItem className="p-3">
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1 pe-3" style={{ minWidth: 0 }}>
          <div className="fw-bold text-truncate" title={item.name}>{item.name}</div>
          <div className="text-muted small">{formatPrice(item.price)} each</div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <div className="d-flex align-items-center mb-2">
            <Button
              variant="outline-secondary"
              size="sm"
              className="px-2 py-0"
              onMouseDown={() => handleQuantityButtonMouseDown('decrement')}
              onMouseUp={handleQuantityButtonMouseUpOrLeave}
              onMouseLeave={handleQuantityButtonMouseUpOrLeave}
              onTouchStart={(e) => { e.preventDefault(); handleQuantityButtonMouseDown('decrement'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleQuantityButtonMouseUpOrLeave(); }}
              disabled={item.quantity <= 1}
            >−</Button>
            <span className="mx-2" style={{ minWidth: '24px', textAlign: 'center' }}>
              {item.quantity}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              className="px-2 py-0"
              onMouseDown={() => handleQuantityButtonMouseDown('increment')}
              onMouseUp={handleQuantityButtonMouseUpOrLeave}
              onMouseLeave={handleQuantityButtonMouseUpOrLeave}
              onTouchStart={(e) => { e.preventDefault(); handleQuantityButtonMouseDown('increment'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleQuantityButtonMouseUpOrLeave(); }}
              disabled={item.quantity >= item.stock}
            >+</Button>
          </div>
          <div className="text-muted small mb-2">In stock: {item.stock}</div>
          <div className="d-flex align-items-center">
            <span className="fw-bold me-2">{formatPrice(item.quantity * parseFloat(item.price))}</span>
            <Button
              variant="outline-danger"
              size="sm"
              className="px-2 py-0"
              onClick={() => {
                clearHoldTimers();
                removeFromCart(item.id);
              }}
            >×</Button>
          </div>
        </div>
      </div>
    </ListGroupItem>
  );
};

export default CartItem;