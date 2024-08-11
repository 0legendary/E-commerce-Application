import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

import './Dashboard.css';
import axiosInstance from '../../../config/axiosConfig';

// Register the components you need from ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [discountImpact, setDiscountImpact] = useState(0);
    const [returnRate, setReturnRate] = useState(0);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Sales Over Time',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
            },
        ],
    });


    useEffect(() => {
        axiosInstance.get('/admin/all-orders')
            .then(response => {
                if (response.data.status) {
                    const ordersData = response.data.orders || [];
                    setOrders(ordersData);
                    console.log(ordersData);
                    // Prepare sales data for chart
                    const salesData = ordersData.map(order => ({
                        date: new Date(order.orderDate).toLocaleDateString(),
                        sales: order.orderTotal
                    }));

                    const dates = salesData.map(data => data.date);
                    const sales = salesData.map(data => data.sales);

                    setChartData({
                        labels: dates,
                        datasets: [
                            {
                                label: 'Sales Over Time',
                                data: sales,
                                borderColor: '#007bff',
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                fill: true,
                            },
                        ],
                    });

                    // Prepare top products data
                    const productSales = ordersData.flatMap(order =>
                        order.products.map(product => ({
                            name: product.productName,
                            quantity: product.quantity,
                            totalRevenue: product.totalPrice
                        }))
                    );

                    const productSummary = productSales.reduce((acc, product) => {
                        if (!acc[product.name]) {
                            acc[product.name] = { quantity: 0, totalRevenue: 0 };
                        }
                        acc[product.name].quantity += product.quantity;
                        acc[product.name].totalRevenue += product.totalRevenue;
                        return acc;
                    }, {});

                    setTopProducts(
                        Object.entries(productSummary).map(([name, { quantity, totalRevenue }]) => ({
                            name,
                            quantity,
                            totalRevenue
                        })).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5)
                    );

                    // Prepare recent orders data
                    setRecentOrders(
                        ordersData.slice(0, 5).map(order => ({
                            orderId: order.orderId,
                            customer: order.customerId.name,
                            total: order.orderTotal,
                            status: order.products[0].orderStatus
                        }))
                    );

                    // Calculate discount impact
                    const totalDiscount = ordersData.reduce((total, order) =>
                        total + (order.offerDiscount || 0), 0);
                    const totalRevenue = ordersData.reduce((total, order) => total + order.orderTotal, 0);
                    setDiscountImpact(((totalDiscount / totalRevenue) * 100).toFixed(2));

                    // Calculate return rate
                    const totalReturns = ordersData.reduce((total, order) => {
                        // Check if any product in the order is returned
                        const hasReturnedProduct = order.products.some(product => product.orderStatus === 'returned');
                        return total + (hasReturnedProduct ? 1 : 0);
                    }, 0);

                    console.log(totalReturns);
                    setReturnRate(((totalReturns / ordersData.length) * 100).toFixed(2));

                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, []);




    return (
        <Container fluid>
            <Row className="my-4">
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Total Sales</Card.Title>
                            <Card.Text>${orders.reduce((total, order) => total + order.orderTotal, 0).toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Number of Orders</Card.Title>
                            <Card.Text>{orders.length}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Average Order Value</Card.Title>
                            <Card.Text>${(orders.reduce((total, order) => total + order.orderTotal, 0) / orders.length).toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            

            <Row className="my-4">
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h5>Sales Chart</h5>
                        </Card.Header>
                        <Card.Body>
                            <Line data={chartData} options={{ scales: { x: { type: 'category' }, y: { beginAtZero: true } } }} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Return Rate</Card.Title>
                            <Card.Text>{returnRate}%</Card.Text>
                        </Card.Body>
                    </Card>
                    <Card className="text-center my-4">
                        <Card.Body>
                            <Card.Title>Discount Impact</Card.Title>
                            <Card.Text>{discountImpact}%</Card.Text>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <h5>Top Products</h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-group">
                                {topProducts.map((product, index) => (
                                    <li key={index} className="list-group-item">
                                        {product.name} - {product.quantity} units - ${product.totalRevenue.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5>Recent Orders</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, index) => (
                                        <tr key={index}>
                                            <td>{order.orderId}</td>
                                            <td>{order.customer}</td>
                                            <td>${order.total.toFixed(2)}</td>
                                            <td>{order.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5>Filter Sales Data</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group controlId="formDateRange">
                                    <Form.Label>Select Date Range</Form.Label>
                                    <Form.Control type="date" />
                                    <Form.Control type="date" className="mt-2" />
                                </Form.Group>
                                <Button variant="primary" className="mt-2">Apply Filters</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
