// src/components/Dashboard.jsx
import React from "react";

const Dashboard = ({ products = [] }) => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-3">
        {products.map(product => (
          <div key={product.id} className="col-6 col-md-4 col-lg-3">
            <div className="card h-100">
              <img
                src={product.imgSrc}
                className="card-img-top"
                alt={product.title}
                style={{ objectFit: "contain", height: 120 }}
              />
              <div className="card-body d-flex flex-column">
                <h6 className="card-title text-center mb-2">{product.title}</h6>
                <div className="mt-auto text-center fw-bold">
                  ₱{product.price}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
