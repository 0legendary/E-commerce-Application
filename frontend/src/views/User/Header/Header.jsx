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
        if (['/account/settings', '/account/address', '/account/coupons'].includes(location.pathname)) {
            return route.startsWith('/account') ? '-fill' : '';
        }
        return location.pathname === route ? '-fill' : '';
    };

    useEffect(() => {
        const header = document.querySelector('.header-container');
        const stickyPoint = header.offsetTop;

        const throttle = (fn, wait) => {
            let lastCall = 0;
            return function (...args) {
                const now = new Date().getTime();
                if (now - lastCall < wait) {
                    return;
                }
                lastCall = now;
                return fn(...args);
            };
        };

        const handleScroll = throttle(() => {
            if (window.pageYOffset > stickyPoint) {
                header.classList.add('sticky-header');
            } else {
                header.classList.remove('sticky-header');
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div>
            <div className='header-container'>
                <div className='d-flex align-items-center justify-content-between w-100'>
                    <div className='d-flex align-items-center'>
                        <h4 className='logo'>O'Legendary</h4>
                    </div>
                    <div className='nav-routes d-flex me-5 gap-3'>
                        <Link to="/" className='nav-links'>
                            <h6 className={`nav-link ${getRouteClass('/')}`}>HOME</h6>
                        </Link>
                        <Link to="/shop" className='nav-links'>
                            <h6 className={`nav-link ${getRouteClass('/shop')}`}>SHOP</h6>
                        </Link>
                        <Link to="/orders" className='nav-links'>
                            <h6 className={`nav-link ${getRouteClass('/orders')}`}>ORDERS</h6>
                        </Link>
                        <Link to="/wallet" className='nav-links'>
                            <h6 className={`nav-link ${getRouteClass('/wallet')}`}>WALLET</h6>
                        </Link>
                        <Link to='/cart' className='nav-links'>
                            {userDetails.cartLength !== null && <p className='item-quantity'>{userDetails.cartLength}</p>}
                            <i className={`bi bi-cart${getIconRouteClass('/cart')}`}></i>
                        </Link>
                        <Link to='/wishlist' className='nav-links'>
                            {userDetails.wishListLength !== null && <p className='item-quantity'>{userDetails.wishListLength}</p>}
                            <i className={`bi bi-heart${getIconRouteClass('/wishlist')}`}></i>
                        </Link>
                        <Link to='/account/settings' className='nav-links'>
                            <i className={`bi bi-person${getIconRouteClass('/account/settings')}`}></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
