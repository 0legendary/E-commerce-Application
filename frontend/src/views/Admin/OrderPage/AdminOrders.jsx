import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { Button, Table, Badge, Spinner } from 'react-bootstrap';
import './AdminOrders.css'
import SelectedOrder from './SelectedOrder';
function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSelectedOrder, setShowSelectedOrder] = useState(false)
    useEffect(() => {
        axiosInstance.get('/admin/all-orders')
            .then(response => {
                if (response.data.status) {
                    console.log(response.data.orders);
                    setOrders(response.data.orders ? response.data.orders : []);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error getting data:', error);
                setLoading(false);
            });
    }, []);

    

    const handleShowModal = (order) => {
        setSelectedOrder(order);
        setShowSelectedOrder(true);
    };

    const handleCloseModal = () => setShowSelectedOrder(false);

    const updateOrderStatus = (orderId, productId, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.orderId === orderId
                    ? {
                        ...order,
                        products: order.products.map(product =>
                            product._id === productId
                                ? { ...product, orderStatus: newStatus }
                                : product
                        )
                    }
                    : order
            )
        );
    };

    return (
        <div className="mt-4 text-white">
            {!showSelectedOrder ? (
                <div>
                    <h2>All Orders</h2>
                    {loading ? (
                        <div className="d-flex justify-content-center mt-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Order ID</th>
                                    <th>Customer Name</th>
                                    <th>Order Date</th>
                                    <th>Total Amount</th>
                                    <th>Payment method</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order,index) => (
                                    <tr key={order._id}>
                                        <td>{index+1}</td>
                                        <td>{order.orderId}</td>
                                        <td>{order.customerId.name}</td>
                                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td>${order.orderTotal}</td>
                                        <td>{order.paymentMethod}</td>
                                        <td>
                                            <Badge bg={order.products[0].orderStatus === 'delivered' ? 'success' :
                                                order.products[0].orderStatus === 'shipped' ? 'info' :
                                                    order.products[0].orderStatus === 'processing' ? 'warning' :
                                                        'danger'}>
                                                {order.products[0].orderStatus}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button variant="primary" onClick={() => handleShowModal(order)}>View</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            ) : (
                <div>
                    <SelectedOrder order={selectedOrder} handleCloseModal = {handleCloseModal} updateOrderStatus={updateOrderStatus}/>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
