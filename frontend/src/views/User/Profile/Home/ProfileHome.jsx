import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './ProfileHome.css';
import { handleApiResponse } from '../../../../utils/utilsHelper';
import axiosInstance from '../../../../config/axiosConfig';
function ProfileHome() {
  const [userData, setUserData] = useState({})
  const [selectedNav, setSelectedNav] = useState('/account/settings');
  const navigate = useNavigate();
  const location = useLocation();

  const deleteAccessToken = () => {
    sessionStorage.removeItem('accessToken');
    navigate('/authentication');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/user/user');
        const { success, message, data } = await handleApiResponse(response);

        if (success) {
          console.log(data);

          setUserData(data)
        } else {
          console.error('Error:', message);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setSelectedNav(location.pathname);
  }, [location]);

  return (
    <div className="container profile-container">
      <div className="row justify-content-center align-items-start">
        <div className="col-md-3">
          <div className="card text-center mb-3 bg-dark text-white">
            <div className="card-body profile-acc-container">
              <img src={userData.profileImg ? userData.profileImg : "https://w7.pngwing.com/pngs/393/995/png-transparent-aspria-fitness-computer-icons-user-my-account-icon-miscellaneous-monochrome-black-thumbnail.png"} alt="Profile" className="rounded-circle profile-image" />
              <h5 className="card-title ps-3">Hello, {userData.name ? userData.name : 'Guest'}</h5>
            </div>
          </div>

          <div className="card mb-3 bg-dark text-white">
            <div className="card-body">
              <h5 className="card-title mb-2 text-center font-monospace">Account Navigation</h5>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link
                    to="/account/settings"
                    className={`nav-link ${selectedNav === '/account/settings' ? 'active-nav' : ''}`}
                  >
                    <i className="bi bi-gear-fill nav-icon"></i> Account Settings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/account/address"
                    className={`nav-link ${selectedNav === '/account/address' ? 'active-nav' : ''}`}
                  >
                    <i className="bi bi-compass-fill nav-icon" /> Manage Address
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/account/coupons"
                    className={`nav-link ${selectedNav === '/account/coupons' ? 'active-nav' : ''}`}
                  >
                    <i className="bi bi-tags-fill nav-icon" /> Coupons
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="card bg-danger text-white logout-icon-container animated-btn">
            <div className="card-body d-flex justify-content-center align-items-center" onClick={deleteAccessToken}>
              <i className="bi bi-box-arrow-right logout-icon pe-3" /> Logout
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="outlet-container bg-dark rounded shadow">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHome;
