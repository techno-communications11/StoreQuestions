import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from './components/Home';
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import PrivateRoute from "./components/PrivateRoute";
import { MarketStructureUpload } from './components/MarketStructureUpload';
import NTIDLogin from './components/NTIDLogin';
import Questions from './components/Questions';
import UpdatePassword from './components/updatepassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/msupload" element={<PrivateRoute element={<MarketStructureUpload />} />} />
        <Route path="/ntidllogin" element={<PrivateRoute element={<NTIDLogin />} />} />
        <Route path="/questions" element={<PrivateRoute element={<Questions />} />} />
        <Route path="/resetpassword" element={<PrivateRoute element={<UpdatePassword />} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;