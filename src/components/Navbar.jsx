// src/components/Navbar.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/nav-logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginModal from "../modals/LoginModal.jsx";
import { useAuth } from "./AuthContext.jsx";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname === "/admin";
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const handleShowLogin = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#502d77" }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            {!isAdminPage ? (
              <Link to="/screencast">
                <img 
                  src={logo} 
                  alt="Company Logo" 
                  height="55"
                  className="d-inline-block align-top me-2"
                  style={{ cursor: 'pointer' }}
                />
              </Link>
            ) : (
              <img 
                src={logo} 
                alt="Company Logo" 
                height="55"
                className="d-inline-block align-top me-2"
              />
            )}
          </div>

          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="btn btn-outline-light"
              >
                Logout
              </button>
            ) : (
              <div 
                onClick={handleShowLogin}
                className="text-decoration-none d-flex align-items-center"
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-person-circle fs-1 text-white"></i>
              </div>
            )}
          </div>
        </div>
      </nav>

      <LoginModal show={showLogin} handleClose={handleCloseLogin} />
    </>
  );
};

export default Navbar;