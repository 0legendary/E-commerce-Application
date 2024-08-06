import React from 'react';
import './header.css';
import { Link, useLocation } from 'react-router-dom';

function Header() {
    const location = useLocation();
    
    // Determine the active route
    const getRouteClass = (route) => {
        return location.pathname === route ? 'active-route' : '';
    };

    const getIconRouteClass = (route) => {
        return location.pathname === route ? '-fill' : '';
    };
    return (
        <div>
            <div className="home-header-nav">
                <div className="nav-container">
                    <div className="logo">
                        <span className="logo-text"><span>O'legendary</span></span>
                    </div>
                    <div className="head-routes">
                        <Link to="/">
                            <span className={`home-route ${getRouteClass('/')}`}><span>HOME</span></span>
                        </Link>
                        <Link to="/login">
                            <span className={`login-route ${getRouteClass('/login')}`}><span>LOGIN</span></span>
                        </Link>
                        <Link to="/shop">
                            <span className={`shop-route ${getRouteClass('/shop')}`}><span>SHOP</span></span>
                        </Link>
                        <Link to="/orders" >
                            <span className={`order-route ${getRouteClass('/orders')}`}><span>ORDERS</span></span>
                        </Link>
                        <Link to="/wallet">
                            <span className={`wallet-route ${getRouteClass('/wallet')}`}><span>WALLET</span></span>
                        </Link>
                    </div>
                    <div className="header-icons">
                        <div className="cart-div">
                            <Link to='/cart'>
                                <i className={`bi bi-cart${getIconRouteClass('/cart')} cart-icon`}></i>
                            </Link>
                        </div>
                        <div className="wishlist-div">
                            <Link to='/wishlist'>
                                <i className={`bi bi-heart${getIconRouteClass('/wishlist')} wishlist-icon`}></i>
                            </Link>
                        </div>
                        <div className="acc-div">
                            <Link to='/account/settings'>
                                <i className={`bi bi-person${getIconRouteClass('/account')} acc-icon`}></i>
                            </Link>
                        </div>
                    </div>
                    <div className="home-searchbar">
                        <div className="home-statelayer">
                            <div className="home-content">
                                <span className="home-text024 M3bodylarge">
                                    <span>search products</span>
                                </span>
                            </div>
                            <div className="home-trailing-elements">
                                <div className="home-frame1sttrailingicon">
                                    <div className="home-container05">
                                        <div className="home-statelayer1">
                                            <i className="bi bi-search home-icon03"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
