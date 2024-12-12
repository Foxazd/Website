// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem('role');
  
  if (userRole !== role) {
    // Nếu người dùng không có quyền, chuyển hướng đến trang chính
    return <Navigate to="/home" />;
  }

  return children;
};

export default ProtectedRoute;
