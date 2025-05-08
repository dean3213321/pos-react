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

  const calculateTotal = () =>
    cart.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.quantity, 0);

  return (
    <Container fluid className="h-100">
      <Row className="h-100">
        <Col md={8} className="h-100 overflow-auto">
          <div className="mb-4">
            <h2>{selectedCategory ? `${selectedCategory.name} Items` : 'Select a category'}</h2>
            {selectedCategory && <p className="text-muted">{items.length} items found</p>}
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">Error: {error}</Alert>
          ) : items.length > 0 ? (
            <Row xs={1} md={1} lg={1} className="g-4">
              {Array.from({ length: Math.ceil(items.length / 3) }).map((_, r) => (
                <Row key={r} className="mb-4">
                  {items.slice(r * 3, r * 3 + 3).map(item => (
                    <Col key={item.id} md={4}>
                      <Card className="h-100 shadow-sm">
                        <div className="position-relative" style={{ height: '150px', overflow: 'hidden' }}>
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
                        <Card.Body>
                          <Card.Title>{item.name}</Card.Title>
                          <Card.Text className="text-success fw-bold">{formatPrice(item.price)}</Card.Text>
                        </Card.Body>
                        <Card.Footer className="bg-white border-0">
                          <Button variant="primary" className="w-100" onClick={() => addToCart(item)}>
                            Add to Cart
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ))}
            </Row>
          ) : (
            selectedCategory && <Alert variant="info">No items found in this category</Alert>
          )}
        </Col>

        <Col md={4}>
          <Cart
            cart={cart}
            formatPrice={formatPrice}
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
