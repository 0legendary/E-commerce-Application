import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './ProfileHome.css';

function ProfileHome() {

  const navigate = useNavigate()
  const deleteAcessToken = () => {
    sessionStorage.removeItem('accessToken')
    navigate('/authentication')
  }
  return (
    <div className="container-fluid" style={{ height: '100vh' }}>
      <div className="row h-60">
        <div className="col-2 bg-dark text-white p-3">
          <div className="sidebar" style={{width: "100%"}}>
            <div className='sidebar-item-container'>
              <h5 >Hello Alen</h5>
              <ul className="nav flex-column">
                <Link to="/account/settings">
                  <li className="nav-item">
                    <a className="nav-link text-white" >Account settings</a>
                  </li>
                </Link>
                <Link to="/account/address">
                  <li className="nav-item">
                    <a className="nav-link text-white" >Manage Address</a>
                  </li>
                </Link>
                <Link to="/account/coupons">
                  <li className="nav-item">
                    <a className="nav-link text-white">Coupons</a>
                  </li>
                </Link>
                <li className="nav-item" onClick={deleteAcessToken}>
                  <a className="nav-link text-white">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-10 p-3 outlet-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ProfileHome;
