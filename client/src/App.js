import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Login } from './components/Login';
import { Register } from './components/Register';
import PrivateRoute from './components/PrivateRoute';
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
import { jwtDecode } from 'jwt-decode';
import MngEvg from './components/MngEng';
import Morning from './components/Morning';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [role, setRole] = useState(null);
  const [marketname, setMarketname] = useState('');
  const [storename, setStorename] = useState('');
 
 

 

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      // const isAuthenticatedFromStorage = localStorage.getItem('isAuthenticated');
      const isVerifiedFromStorage = localStorage.getItem('isVerified');

      if (token && typeof token === 'string') {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            setIsAuthenticated(true);
            setRole(decodedToken.role); // Set role from token
          } else {
            handleLogout(); // Token expired
          }
        } catch (error) {
          console.error('Token decode error:', error);
          handleLogout(); // Invalid token
        }
      } else {
        console.error('Invalid or missing token:', token);
        handleLogout(); // Invalid token
      }

      if (isVerifiedFromStorage === 'true') {
        setIsVerified(true);
      }
    };

    checkAuth();
  }, []);

  // Redirect to respective dashboard based on role
  useEffect(() => {
    if (isAuthenticated && role) {
      switch (role) {
        case 'admin':
          if (window.location.pathname !== '/storedashboard') {
            <Navigate to="/storedashboard" replace />;
          }
          break;
        case 'district_manager':
          if (window.location.pathname !== '/dmdashboard') {
            <Navigate to="/dmdashboard" replace />;
          }
          break;
        case 'market_manager':
          if (window.location.pathname !== '/marketdashboard') {
            <Navigate to="/marketdashboard" replace />;
          }
          break;
        default:
          if (window.location.pathname !== '/') {
            <Navigate to="/" replace />;
          }
          break;
      }
    }
  }, [isAuthenticated, role]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isVerified');
    setIsAuthenticated(false);
    setIsVerified(false);
    setRole(null);
  };

  // Handle login
  const handleLogin = (token) => {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token received:', token);
      handleLogout();
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setIsAuthenticated(true);
      setRole(decodedToken.role); // Set role from token
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      console.error('Login error:', error);
      handleLogout();
    }
  };

  // Handle verification
  const handleVerify = () => {
    setIsVerified(true);
    localStorage.setItem('isVerified', 'true');
  };

  return (
    <BrowserRouter>
      {/* Render Navbar only if authenticated */}
      {isAuthenticated && <Navbar onLogout={handleLogout} role={role} />}

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              role === 'admin' ? (
                <Navigate to="/storedashboard" replace />
              ) : role === 'district_manager' ? (
                <Navigate to="/dmdashboard" replace />
              ) : role === 'market_manager' ? (
                <Navigate to="/marketdashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Register />
            </PrivateRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              role === 'admin' ? (
                <Navigate to="/storedashboard" replace />
              ) : role === 'district_manager' ? (
                <Navigate to="/dmdashboard" replace />
              ) : role === 'market_manager' ? (
                <Navigate to="/marketdashboard" replace />
              ) : (
                <UserHome onverify={handleVerify} />
              )
            ) : (
              <UserHome onverify={handleVerify} />
            )
          }
        />
        <Route
          path="/admindashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AdminDashboard setMarketname={setMarketname} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dmdashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <DMDashboard setStorename={setStorename} />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketdashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <MarketDashboard setStorename={setStorename} />
            </PrivateRoute>
          }
        />
        <Route
          path="/mngevg"
          element={<MngEvg onverify={handleVerify} />}
        />
        <Route
          path="/morning"
          element={
            isVerified || localStorage.getItem('isVerified') ? (
              <Morning />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/createquestions"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <CreateQuestions />
            </PrivateRoute>
          }
        />
        <Route
          path="/uploadeddata"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UploadedData />
            </PrivateRoute>
          }
        />
        <Route
          path="/storedashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <StoreDashboard marketname={marketname} setStorename={setStorename} />
            </PrivateRoute>
          }
        />
        <Route
          path="/detaileddata"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <DetailedData storename={storename} />
            </PrivateRoute>
          }
        />
        <Route
          path="/msupload"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <MarketStructure />
            </PrivateRoute>
          }
        />
        <Route
          path="/questions"
          element={
            isVerified || localStorage.getItem('isVerified') ? (
              <Evening />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/compliancequestions"
          element={
            isVerified || localStorage.getItem('isVerified') ? (
              <ComplianceQuestions />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/resetpassword"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UpdatePassword />
            </PrivateRoute>
          }
        />
        <Route
          path="/credentials"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Credentials />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;