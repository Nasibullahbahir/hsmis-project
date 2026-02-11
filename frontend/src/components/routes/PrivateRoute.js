import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../../services/auth';

const PrivateRoute = ({ children }) => {
  const user = AuthService.getCurrentUser();
  const token = AuthService.getToken();
  
  // Check if user is authenticated and token exists
  if (!user || !token) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  // Optional: Check if token is expired (you can implement this in AuthService)
  // const isTokenExpired = AuthService.isTokenExpired();
  // if (isTokenExpired) {
  //   AuthService.logout();
  //   return <Navigate to="/login" replace />;
  // }
  
  // User is authenticated, render the children
  return children;
};

export default PrivateRoute;