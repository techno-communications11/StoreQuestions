import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; //used for decoding the token

const Navbar = ({ onLogout }) => {  // Destructure onLogout from props
  const [isOpen, setIsOpen] = useState(false); // for navbar open or not when collapse

  const handleLogout = () => {
    onLogout();   // Call the onLogout function passed as prop
    localStorage.clear(); // Clears the local storage
    window.location.href = "/"; // Redirect to the home page
  };

  const token = localStorage.getItem("token"); //get token from localstorage
  let role = ""; //set role empty

  if (token) { //check token present or not
    try {  //error handling try will had code that used to check errors if errors throws to catch
      const decodedToken = jwtDecode(token); //decoding the  token using jwtdecode
      role = decodedToken.role;  // Set role from the decoded token
    } catch (error) { //catching the error
      console.error("Invalid token:", error); // consoling the error
    }
  }

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
                : "/userhome"
            }
          >
            Techno Communications LLC
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)} //when clicked on hamberger icon the  list items open or collapse
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} //conditional rendering for collapse 
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            {role === "user" && (
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/uploadeddata">
                  Uploaded Data
                </Link>
              </li>
            )}

            {role === "admin" && ( //nav links for admin role
              <>
              
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/createquestions">
                    Questions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/msupload">
                    Market Structure
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/credentials">
                    Credentials
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/resetpassword">
                    Reset Password
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <button
                className="btn btn-danger mx-2 btn-small"
                onClick={handleLogout} //logout  on click event
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
