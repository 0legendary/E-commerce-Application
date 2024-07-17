import React from 'react';
import './adminHomePage.css';

function AdminHomePage() {
  return (
    <div className="admin-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#"> Dashboard</a></li>
            <li><a href="#"> Products</a></li>
            <li><a href="#"> Users</a></li>
            <li><a href="#"> Orders</a></li>
            <li><a href="#">Coupons</a></li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <div>

        </div>
      </main>
    </div>
  );
}

export default AdminHomePage;
