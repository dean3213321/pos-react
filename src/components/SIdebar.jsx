// src/components/Sidebar.jsx
import React, { useState } from "react";

const Sidebar = ({ 
  items = [],               // [{ id, title, imgSrc }]
  onSelect = () => {}       // (item) => void
}) => {
  const [activeId, setActiveId] = useState(items.length ? items[0].id : null);

  const handleClick = (item) => {
    setActiveId(item.id);
    onSelect(item);
  };

  return (
    <div 
      className="d-flex flex-column p-3" 
      style={{ width: 240, backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      {items.map(item => (
        <div 
          key={item.id} 
          className={`card mb-2 ${activeId === item.id ? "border-primary" : ""}`} 
          role="button"
          onClick={() => handleClick(item)}
        >
          <img 
            src={item.imgSrc} 
            className="card-img-top" 
            alt={item.title} 
            style={{ height: 60, objectFit: "contain" }}
          />
          <div className="card-body py-2 px-2">
            <h6 className="card-title mb-0 text-center">
              {item.title}
            </h6>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
