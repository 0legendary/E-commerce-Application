import React, { useState } from 'react';
import './DetailedOrder.css';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReviewForm from './ReviewForm';
import Invoice from '../Invoice/Invoice';

function DetailedOrder({ product, backToOrders, openModal }) {
    const { order } = product;
    const [showReviewForm, setShowReviewForm] = useState(false)
    const formatAddress = () => {
        const address = order.shippingAddress;
        return `${address.name}\n${address.address}, ${address.locality}, ${address.city} - ${address.pincode}, ${address.state}\nPhone number\n${address.mobile}`;
    };


    const status = order.products[0].orderStatus;

    const getLineWidth = (status) => {
        switch (status) {
            case 'pending':
                return '0%';
            case 'processing':
                return '25%';
            case 'shipped':
                return '70%';
            case 'delivered':
                return '100%';
            default:
                return '0%';
        }
    };



    const handleReviewSubmit = async (reviewData) => {
        try {
            const response = await axiosInstance.post('/user/add-review', reviewData);
            const { success, message } = await handleApiResponse(response);

            if (success) {
                toast.success(message, {
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setShowReviewForm(false);
            } else {
                toast.error(message, {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        } catch (error) {
            console.error('Error while submitting review:', error);
            toast.error('Error while submitting review', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };


    return (
        <div className="container mt-5">
            <ToastContainer />
            <button className="btn btn-secondary mb-4" onClick={() => backToOrders()}>
                Back to Orders
            </button>
            <div>
                {/* Shipping Address Section */}
                <div className="col-md-12">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title">Shipping Address</h5>
                        </div>
                        <div className="card-body">
                            <pre>{formatAddress()}</pre>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className='row'>
                    <div className="col-md-4">
                        <div className="card mb-4">
                            {order.products.map((product) => {
                                let mainImage = product.productId.images.images.filter((img) => img.mainImage)
                                return (
                                    <div className="card-body" key={product._id}>
                                        <div className="row">
                                            <div className="col-md-4">
                                                {mainImage && mainImage[0].cdnUrl && (
                                                    <img
                                                        src={mainImage[0].cdnUrl}
                                                        alt={product.productName}
                                                        className="img-fluid"
                                                    />
                                                )}
                                            </div>
                                            <div className="col-md-8 order-products">
                                                <div>
                                                    <h5 className="card-title">{product.productName}</h5>
                                                </div>
                                                <p>color: {product.selectedColor}</p>
                                                <p>size: {product.selectedSize}</p>
                                                {product.quantity > 1 && (
                                                    <p className='mb-2'>quantity: {product.quantity}</p>
                                                )}

                                                <div className='d-flex justify-content-between align-items-center'>
                                                    <div>
                                                        <p><strong>₹{product.discountPrice}</strong></p>
                                                    </div>
                                                    <div>
                                                        {product.orderStatus !== 'delivered' && product.orderStatus !== 'canceled' && product.orderStatus !== 'returned' && (
                                                            <button
                                                                className="btn btn-danger btn-sm mt-2"
                                                                onClick={() => openModal(order.orderId, product._id, 'canceled')}
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                        {product.orderStatus === 'delivered' && (
                                                            <button
                                                                className="btn btn-primary btn-sm mt-2"
                                                                onClick={() => openModal(order.orderId, product._id, 'returned')}
                                                            >
                                                                Return
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='d-flex justify-content-end mt-4'>
                                            {product.orderStatus === 'delivered' && (
                                                <button className='btn btn-secondary' onClick={() => setShowReviewForm(!showReviewForm)}>Add Reveiw</button>
                                            )}
                                        </div>

                                        {product.orderStatus === 'delivered' && showReviewForm && (
                                            <ReviewForm productId={product.productId} orderId={order.orderId} customerId={order.customerId} onSubmitReview={handleReviewSubmit} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Order Status Section */}
                    <div className="col-md-8">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="card-title">Order Status</h5>
                            </div>
                            <div className="card-body">
                                <div className="order-status">
                                    {status === 'canceled' ? (
                                        <div>
                                            Canceled
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`status ${status === 'pending' || status === 'processing' || status === 'shipped' || status === 'delivered' ? 'status-active' : ''}`}>
                                                Confirmed
                                            </div>

                                            <div className={`status ${status === 'processing' || status === 'shipped' || status === 'delivered' ? 'status-active' : ''}`}>
                                                Processing
                                            </div>
                                            <div className={`status ${status === 'shipped' || status === 'delivered' ? 'status-active' : ''}`}>
                                                Shipped
                                            </div>
                                            <div className={`status ${status === 'delivered' ? 'status-active' : ''}`}>
                                                Delivered
                                            </div>
                                        </>
                                    )}
                                </div>
                                {status !== 'canceled' && (
                                    <div className="line-container">
                                        <div className="line" style={{ width: getLineWidth(status) }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="card-title">Order Details</h5>
                            </div>
                            <div className="card-body font-monospace">
                                <div>
                                    <h4 className='d-flex text-success font-monospace'>
                                        Total Amount:  ₹{order.orderTotal}
                                    </h4>
                                </div>
                                <h5>Purchased Date: {order.createdAt.slice(0, 10)}</h5>
                                <h5>Payment Method: {order.paymentMethod}</h5>
                            </div>
                            {status === 'delivered' && (
                                <div className='pe-3'>
                                    <Invoice order={order} />
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DetailedOrder;
