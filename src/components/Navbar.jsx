import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/nav-logo.png";

const Navbar = () => {
    return ( 
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#502d77" }}>
            <div className="container-fluid">
                {/* Brand/Logo on the left */}
                <div className="d-flex align-items-center">
                    <img 
                        src={logo} 
                        alt="Company Logo" 
                        height="55"
                        className="d-inline-block align-top me-2"
                    />
                </div>
                
                {/* User section on the right */}
                <div className="d-flex align-items-center">
                    <div className="dropdown">
                        <i className="bi bi-person-circle fs-1 text-white"></i>
                    </div>
                </div>
            </div>
        </nav>
    );
}
 
export default Navbar;