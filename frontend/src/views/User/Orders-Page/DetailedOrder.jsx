import React from 'react';
import './DetailedOrder.css';

function DetailedOrder({ product, backToOrders, openModal }) {
    const { order } = product;

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
    return (
        <div className="container mt-5">
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
                            {order.products.map((product) => (
                                <div className="card-body" key={product._id}>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <img
                                                src={product.productId.mainImage.image}
                                                alt={product.productName}
                                                className="img-fluid"
                                            />
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
                                                    <p><strong>₹{product.price}</strong></p>
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
                                </div>
                            ))}
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailedOrder;
