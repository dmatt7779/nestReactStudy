import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si no hay token en localStorage, expulsa al usuario al login.
    return <Navigate to="/" replace />;
  }

  // Si hay token, renderiza las rutas hijas dentro del Layout o directamente
  return <Outlet />;
};

export default ProtectedRoute;
