import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import PrivateRoute from "./components/PrivateRoute";
import MarketStructure from './components/MarketStructure';
import Questions from './components/Questions';
import UpdatePassword from './components/updatepassword';
import UserHome from './components/UserHome';
import Crediantals from './components/Credentials';
import ComplianceQuestions from './components/ComplainceQuestions'
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Function to update authentication state
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleVerify = () => {
    setIsVerified(true);
    localStorage.setItem('isVerified', isVerified)
  };

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* Private route for user home */}
        <Route
          path="/userhome"
          element={<PrivateRoute element={<UserHome onverify={handleVerify} />} />}
        />

        {/* Private route for market structure */}
        <Route
          path="/msupload"
          element={<PrivateRoute element={<MarketStructure />} />}
        />

        {/* Conditional routing based on isVerified */}
        <Route
          path="/questions"
          element={(isVerified || localStorage.getItem('isVerified'))
            ? <PrivateRoute element={<Questions />} />
            : <Navigate to="/userhome" />}
        />
        <Route
          path="/compleincequestions"
          element={(isVerified || localStorage.getItem('isVerified'))
            ? <PrivateRoute element={<ComplianceQuestions />} />
            : <Navigate to="/userhome" />}
        />

        {/* Private route for reset password */}
        <Route
          path="/resetpassword"
          element={<PrivateRoute element={<UpdatePassword />} />}
        />
         <Route
          path="/admindashboard"
          element={<PrivateRoute element={<AdminDashboard />} />}
        />

        {/* Private route for credentials */}
        <Route
          path="/crediantals"
          element={<PrivateRoute element={<Crediantals />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
