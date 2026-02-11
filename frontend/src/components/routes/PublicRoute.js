import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../../services/auth';

const PublicRoute = ({ children }) => {
  const user = AuthService.getCurrentUser();
  const token = AuthService.getToken();
  
  // If user is already logged in, redirect to home page
  // This prevents logged-in users from accessing login/register pages
  if (user && token) {
    return <Navigate to="/home" replace />;
  }
  
  // User is not logged in, allow access to public routes
  return children;
};

export default PublicRoute;