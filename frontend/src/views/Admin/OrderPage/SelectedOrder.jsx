import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SelectedOrder({ order, handleCloseModal, updateOrderStatus }) {
    const [productStatuses, setProductStatuses] = useState(
        order.products.reduce((acc, product) => {
            acc[product._id] = product.orderStatus;
            return acc;
        }, {})
    );
    const [totalAmount, setTotalAmount] = useState(0);
    const calculateTotalAmount = () => {
        const amount = order.products
            .filter(product => productStatuses[product._id] !== 'canceled' && productStatuses[product._id] !== 'returned')
            .reduce((total, product) => total + (product.price * product.quantity), 0);

        setTotalAmount(amount);
    };

    useEffect(() => {
        calculateTotalAmount();
        // eslint-disable-next-line 
    }, [productStatuses, order.products]);

    const handleStatusChange = (productId, newStatus) => {
        setProductStatuses((prevStatuses) => ({
            ...prevStatuses,
            [productId]: newStatus,
        }));

        changeStatus(order.orderId, productId, newStatus);
    };

    const formatAddress = () => {
        const address = order.shippingAddress;
        return `\n${address.name}\n\n${address.address}, ${address.locality}, \n${address.city} - ${address.pincode}, ${address.state}\n\nPhone number\n${address.mobile}`;
    };

    const changeStatus = (orderId, productId, newStatus) => {
        axiosInstance.post('/user/update-order-status', { orderId, productId, status: newStatus })
            .then(response => {
                if (response.data.status) {
                    updateOrderStatus(orderId, productId, newStatus);
                    toast.success(`Changed the status to ${newStatus}`, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
            })
            .catch(error => {
                console.error('Error updating order status:', error);
            });
    };



    return (
        <div className="mt-5 text-white">
            <ToastContainer />
            <button className="btn btn-secondary mb-4" onClick={() => handleCloseModal()}>
                Back to Orders
            </button>
            <div>
                <div className="col-md-12 row">
                    <div className='col-md-6'>
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="card-title">Order Summary</h5>
                            </div>
                            <div className="card-body">
                                <pre>Order ID: {order.orderId}</pre>
                                <pre>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</pre>
                                <pre>Total Amount: ₹{totalAmount.toFixed(2)}</pre>
                                <pre>Shipping cost: ₹{order.shippingCost}</pre>
                                <pre>Payment Method: {order.paymentMethod}</pre>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="card-title">Shipping Address</h5>
                            </div>
                            <div className="card-body">
                                <pre>{formatAddress()}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="col-md-12">
                    <div className="card mb-4">
                        {order.products.map((product) => {
                            const mainImage = product.productId.images.images.filter(img => img.mainImage)
                            return (
                                <div className="card-body" key={product._id}>
                                    <div className="row">
                                        <div className="col-md-1">
                                            <img
                                                src={mainImage[0].cdnUrl}
                                                alt={product.productName}
                                                className="img-fluid"
                                            />
                                        </div>
                                        <div className="col-md-8 order-products">
                                            <div>
                                                <h5 className="card-title">{product.productName}</h5>
                                            </div>
                                            <p>Color: {product.selectedColor}</p>
                                            <p>Size: {product.selectedSize}</p>
                                            {product.quantity > 1 && (
                                                <p className='mb-2'>Quantity: {product.quantity}</p>
                                            )}

                                            <div className='d-flex justify-content-between align-items-center'>
                                                <div>
                                                    <p><strong>₹{product.price}</strong></p>
                                                </div>
                                                <div>
                                                    <select
                                                        className="form-select"
                                                        value={productStatuses[product._id] || product.orderStatus}
                                                        onChange={(e) => handleStatusChange(product._id, e.target.value)}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="canceled">Canceled</option>
                                                        <option value="returned">Returned</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SelectedOrder;
