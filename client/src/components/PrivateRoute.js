import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, ...rest }) => {
  const token = localStorage.getItem("token");

  // If there's no token, redirect to home or login
  if (!token) {
    return <Navigate to="/" />;
  }

  // If there's a token, return the element (component) passed as a prop
  return element;
};

export default PrivateRoute;