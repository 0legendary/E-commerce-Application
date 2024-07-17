import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './adminHomePage.css';

function AdminHomePage() {
  return (
    <div className="admin-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="products">Products</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
            <li><Link to="/admin/coupons">Coupons</Link></li>
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
