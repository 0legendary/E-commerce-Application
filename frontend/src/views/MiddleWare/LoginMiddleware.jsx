import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';

const PrivateRoute = () => {
  const [route, setRoute] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const response = await axiosInstance.post('/verify-login');
        if (response.data.Admin) {
          setRoute('/admin');
        } else {
          setRoute('/');
        }
      } catch (error) {
        setRoute('/authentication');
      }
    };

    if (sessionStorage.getItem('accessToken')) {
      verifyLogin();
    } else {
      setRoute('/authentication');
    }
  }, []);

  useEffect(() => {
    if (route) {
      navigate(route);
    }
  }, [route, navigate]);

  return route === null ? <div>Loading...</div> : <Outlet />;
};

export default PrivateRoute;
