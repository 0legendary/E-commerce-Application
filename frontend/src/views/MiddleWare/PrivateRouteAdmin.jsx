import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';


const PrivateRouteAdmin = () => {

  const [isVerified, setIsVerified] = useState(null);
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axiosInstance.post('/verify-token-admin')
        if (response.status === 200) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsVerified(false);
      }
    }

    verifyToken()
  }, [])

  if (isVerified === null) {
    return <div>Loading...</div>;
  }

  return isVerified ? <Outlet /> : <Navigate to='/authentication' />;
};

export default PrivateRouteAdmin;
