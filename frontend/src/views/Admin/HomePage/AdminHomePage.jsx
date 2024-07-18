import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './adminHomePage.css';

function AdminHomePage() {
  const navigate = useNavigate()
  const deleteAcessToken = () => {
    sessionStorage.removeItem('accessToken')
    navigate('/admin/auth')
  }
  return (
    <div className="admin-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="products">Products</Link></li>
            <li><Link to="users">Users</Link></li>
            <li><Link to="orders">Orders</Link></li>
            <li><Link to="coupons">Coupons</Link></li>
            <li onClick={deleteAcessToken}>Logout</li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <div>
          <Outlet/>
        </div>
      </main>
    </div>
  );
}

export default AdminHomePage;
