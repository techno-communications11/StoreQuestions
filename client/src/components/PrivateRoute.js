import React from 'react';
import { Navigate } from 'react-router-dom'; //importing naviage for  navigating betweeb pages

const PrivateRoute = ({ children, isAuthenticated }) => { //es6 function or callback function as called
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute; //export privaterouter so that  we can use it in other pages
