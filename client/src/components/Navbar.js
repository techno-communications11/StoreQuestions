import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../components/Auth/UserContext"; // Correct import

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData } = useUserContext(); // Use context hook
  const userRole = userData?.role; // Get role from context

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

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
            to={getDashboardRoute(userRole)}
            onClick={closeNavbar}
          >
            Techno Communications LLC
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            {/* {userRole === "user" && (
              <li className="nav-item">
                <Link
                  className="nav-link fw-medium"
                  to="/uploadeddata"
                  onClick={closeNavbar}
                >
                  Uploaded Data
                </Link>
              </li>
            )} */}

            {userRole === "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/createquestions"
                    onClick={closeNavbar}
                  >
                    Questions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/msupload"
                    onClick={closeNavbar}
                  >
                    Market Structure
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/credentials"
                    onClick={closeNavbar}
                  >
                    Credentials
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/resetpassword"
                    onClick={closeNavbar}
                  >
                    Reset Password
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/register"
                    onClick={closeNavbar}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            {/* {(userRole === "district_manager" || userRole === "market_manager") && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to={`/${userRole.split('_')[0]}dashboard`}
                    onClick={closeNavbar}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-medium"
                    to="/uploadeddata"
                    onClick={closeNavbar}
                  >
                    Uploaded Data
                  </Link>
                </li>
              </>
            )} */}

            <li className="nav-item mt-2 mt-lg-0 mt-md-0">
              <button
                className="btn btn-danger btn-small w-100"
                onClick={handleLogout}
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

// Helper function for dashboard routes
const getDashboardRoute = (role) => {
  switch (role) {
    case "admin":
      return "/storedashboard";
    case "district_manager":
      return "/dmdashboard";
    case "market_manager":
      return "/marketdashboard";
    default:
      return "/";
  }
};

export default Navbar;