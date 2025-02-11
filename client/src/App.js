import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import PrivateRoute from "./components/PrivateRoute";
import MarketStructure from './components/MarketStructure';
import Evening from './components/Evening';
import UpdatePassword from './components/updatepassword';
import UserHome from './components/UserHome';
import Credentials from './components/Credentials';
import ComplianceQuestions from './components/ComplianceQuestions';
import AdminDashboard from './components/AdminDashboard';
import StoreDashboard from './components/StoreDashbaord';
import DetailedData from './components/DetailedData';
import DMDashboard from './components/DMDashboard';
import MarketDashboard from './components/MarketDashboard';
import UploadedData from './components/UploadedData';
import CreateQuestions from './components/CreateQuestions';
import { jwtDecode } from 'jwt-decode'; // Import the jwt-decode library
import MngEvg from './components/MngEng';
import Morning from './components/Morning';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [role, setRole] = useState(null);
  const [marketname, setMarketname] = useState('');
  const [storename, setStorename] = useState('');

  // Check if user is authenticated and token is valid
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      const isAuthenticatedFromStorage = localStorage.getItem("isAuthenticated");
      const isVerifiedFromStorage = localStorage.getItem("isVerified");

      // Validate token before using it
      if (token && typeof token === 'string') {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            setIsAuthenticated(true);
            setRole(decodedToken.role);
          } else {
            handleLogout(); // Token expired
          }
        } catch (error) {
          console.error("Token decode error:", error);
          handleLogout(); // Invalid token
        }
      } else {
        console.error('Invalid or missing token:', token);
        handleLogout(); // Invalid token
      }

      if (isVerifiedFromStorage === "true") {
        setIsVerified(true);
      }
    };

    checkAuth();
  }, []); // Run on component mount

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isVerified");
    setIsAuthenticated(false);
    setIsVerified(false);
    setRole(null);
  };

  const handleLogin = (token) => {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token received:', token);
      handleLogout();
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setIsAuthenticated(true);
      setRole(decodedToken.role); // Assuming role is stored in the token
      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
    } catch (error) {
      console.error('Login error:', error);
      handleLogout();
    }
  };

  // Fix: Make sure handleVerify is passed to UserHome as onVerify
  const handleVerify = () => {
    setIsVerified(true);
    localStorage.setItem('isVerified', "true");
  };

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar onLogout={handleLogout} role={role} />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? (
          role === 'admin' ? <Navigate to="/admindashboard" replace /> :
          role === 'user' ? <Navigate to="/userhome" replace /> :
          role === 'district_manager' ? <Navigate to="/dmdashboard" replace /> :
          role === 'market_manager' ? <Navigate to="/marketdashboard" replace /> :
          null
        ) : (
          <Login onLogin={handleLogin} />
        )} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/mngevg" element={<PrivateRoute isAuthenticated={isAuthenticated}><MngEvg onverify={handleVerify} /></PrivateRoute>} />
        <Route path="/morning" element={isVerified || localStorage.getItem('isVerified') ? <PrivateRoute isAuthenticated={isAuthenticated}><Morning /></PrivateRoute> : <Navigate to="/userhome" replace />} />

        <Route path="/userhome" element={<PrivateRoute isAuthenticated={isAuthenticated}><UserHome onverify={handleVerify} /></PrivateRoute>} />
        <Route path="/createquestions" element={<PrivateRoute isAuthenticated={isAuthenticated}><CreateQuestions /></PrivateRoute>} />
        <Route path="/uploadeddata" element={<PrivateRoute isAuthenticated={isAuthenticated}><UploadedData /></PrivateRoute>} />
        <Route path="/storedashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><StoreDashboard marketname={marketname} setStorename={setStorename} /></PrivateRoute>} />
        <Route path="/detaileddata" element={<PrivateRoute isAuthenticated={isAuthenticated}><DetailedData storename={storename} /></PrivateRoute>} />
        <Route path="/msupload" element={<PrivateRoute isAuthenticated={isAuthenticated}><MarketStructure /></PrivateRoute>} />
        <Route path="/dmdashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><DMDashboard setStorename={setStorename} /></PrivateRoute>} />
        <Route path="/marketdashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><MarketDashboard setStorename={setStorename} /></PrivateRoute>} />
        <Route path="/questions" element={isVerified || localStorage.getItem('isVerified') ? <PrivateRoute isAuthenticated={isAuthenticated}><Evening /></PrivateRoute> : <Navigate to="/userhome" replace />} />
        <Route path="/compliancequestions" 
        element={isVerified || localStorage.getItem('isVerified') ? 
        <PrivateRoute isAuthenticated={isAuthenticated}><ComplianceQuestions /></PrivateRoute> : <Navigate to="/userhome" replace />} />
        <Route path="/resetpassword" element={<PrivateRoute isAuthenticated={isAuthenticated}><UpdatePassword /></PrivateRoute>} />
        <Route path="/admindashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><AdminDashboard setMarketname={setMarketname} /></PrivateRoute>} />
        <Route path="/credentials" element={<PrivateRoute isAuthenticated={isAuthenticated}><Credentials /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
