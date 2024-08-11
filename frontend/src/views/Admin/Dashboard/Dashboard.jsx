import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import './Dashboard.css';
import axiosInstance from '../../../config/axiosConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [discountImpact, setDiscountImpact] = useState(0);
    const [returnRate, setReturnRate] = useState(0);
    const [totalSales, setTotalSales] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [averageOrderVal, setAverageOrderVal] = useState(0)
    const [filterType, setFilterType] = useState('all'); // 'all', 'specificDay', 'weekly', 'monthly', 'yearly'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
                    updateDashboard(ordersData);
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        updateDashboard(orders);
        // eslint-disable-next-line
    }, [filterType, startDate, endDate, orders]);


    const updateDashboard = (ordersData) => {
        // Filter orders based on selected filter type
        const filteredOrders = filterOrders(ordersData);
        setTotalSales(filteredOrders.reduce((total, order) => total + order.orderTotal, 0).toFixed(2))
        setTotalOrders(filteredOrders.length)
        setAverageOrderVal((filteredOrders.reduce((total, order) => total + order.orderTotal, 0) / orders.length).toFixed(2))
        // Prepare sales data for chart
        const salesData = filteredOrders.map(order => ({
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
        const productSales = filteredOrders.flatMap(order =>
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
            filteredOrders.slice(0, 5).map(order => ({
                orderId: order.orderId,
                customer: order.customerId.name,
                total: order.orderTotal,
                status: order.products[0].orderStatus
            }))
        );

        // Calculate discount impact
        const totalDiscount = filteredOrders.reduce((total, order) =>
            total + (order.offerDiscount || 0), 0);
        const totalRevenue = filteredOrders.reduce((total, order) => total + order.orderTotal, 0);
        setDiscountImpact(((totalDiscount / totalRevenue) * 100).toFixed(2));

        // Calculate return rate
        const totalReturns = filteredOrders.reduce((total, order) => {
            // Check if any product in the order is returned
            const hasReturnedProduct = order.products.some(product => product.orderStatus === 'returned');
            return total + (hasReturnedProduct ? 1 : 0);
        }, 0);
        
        setReturnRate(((totalReturns / filteredOrders.length) * 100).toFixed(2));

    };



    const filterOrders = (ordersData) => {
        const now = new Date();

        switch (filterType) {
            case 'specificDay':
                return ordersData.filter(order =>
                    new Date(order.orderDate).toLocaleDateString() === new Date(startDate).toLocaleDateString()
                );
            case 'weekly':
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                return ordersData.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= startOfWeek && orderDate <= now;
                });
            case 'monthly':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return ordersData.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= startOfMonth && orderDate <= now;
                });
            case 'yearly':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                return ordersData.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= startOfYear && orderDate <= now;
                });
            case 'all':
                return ordersData;
            default:
                return ordersData;
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(22);
        doc.text('Sales Report', 14, 22);

        // Add Summary
        doc.setFontSize(16);
        doc.text(`Total Sales: $₹{totalSales}`, 14, 40);
        doc.text(`Number of Orders: ${totalOrders}`, 14, 50);
        doc.text(`Average Order Value: $₹{averageOrderVal}`, 14, 60);
        doc.text(`Discount Impact: ${discountImpact}%`, 14, 70);
        doc.text(`Return Rate: ${returnRate}%`, 14, 80);

        // Add Sales Chart
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Sales Over Time', 14, 22);
        const chartCanvas = document.querySelector('.chart-container canvas');
        if (chartCanvas) {
            const imgData = chartCanvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 14, 30, 180, 100);
        }

        // Add Top Products
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Top Products', 14, 22);
        const topProductsTable = topProducts.map(product => [product.name, product.quantity, `$${product.totalRevenue.toFixed(2)}`]);
        doc.autoTable({
            head: [['Product Name', 'Quantity', 'Total Revenue']],
            body: topProductsTable,
            startY: 30,
        });

        doc.save('SalesReport.pdf');
    };


    const generateExcel = () => {
        const wb = XLSX.utils.book_new();
        
        const summaryWsData = [
            ['Total Sales', `₹${totalSales}`],
            ['Number of Orders', totalOrders],
            ['Average Order Value', `₹${averageOrderVal}`],
            ['Discount Impact', `${discountImpact}%`],
            ['Return Rate', `${returnRate}%`]
        ];
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryWsData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        const topProductsData = [['Product Name', 'Quantity', 'Total Revenue']];
        topProducts.forEach(product => {
            topProductsData.push([product.name, product.quantity, `₹${product.totalRevenue.toFixed(2)}`]);
        });
        const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);
        XLSX.utils.book_append_sheet(wb, topProductsWs, 'Top Products');

        const salesData = [['Date', 'Sales']];
        chartData.labels.forEach((label, index) => {
            salesData.push([label, chartData.datasets[0].data[index]]);
        });
        const salesWs = XLSX.utils.aoa_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, salesWs, 'Sales Over Time');

        XLSX.writeFile(wb, 'SalesReport.xlsx');
    };

    return (
        <Container fluid>
            <div className='d-flex justify-content-between align-items-center'>
                <Form className='d-flex text-white'>
                    <Form.Group controlId="filterType" className='me-3'>
                        <Form.Label>Filter Type</Form.Label>
                        <Form.Control as="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">All Time</option>
                            <option value="specificDay">Specific Day</option>
                            <option value="customeDate">Custome Date</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </Form.Control>
                    </Form.Group>
                    {filterType === 'specificDay' && (
                        <>
                            <Form.Group controlId="startDate">
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </Form.Group>
                        </>
                    )}
                    {filterType === 'customeDate' && (
                        <>
                            <Form.Group controlId="startDate" className='me-3'>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </Form.Group>
                            <Form.Group controlId="endDate">
                                <Form.Label>End Date</Form.Label>
                                <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </Form.Group>
                        </>
                    )}
                </Form>
                <div>
                    <Button variant="primary" onClick={generatePDF}>Download PDF Report</Button>
                    <Button variant="secondary" onClick={generateExcel} className="ms-2">Download Excel Report</Button>
                </div>
            </div>


            <Row className="my-4">
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Total Sales</Card.Title>
                            <Card.Text>₹{totalSales}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Number of Orders</Card.Title>
                            <Card.Text>{totalOrders}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Average Order Value</Card.Title>
                            <Card.Text>₹ {averageOrderVal}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>



            <Row className="my-4">
                <Col md={8} className="chart-container">
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
                            <Card.Text>{!isNaN(returnRate) ? returnRate : 0}%</Card.Text>
                        </Card.Body>
                    </Card>
                    <Card className="text-center my-4">
                        <Card.Body>
                            <Card.Title>Discount Impact</Card.Title>
                            <Card.Text>{!isNaN(discountImpact)? discountImpact: 0}%</Card.Text>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <h5>Top Products</h5>
                        </Card.Header>
                        <Card.Body>
                            {topProducts.length > 0 ? (
                                <ul className="list-group">
                                    {topProducts.map((product, index) => (
                                        <li key={index} className="list-group-item">
                                            {product.name} - {product.quantity} units - ₹ {product.totalRevenue.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div>
                                    No products
                                </div>
                            )}

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
                                            <td>₹ {order.total.toFixed(2)}</td>
                                            <td>{order.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


        </Container>
    );
};

export default Dashboard;
