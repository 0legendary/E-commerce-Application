import React, { useEffect } from 'react';
import './header.css';
import { Link, useLocation } from 'react-router-dom';
import { useCartWishlist } from './CartWishlistContext';

function Header() {
    const location = useLocation();
    const { userDetails } = useCartWishlist();
    
    const getRouteClass = (route) => {
        return location.pathname === route ? 'active-route' : '';
    };

    const getIconRouteClass = (route) => {
        return location.pathname === route ? '-fill' : '';
    };

    useEffect(() => {
        const handleScroll = () => {
            const header = document.querySelector('.home-header-nav');
            const stickyPoint = header.offsetTop;

            if (window.pageYOffset > stickyPoint) {
                header.classList.add('sticky-header');
            } else {
                header.classList.remove('sticky-header');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div>
            <div className="home-header-nav">
                <div className="nav-container">
                    {userDetails.name === null ? (
                        <div className="logo">
                            <span className="logo-text"><span>O'legendary</span></span>
                        </div>
                    ) : (
                        <div className="logo">
                            <span className="logo-text"><span>Hello, {userDetails.name}</span></span>
                        </div>
                    )}
                    <div className="head-routes">
                        <Link to="/">
                            <span className={`home-route ${getRouteClass('/')}`}><span>HOME</span></span>
                        </Link>
                        {userDetails.name !== null ? (
                            <Link to="/authentication" onClick={() => sessionStorage.removeItem('accessToken')}>
                                <span className={`logout-route ${getRouteClass('/authentication')}`}><span>LOGOUT</span></span>
                            </Link>
                        ) : (
                            <Link to="/authentication">
                                <span className={`login-route ${getRouteClass('/authentication')}`}><span>LOGIN</span></span>
                            </Link>
                        )}

                        <Link to="/shop">
                            <span className={`shop-route ${getRouteClass('/shop')}`}><span>SHOP</span></span>
                        </Link>
                        <Link to="/orders">
                            <span className={`order-route ${getRouteClass('/orders')}`}><span>ORDERS</span></span>
                        </Link>
                        <Link to="/wallet">
                            <span className={`wallet-route ${getRouteClass('/wallet')}`}><span>WALLET</span></span>
                        </Link>
                    </div>
                    <div className="header-icons">
                        <div className="cart-div">
                            <Link to='/cart' style={{ textDecoration: 'none' }}>
                                {userDetails.cartLength !== null && <p className='cart-quantity'>{userDetails.cartLength}</p>}
                                <i className={`bi bi-cart${getIconRouteClass('/cart')} cart-icon`}></i>
                            </Link>
                        </div>
                        <div className="wishlist-div">
                            <Link to='/wishlist' style={{ textDecoration: 'none' }}>
                                {userDetails.wishListLength !== null && <p className='wishlist-quantity'>{userDetails.wishListLength}</p>}
                                <i className={`bi bi-heart${getIconRouteClass('/wishlist')} wishlist-icon`}></i>
                            </Link>
                        </div>
                        <div className="acc-div">
                            <Link to='/account/settings'>
                                <i className={`bi bi-person${getIconRouteClass('/account')} acc-icon`}></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
