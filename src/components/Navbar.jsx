import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/nav-logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import LoginModal from "../modals/LoginModal.jsx";
import { useAuth } from "./AuthContext.jsx";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname === "/admin";

  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const menuRef = useRef();

  const handleShowLogin = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  const handleSettings = () => {
    setShowMenu(false);
    navigate('/settings'); // ensure this route exists
  };

  useEffect(() => {
    const onBodyClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", onBodyClick);
    return () => document.removeEventListener("mousedown", onBodyClick);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#502d77" }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
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

          <div className="position-relative" ref={menuRef}>
            <div
              onClick={isAuthenticated ? toggleMenu : handleShowLogin}
              className="d-flex align-items-center hover-icon"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-person-circle fs-1 text-white"></i>
            </div>

            {isAuthenticated && showMenu && (
              <ul
                className="dropdown-menu show"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0px",
                  transform: "translateY(4px)",
                  minWidth: "180px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  animation: "fadeIn 0.15s ease-out",
                  zIndex: 1000,
                }}
              >
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={handleSettings}
                  >
                    <i className="bi bi-gear fs-5"></i>
                    Settings
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right fs-5"></i>
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      <LoginModal show={showLogin} handleClose={handleCloseLogin} />

      {/* Additional styles for hover and animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .dropdown-item:hover {
            background-color: rgba(0,0,0,0.10);
            transition: background-color 0.5s, transform 0.5s;
          }
          .hover-icon:hover i {
            color: #e0e0e0;
            transform: scale(1.2);
            transition: transform 0.2s, color 0.2s;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;
