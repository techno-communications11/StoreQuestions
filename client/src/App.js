// App.js (minor tweak for clarity)
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import PrivateRoute from './components/PrivateRoute';
import MarketStructure from './components/FileUploads/MarketStructure';
import Evening from './components/Useruploads/Evening';
import UpdatePassword from './components/Auth/updatepassword';
import UserHome from './components/LandingPages/UserHome';
import Credentials from './components/FileUploads/Credentials';
import ComplianceQuestions from './components/Useruploads/ComplianceQuestions';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import StoreDashboard from './components/AdminD/StoreDashbaord';
import DetailedData from './components/Utils/DetailedData';
import DMDashboard from './components/Dashboards/DMDashboard';
import MarketDashboard from './components/Dashboards/MarketDashboard';
// import UploadedData from './components/Utils/UploadedData';
import CreateQuestions from './components/StoreQuestions/CreateQuestions';
import MngEvg from './components/LandingPages/MngEng';
import Morning from './components/Useruploads/Morning';
import { UserProvider, useUserContext } from './components/Auth/UserContext';

const AppContent = () => {
  const { userData, isAuthenticated, setUserData, setIsAuthenticated, ntidverify } = useUserContext();

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUserData(null);
    setIsAuthenticated(false);
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/storedashboard';
      case 'district_manager':
        return '/dmdashboard';
      case 'market_manager':
        return '/marketdashboard';
      default:
        return '/';
    }
  };

  return (
    <>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={getDashboardRoute(userData?.role)} replace /> : <Login />}
        />
        <Route
          path="/register"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Register />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={getDashboardRoute(userData?.role)} replace /> : <UserHome />}
        />
        <Route
          path="/admindashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dmdashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <DMDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketdashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <MarketDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/mngevg" element={<MngEvg />} />
        <Route
          path="/morning"
          element={ntidverify ? <Morning /> : <Navigate to="/mngevg" replace />}
        />
        <Route
          path="/createquestions"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <CreateQuestions />
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/uploadeddata"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UploadedData />
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/storedashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <StoreDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/detaileddata"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <DetailedData />
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
          element={ntidverify ? <Evening /> : <Navigate to="/mngevg" replace />}
        />
        <Route
          path="/compliancequestions"
          element={ntidverify ? <ComplianceQuestions /> : <Navigate to="/mngevg" replace />}
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
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;