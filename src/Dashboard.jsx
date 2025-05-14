/* Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Image, Container, Button } from 'react-bootstrap';
import Cart from './components/Cart.jsx';

const Dashboard = ({ selectedCategory }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchItems = async () => {
        try {
          setLoading(true);
          setError(null);
          const URL = process.env.REACT_APP_URL || '';
          const response = await fetch(`${URL}/api/items?category=${selectedCategory.name}`);
          if (!response.ok) throw new Error('Failed to fetch items');
          const data = await response.json();
          setItems(data.data || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchItems();
    } else {
      setItems([]);
    }
  }, [selectedCategory]);

  const formatPrice = (price) => {
    if (price == null) return 'N/A';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(num) ? 'Invalid Price' : `₱${num.toFixed(2)}`;
  };

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCart(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(newQuantity, 1) }
          : item
      )
    );
  };
  

  const calculateTotal = () =>
    cart.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.quantity, 0);

  return (
    <Container fluid className="py-4 px-4 h-100">
      <Row className="h-100 gx-5 gy-5">
        {/* Items Section */}
        <Col md={8} className="h-100 overflow-auto">
          <div className="mb-3">
            <h2 className="mb-1">
              {selectedCategory ? `${selectedCategory.name} Items` : 'Select a category'}
            </h2>
            {selectedCategory && (
              <p className="text-muted mb-0">
                {items.length} {items.length === 1 ? 'item' : 'items'} found
              </p>
            )}
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">Error: {error}</Alert>
          ) : items.length > 0 ? (
            <Row xs={1} md={2} lg={4} className="g-4">
              {items.map(item => (
                <Col key={item.id}>
                  <Card className="h-100 shadow-sm">
                    <div className="position-relative overflow-hidden" style={{ height: '180px' }}>
                      {item.photo_path ? (
                        <Image
                          src={`${process.env.REACT_APP_URL}${item.photo_path}`}
                          alt={item.name}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                        />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center bg-light text-muted w-100 h-100">
                          No Image Available
                        </div>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column justify-content-between">
                      <div>
                        <Card.Title className="fs-5 mb-2">{item.name}</Card.Title>
                        <Card.Text className="text-success fw-bold fs-6">
                          {formatPrice(item.price)}
                        </Card.Text>
                      </div>
                      <Button variant="primary" className="mt-3 w-100" onClick={() => addToCart(item)}>
                        Add to Cart
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            selectedCategory && <Alert variant="info">No items found in this category</Alert>
          )}
        </Col>

        {/* Cart Section */}
        <Col md={4} className="h-100">
          <Cart
            cart={cart}
            formatPrice={formatPrice}
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
            updateQuantity={updateQuantity} // ✅ Add this
            className="p-3"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
