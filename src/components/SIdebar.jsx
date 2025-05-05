import React, { useState, useEffect } from "react";

const Sidebar = ({ onSelect = () => {} }) => {
  const [categories, setCategories] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const URl = process.env.REACT_APP_URL || '';
        const response = await fetch(`${URl}/api/categories`);
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

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  if (loading) return (
    <div className="d-flex flex-column p-3" style={{ 
      width: 240, 
      backgroundColor: "#f8f9fa", 
      height: "100vh",
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)" // Added shadow
    }}>
      <div className="text-center">Loading categories...</div>
    </div>
  );

  if (error) return (
    <div className="d-flex flex-column p-3" style={{ 
      width: 240, 
      backgroundColor: "#f8f9fa", 
      height: "100vh",
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)" // Added shadow
    }}>
      <div className="text-danger">Error: {error}</div>
    </div>
  );

  return (
    <div style={{ 
      width: 240, 
      backgroundColor: "#f8f9fa", 
      height: "100vh",
      display: 'flex',
      flexDirection: 'column',
      boxShadow: "2px 0px 20px rgba(1, 1, 1, 1.1)" // Added shadow
    }}>
      <div style={{
        padding: '1rem',
        flexShrink: 0,
        borderBottom: '1px solid #dee2e6'
      }}>
        <h5 className="text-center mb-0">Categories</h5>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} className="hide-scrollbar">
        {categories.map(category => (
          <div 
            key={category.id} 
            className={`card mb-3 ${activeId === category.id ? "border-primary" : ""}`} 
            role="button"
            onClick={() => {
              setActiveId(category.id);
              onSelect(category);
            }}
            style={{
              minHeight: '80px',
              touchAction: 'manipulation',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div style={{ 
              height: 80, 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <img 
                src={`${process.env.REACT_APP_URL}${category.photo_path}`}
                className="card-img-top" 
                alt={category.name}
                style={{ 
                  height: '100%',
                  width: '100%',
                  objectFit: 'contain',
                  display: category.photo_path ? 'block' : 'none'
                }}
                onError={handleImageError}
              />
              <div style={{
                display: !category.photo_path ? 'flex' : 'none',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e9ecef',
                fontSize: '1.2rem'
              }}>
                <span>{category.name}</span>
              </div>
            </div>
            <div className="card-body py-1 px-2">
              <h6 className="card-title mb-0 text-center" style={{
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                {category.name}
              </h6>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add this to your CSS or style component
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

export default Sidebar;

// Add the style to the head
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);