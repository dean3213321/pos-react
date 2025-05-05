import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/nav-logo.png";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return ( 
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#502d77" }}>
      <div className="container-fluid">
        {/* Brand/Logo */}
        <div className="d-flex align-items-center">
          <img 
            src={logo} 
            alt="Company Logo" 
            height="55"
            className="d-inline-block align-top me-2"
          />
        </div>
        
        {/* Toggle between icon-only and text+icon */}
        <div className="d-flex align-items-center">
          <Link 
            to={isAdminPage ? "/" : "/admin"} 
            className="text-decoration-none d-flex align-items-center" 
            style={{ cursor: 'pointer' }}
          >
            {/* Text appears on left when in admin mode */}
            {isAdminPage && (
              <span className="text-white me-2">Admin</span>
            )}
            <i className="bi bi-person-circle fs-1 text-white"></i>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;