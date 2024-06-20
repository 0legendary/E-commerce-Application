import React, { useState, useEffect } from 'react';
import {  Outlet } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import Error from '../Error/Error';


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
    return <Error/>
  }

  return isVerified ? <Outlet /> : <Error/>;
};

export default PrivateRouteAdmin;
