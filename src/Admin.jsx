import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Admin = () => {
  const navigate = useNavigate();

  const boxes = [
    {
      title: "Category",
      description: "Manage food categories",
      path: "/category",
      icon: "📋",
      color: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    },
    {
      title: "Items",
      description: "Manage menu items",
      path: "/items",
      icon: "🍽️",
      color: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)"
    },
    {
      title: "Transactions",
      description: "View order history and receipts",
      path: "/Transactions",
      icon: "🧾",
      color: "linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)"
    },
    {
      title: "Top-up",
      description: "Add credit to user accounts",
      path: "/Wispay",
      icon: "💳",
      color: "linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)"
    },
    {
      title: "Screencast",
      description: "View kitchen screen",
      path: "/screencast",
      icon: "📺",
      color: "linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)"
    }
  ];

  const handleBoxClick = (path) => {
    navigate(path);
  };

  return (
    <div className="p-4">
      <div className="d-flex flex-wrap gap-4">
        {boxes.map((box, index) => (
          <div
            key={index}
            className="p-3 rounded-3 border-0 shadow-sm cursor-pointer"
            style={{
              width: '370px',
              height: '200px',
              background: box.color,
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onClick={() => handleBoxClick(box.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.075)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: '3rem' }}>{box.icon}</div>
              <h3>{box.title}</h3>
              <p>{box.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
