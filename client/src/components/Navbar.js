import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Used for decoding the token

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false); // State for navbar collapse

  const handleLogout = () => {
    onLogout(); // Call the onLogout function passed as prop
    setIsOpen(false); // Close the navbar after logout
  };

  const token = localStorage.getItem("token"); // Get token from local storage
  let role = ""; // Set role empty

  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Decode the token
      role = decodedToken.role; // Set role from the decoded token
    } catch (error) {
      console.error("Invalid token:", error); // Handle token decoding errors
    }
  }

  // Function to close the navbar
  const closeNavbar = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
      <div className="container-fluid m-2">
        <div className="d-flex align-items-center">
          <img src="logo.webp" height={40} alt="Logo" />
          <Link
            className="navbar-brand fw-bold fs-6"
            to={
              role === "admin"
                ? "/admindashboard"
                : role === "district_manager"
                ? "/dmdashboard"
                : role === "market_manager"
                ? "/marketdashboard"
                : null
            }
            onClick={closeNavbar} // Close navbar when logo is clicked
          >
            Techno Communications LLC
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)} // Toggle navbar collapse
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} // Conditional rendering for collapse
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            {/* {role === "user" && (
              <li className="nav-item">
                <Link
                  className="nav-link fw-medium"
                  to="/uploadeddata"
                  onClick={closeNavbar} // Close navbar when link is clicked
                >
                  Uploaded Data
                </Link>
              </li>
            )} */}

            {role === "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/createquestions"
                    onClick={closeNavbar} // Close navbar when link is clicked
                  >
                    Questions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/msupload"
                    onClick={closeNavbar} // Close navbar when link is clicked
                  >
                    Market Structure
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/credentials"
                    onClick={closeNavbar} // Close navbar when link is clicked
                  >
                    Credentials
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/resetpassword"
                    onClick={closeNavbar} // Close navbar when link is clicked
                  >
                    Reset Password
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/register"
                    onClick={closeNavbar} // Close navbar when link is clicked
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <button
                className="btn btn-danger btn-small w-100"
                onClick={handleLogout} // Logout and close navbar
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;