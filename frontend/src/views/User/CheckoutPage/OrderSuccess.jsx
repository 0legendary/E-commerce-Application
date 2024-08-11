import React, { useEffect } from 'react';
import './OrderSuccess.css';

function OrderSuccess({ onClose, address }) {
    console.log(address);

    const currentDate = new Date().toLocaleDateString();    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className='success-page'>
            <div className="order-success-overlay">
                <div className="order-success-content">
                    <h1 className="success-title">Order Placed Successfully!</h1>
                    <p className="success-message">Thank you for shopping with us. Your order has been placed and is being processed.</p>
                    <div className="order-details">
                        <h2>Order Details</h2>
                        <p><strong>Order Date:</strong> {currentDate}</p>
                        <p><strong>Delivery Address:</strong></p>
                        <address className='text-dark'>
                            {address.name} <br />
                            {address.address}, <br />
                            {address.city}, {address.state}, {address.pincode}
                        </address>
                    </div>
                    <div className="button-container">
                        <a href="/" className="btn btn-primary">Continue Shopping</a>
                        <a href="/orders" className="btn btn-secondary">View Orders</a>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default OrderSuccess;
