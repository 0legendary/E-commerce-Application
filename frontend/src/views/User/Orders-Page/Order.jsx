import React, { useEffect, useState } from 'react';
import Layout from '../Header/Layout';
import axiosInstance from '../../../config/axiosConfig';
import './Order.css';
import DetailedOrder from './DetailedOrder';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Order() {
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null)
    const [showDetailedOrder, setShowDetailedOrder] = useState(false)
    const [currentDetailedProduct, setCurrentDetailedProduct] = useState({})
    const mainHeading = "Orders";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];

    useEffect(() => {
        axiosInstance.get('/user/all-orders')
            .then(response => {
                if (response.data.status) {
                    console.log(response.data.orders);
                    setOrders(response.data.orders ? response.data.orders : []);
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, []);

    const handleCancel = () => {
        if (currentOrderId && currentProductId && currentStatus) {
            axiosInstance.post('/user/update-order-status', { orderId: currentOrderId, productId: currentProductId, status: currentStatus })
                .then(response => {
                    if (response.data.status) {
                        toast.error("Order canceled!", {
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                          });
                        setOrders(prevOrders =>
                            prevOrders.map(order =>
                                order.orderId === currentOrderId
                                    ? {
                                        ...order,
                                        products: order.products.map(product =>
                                            product._id === currentProductId
                                                ? { ...product, orderStatus: currentStatus }
                                                : product
                                        )
                                    }
                                    : order
                            )
                        );
                        setShowModal(false);
                    }
                })
                .catch(error => {
                    console.error('Error canceling order:', error);
                });
        }
    };

    const openModal = (orderId, productId, status) => {
        setCurrentOrderId(orderId);
        setCurrentProductId(productId);
        setCurrentStatus(status)
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleDetailedOrder = (product, order) => {
        setShowDetailedOrder(true)
        setCurrentDetailedProduct({ order, product })
    }

    const handleCancelDetailedOrder = (product) => {
        setShowDetailedOrder(false)
    }


    return (

        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <ToastContainer />
            <div className="container mt-4">
                {!showDetailedOrder ? (
                    <div>
                        {orders
                            .slice()  // Create a shallow copy of the orders array
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))  // Sort by createdAt in descending order
                            .map(order => (
                                <div key={order._id} className="order-card mb-4 p-3 border rounded">
                                    {order.products.map((product, index) => (
                                        <div
                                            key={product._id}
                                            className={`order-item d-flex align-items-start ${order.products.length > 1 && order.products.length - 1 !== index ? 'border-bottom' : ''
                                                } pb-3 mb-3`}
                                        >
                                            <img
                                                src={product.productId.mainImage.image}
                                                alt={product.productName}
                                                className="order-image img-thumbnail me-3"
                                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                                            />
                                            <div className="order-details flex-grow-1">
                                                <h5 className="order-item-name" onClick={() => handleDetailedOrder(product, order)}>
                                                    {product.productName}
                                                </h5>
                                                <p className="order-item-color">Color: {product.selectedColor}</p>
                                                <p className="order-item-size">Size: {product.selectedSize}</p>
                                                <p className="order-item-quantity">Quantity: {product.quantity}</p>
                                            </div>
                                            <div className="order-summary ms-3">
                                                <p className="order-item-total-price">Total Price: ₹{product.discountPrice * product.quantity}</p>
                                                <p
                                                    className={`order-status ${product.orderStatus === 'pending' && 'text-warning'
                                                        } ${product.orderStatus === 'canceled' && 'text-danger'
                                                        } ${product.orderStatus === 'delivered' && 'text-success'
                                                        }`}
                                                >
                                                    Status: {product.orderStatus}
                                                </p>
                                                {product.orderStatus !== 'delivered' &&
                                                    product.orderStatus !== 'canceled' &&
                                                    product.orderStatus !== 'returned' && (
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
                                    ))}
                                    <p className="order-purchase-date d-flex justify-content-end">
                                        Purchased on: {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div>
                        <DetailedOrder product={currentDetailedProduct} backToOrders={handleCancelDetailedOrder} openModal={openModal} />
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Cancellation</h5>
                            <button type="button" className="close" onClick={closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to {currentStatus} this product?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                            <button type="button" className="btn btn-danger" onClick={handleCancel}>Confirm</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`modal-backdrop fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} />
        </div>
    );
}

export default Order;
