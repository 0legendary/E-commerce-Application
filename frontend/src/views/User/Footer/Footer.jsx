import React, { useState, useEffect } from 'react';
import './footer.css';
import { Link } from 'react-router-dom';

function Footer() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <footer className="footer bg-dark text-white py-4 mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h5 className="footer-title">About Us</h5>
                        <p>
                            We are a leading e-commerce platform specializing in high-quality footwear. Our mission is to provide top-notch products that combine comfort and style.
                        </p>
                    </div>
                    <div className="col-md-2">
                        <h5 className="footer-title">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="footer-link">Home</Link></li>
                            <li><Link to="/shop" className="footer-link">Shop</Link></li>
                            <li><Link to="/account/settings" className="footer-link">Account</Link></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5 className="footer-title">Follow Us</h5>
                        <ul className="list-unstyled">
                            <li><a href="https://github.com/0legendary" className="footer-link">Github</a></li>
                            <li><a href="https://x.com/_Alen_m_" className="footer-link">Twitter</a></li>
                            <li><a href="https://www.instagram.com/_alen_m__/" className="footer-link">Instagram</a></li>
                            <li><a href="https://www.linkedin.com/in/alen-m-4a7a39241/" className="footer-link">LinkedIn</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5 className="footer-title">Contact Us</h5>
                        <p>Email: bitsandbytes.alen@gmail.com</p>
                        <p>Phone: +919961689333</p>
                        <p>Address: Calicut, Olegendary, India</p>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col text-center">
                        <p className="mb-0">&copy; 2024 ShoeStore. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
            {isVisible && (
                <button className="scroll-to-top border" onClick={scrollToTop}>
                    <i className="bi bi-arrow-up"></i>
                </button>
            )}
        </footer>
    );
}

export default Footer;
