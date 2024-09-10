import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { Button, Table, Badge, Spinner, Form, Pagination } from 'react-bootstrap';
import './AdminOrders.css';
import SelectedOrder from './SelectedOrder';
import { handleApiResponse } from '../../../utils/utilsHelper';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSelectedOrder, setShowSelectedOrder] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const apiCall = axiosInstance.get('/admin/all-orders');
                const { success, data, message } = await handleApiResponse(apiCall);

                if (success) {
                    const ordersData = data.orders || [];
                    setOrders(ordersData);
                    setFilteredOrders(ordersData);
                    setLoading(false);
                } else {
                    setLoading(false);
                    console.error('Error fetching orders:', message);
                }
            } catch (error) {
                setLoading(false);
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);



    useEffect(() => {
        const filtered = orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            const isDateInRange = (!startDate || orderDate >= new Date(startDate)) &&
                (!endDate || orderDate <= new Date(endDate));
            const isPaymentMethodMatch = !paymentMethod || order.paymentMethod === paymentMethod;
            const isOrderStatusMatch = !orderStatus || order.products[0].orderStatus === orderStatus;

            return isDateInRange && isPaymentMethodMatch && isOrderStatusMatch;
        });
        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [paymentMethod, orderStatus, startDate, endDate, orders]);

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

    const handleClearFilters = () => {
        setPaymentMethod('');
        setOrderStatus('');
        setStartDate('');
        setEndDate('');
    };

    // Pagination logic
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <div className="mt-4 text-white">
            {!showSelectedOrder ? (
                <div>
                    <h2>All Orders</h2>

                    <Form className="mb-3 d-flex justify-content-end">
                        <Form.Group controlId="paymentMethod" className='me-3'>
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Control as="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="">All</option>
                                <option value="online">Online</option>
                                <option value="COD">COD</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="orderStatus" className='me-3'>
                            <Form.Label>Order Status</Form.Label>
                            <Form.Control as="select" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="canceled">Canceled</option>
                                <option value="returned">Returned</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="startDate" className='me-2'>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </Form.Group>

                        <Form.Group controlId="endDate">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </Form.Group>


                    </Form>
                    <div className='d-flex justify-content-end'>
                        <Button variant="secondary" onClick={handleClearFilters}>Clear Filters</Button>
                    </div>
                    {loading ? (
                        <div className="d-flex justify-content-center mt-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Order ID</th>
                                        <th>Customer Name</th>
                                        <th>Order Date</th>
                                        <th>Total Amount</th>
                                        <th>Payment Method</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map((order, index) => (
                                            <tr key={order._id}>
                                                <td>{index + 1}</td>
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">No orders found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            <nav>
                                <Pagination>
                                    <Pagination.Prev onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))} />
                                    {Array.from({ length: Math.ceil(filteredOrders.length / itemsPerPage) }, (_, index) => (
                                        <Pagination.Item key={index + 1} active={currentPage === index + 1} onClick={() => paginate(index + 1)}>
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(filteredOrders.length / itemsPerPage)))} />
                                </Pagination>
                            </nav>
                        </>
                    )}
                </div>
            ) : (
                <div>
                    <SelectedOrder order={selectedOrder} handleCloseModal={handleCloseModal} updateOrderStatus={updateOrderStatus} />
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
