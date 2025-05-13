/* Sidebar.jsx */
import React, { useState, useEffect } from "react";
import { Nav, Card, Spinner, Alert, Image } from 'react-bootstrap';
import '../styling/Sidebar.css';

const Sidebar = ({ onSelect = () => {} }) => {
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const URL = process.env.REACT_APP_URL || '';
        const response = await fetch(`${URL}/api/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setActiveId(data[0].id);
          onSelect(data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [onSelect]);

  const handleClick = (category) => {
    setActiveId(category.id);
    onSelect(category);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-light vh-100">
        <Alert variant="danger">Error: {error}</Alert>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column bg-light vh-100 border-end" style={{ width: '250px' }}>
      <div className="p-3 border-bottom">
        <h5 className="text-center mb-0">Categories</h5>
      </div>
      <div className="flex-grow-1 overflow-auto no-scrollbar">
        <Nav className="flex-column p-3">
          {categories.map(category => {
            const isActive = activeId === category.id;
            return (
              <Nav.Item key={category.id} className="mb-2">
                <Card 
                  onClick={() => handleClick(category)}
                  className={`category-card ${isActive ? 'active' : ''}`}
                  role="button"
                >
                  {category.photo_path ? (
                    <Card.Img 
                      as={Image}
                      variant="top"
                      src={`${process.env.REACT_APP_URL}${category.photo_path}`}
                      alt={category.name}
                      onError={(e) => e.currentTarget.style.display = 'none'}
                      style={{ objectFit: 'contain', height: '80px' }}
                    />
                  ) : (
                    <div className="placeholder-icon">
                      {category.name}
                    </div>
                  )}
                  <Card.Body className="py-2 px-1 text-center">
                    <Card.Title as="h6" className="mb-0">
                      {category.name}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Nav.Item>
            );
          })}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;