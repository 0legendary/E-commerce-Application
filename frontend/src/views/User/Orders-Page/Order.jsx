import React, { useEffect, useState } from 'react';
import Layout from '../Header/Layout';
import axiosInstance from '../../../config/axiosConfig';
import { Card, Tab, Tabs, ListGroup } from 'react-bootstrap';
import './Order.css';
import DetailedOrder from './DetailedOrder';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PendingPayment from './PendingPayment';
import { handleApiResponse } from '../../../utils/utilsHelper';
import Skeleton from 'react-loading-skeleton';

function Order() {
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null)
    const [showDetailedOrder, setShowDetailedOrder] = useState(false)
    const [currentDetailedProduct, setCurrentDetailedProduct] = useState({})
    const [activeOrderId, setActiveOrderId] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [loading, setLoading] = useState(true);

    const mainHeading = "Orders";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const apiCall = axiosInstance.get('/user/all-orders');
                const { success, data, message } = await handleApiResponse(apiCall);

                if (success) {
                    const ordersData = data.orders || [];
                    setOrders(ordersData);
                } else {
                    console.error('Error fetching orders:', message);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);


    const handleCancel = () => {
        if (currentOrderId && currentProductId && currentStatus) {
            const apiCall = axiosInstance.post('/user/update-order-status', { orderId: currentOrderId, productId: currentProductId, status: currentStatus });

            handleApiResponse(apiCall)
                .then(response => {
                    if (response.success) {
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
                    } else {
                        console.error('Error canceling order:', response.message);
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

    const handleCancelDetailedOrder = () => {
        setShowDetailedOrder(false)
    }


    return (
        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <ToastContainer />
            <div className=" pt-4 bg-black">
                {!showDetailedOrder ? (
                    <Card className='bg-dark container'>
                        <Card.Body className='font-monospace'>
                            <Tabs defaultActiveKey="SuccessfulOrders" id="transaction-tabs" className="mb-5 border-2">
                                <Tab eventKey="SuccessfulOrders" title="Successful Orders">
                                    {loading ? (
                                        Array(4).fill().map((_, index) => (
                                            <li key={index} className="main-nav-list">
                                                <Skeleton borderRadius={10} height={165} width={'100%'} />
                                            </li>
                                        ))
                                    ) : (
                                        orders ? (
                                            <>
                                                {orders
                                                    ?.filter(order => order.paymentMethod !== 'pending')
                                                    .slice()
                                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                    .map(order => (
                                                        <ListGroup.Item key={order._id} className='bg-dark' onClick={() => handleDetailedOrder(order, order)}>
                                                            <div className="order-card mb-4 p-3">
                                                                {order.products.map((product) => {
                                                                    let mainImage = product.productId.images.images.filter((img) => img.mainImage);
                                                                    return (
                                                                        <div
                                                                            key={product._id}
                                                                            className="order-item d-flex align-items-center pb-1 mb-1"
                                                                        >
                                                                            {mainImage && mainImage[0].cdnUrl && (
                                                                                <img
                                                                                    src={mainImage[0].cdnUrl}
                                                                                    alt={product.productName}
                                                                                    className="order-image img-thumbnail me-3 p-0"
                                                                                    style={{ maxWidth: '60px', maxHeight: '60px' }}
                                                                                />
                                                                            )}

                                                                            <div className="order-details flex-grow-1">
                                                                                <h6 className="order-item-name">{product.productName}</h6>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                <p className="order-purchase-date d-flex justify-content-end">
                                                                    Ordered on: {new Date(order.orderDate).toLocaleDateString()}
                                                                </p>
                                                                <h4 className='d-flex justify-content-end text-success font-monospace'>
                                                                    ₹{order.orderTotal}
                                                                </h4>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))}
                                            </>
                                        ) : (
                                            <h3 className='text-center pt-3 text-secondary font-monospace'>It looks like you haven't made any purchases yet.</h3>
                                        )
                                    )}

                                </Tab>

                                <Tab eventKey="pending" title="Pending Orders">
                                    {loading ? (
                                        Array(2).fill().map((_, index) => (
                                            <li key={index} className="main-nav-list">
                                                <Skeleton borderRadius={10} height={165} width={'100%'} />
                                            </li>
                                        ))
                                    ) : (
                                        orders && (
                                            <>
                                                {orders
                                                    ?.filter((order) => order.paymentMethod === "pending")
                                                    .slice()
                                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                    .map((order) => (
                                                        <ListGroup.Item key={order._id} className="bg-dark">
                                                            <div className="order-card mb-4 p-3">
                                                                {order.products.map((product) => {
                                                                    let mainImage = product.productId.images.images.filter(
                                                                        (img) => img.mainImage
                                                                    );
                                                                    return (
                                                                        <div
                                                                            key={product._id}
                                                                            className="order-item d-flex align-items-center pb-1 mb-1"
                                                                        >
                                                                            {mainImage && mainImage[0].cdnUrl && (
                                                                                <img
                                                                                    src={mainImage[0].cdnUrl}
                                                                                    alt={product.productName}
                                                                                    className="order-image img-thumbnail  me-3 p-0"
                                                                                    style={{ maxWidth: "60px", maxHeight: "60px" }}
                                                                                />
                                                                            )}

                                                                            <div className="order-details flex-grow-1">
                                                                                <h6 className="order-item-name">{product.productName}</h6>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}

                                                                <p className="order-purchase-date d-flex justify-content-end">
                                                                    Ordered on: {new Date(order.orderDate).toLocaleDateString()}
                                                                </p>
                                                                <div className="order-summary ms-3">
                                                                    <p className="order-item-total-price">
                                                                        Payable Amount: ₹{order.orderTotal}
                                                                    </p>
                                                                    {activeOrderId === order._id ? (
                                                                        <button
                                                                            onClick={() => setActiveOrderId("")}
                                                                            className="btn btn-secondary btn-sm mt-2 w-100 font-monospace p-2"
                                                                        >
                                                                            Cancel Order
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setActiveOrderId(order._id)}
                                                                            className="btn btn-secondary btn-sm mt-2 w-100 font-monospace p-2"
                                                                        >
                                                                            Continue Purchase
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Payment Method Section with Transition */}
                                                                <div
                                                                    className={`payment-method-container ${activeOrderId === order._id ? "show" : "hide"
                                                                        }`}
                                                                >
                                                                    <div className="pt-3">
                                                                        <div className="d-flex font-monospace justify-content-center mt-3 ps-3">
                                                                            <h4>Select Payment Method</h4>
                                                                        </div>
                                                                        {order.orderTotal > 1000 ? (
                                                                            <div className="d-flex justify-content-center ps-3 font-monospace pb-4">
                                                                                {/* Online Payment Button */}
                                                                                <button
                                                                                    className={`btn ${paymentMethod === "Razorpay"
                                                                                        ? "btn-primary"
                                                                                        : "btn-outline-primary"
                                                                                        } me-2`}
                                                                                    onClick={() => setPaymentMethod("Razorpay")}
                                                                                >
                                                                                    Online
                                                                                </button>
                                                                                {/* COD Payment Button */}
                                                                                <button
                                                                                    className={`btn ${paymentMethod === "COD"
                                                                                        ? "btn-primary"
                                                                                        : "btn-outline-primary"
                                                                                        }`}
                                                                                    onClick={() => setPaymentMethod("COD")}
                                                                                >
                                                                                    COD
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div>
                                                                                <button className="btn btn-primary">Online</button>
                                                                                <p className="mt-2">
                                                                                    COD is only available for orders above ₹1000
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* Show Pending Payment Component for selected method */}
                                                                        {paymentMethod === "Razorpay" && (
                                                                            <PendingPayment order={order} paymentMethod={"online"} />
                                                                        )}
                                                                        {paymentMethod === "COD" && (
                                                                            <PendingPayment order={order} paymentMethod={"COD"} />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))}

                                                {orders.filter((order) => order.paymentMethod === "pending").length ===
                                                    0 && (
                                                        <h3 className="text-center pt-3 text-secondary font-monospace">
                                                            You don't have any orders awaiting payment.
                                                        </h3>
                                                    )}
                                            </>
                                        )
                                    )}

                                </Tab>



                            </Tabs>
                        </Card.Body>
                    </Card>
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
        </div >
    );
}

export default Order;
