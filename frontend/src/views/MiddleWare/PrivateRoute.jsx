import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ redirectPath = '/authentication' }) => {
  const token = sessionStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to={redirectPath} />;
  }
  return <Outlet />;
};

export default PrivateRoute;
