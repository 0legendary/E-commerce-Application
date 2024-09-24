import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './adminHomePage.css';

function AdminHomePage() {
  const navigate = useNavigate();
  const location = useLocation(); // To track the current route

  const deleteAcessToken = () => {
    sessionStorage.removeItem('accessToken');
    navigate('/admin/auth');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isActiveIcon = (path) => location.pathname === path ? '-fill' : '';

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/admin')}><Link to="/admin"><i class="bi bi-speedometer"></i> Dashboard</Link></li>
            <li className={isActive('/admin/products')}><Link to="/admin/products"><i class={`bi bi-box-seam${isActiveIcon('/admin/products')}`}></i> Products</Link></li>
            <li className={isActive('/admin/users')}><Link to="/admin/users"><i class={`bi bi-people${isActiveIcon('/admin/users')}`}></i> Users</Link></li>
            <li className={isActive('/admin/orders')}><Link to="/admin/orders"><i class={`bi bi-cart${isActiveIcon('/admin/orders')}`}></i> Orders</Link></li>
            <li className={isActive('/admin/coupons')}><Link to="/admin/coupons"><i class={`bi bi-tags${isActiveIcon('/admin/coupons')}`}></i> Coupons</Link></li>
            <li className={isActive('/admin/offers')}><Link to="/admin/offers"><i class={`bi bi-gift${isActiveIcon('/admin/offers')}`}></i> Offers</Link></li>
            <li className={isActive('/admin/category')}><Link to="/admin/category"><i class={`bi bi-collection${isActiveIcon('/admin/category')}`}></i> Category</Link></li>
            <li className="logout-btn" onClick={deleteAcessToken}><i class='bi bi-box-arrow-right me-2'></i> Logout</li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminHomePage;
