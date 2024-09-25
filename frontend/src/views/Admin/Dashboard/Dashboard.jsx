import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Dropdown, ButtonGroup } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './Dashboard.css';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
import LedgerBook from './LedgerBook';
import Skeleton from 'react-loading-skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topCategories, setTopCategories] = useState([])
    const [topBrands, setTopBrands] = useState([])
    const [recentOrders, setRecentOrders] = useState([]);
    const [discountImpact, setDiscountImpact] = useState(0);
    const [returnRate, setReturnRate] = useState(0);
    const [totalSales, setTotalSales] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [averageOrderVal, setAverageOrderVal] = useState(0)
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showLedger, setShowLedger] = useState(false)
    const [loading, setLoading] = useState(true);
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
        const fetchOrders = async () => {
            try {
                const apiCall = axiosInstance.get('/admin/all-orders');
                const { success, data, message } = await handleApiResponse(apiCall);
                if (success) {
                    const ordersData = data.orders || [];
                    setOrders(ordersData);
                    updateDashboard(ordersData);
                } else {
                    console.error('Error fetching orders:', message);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        const fetchTopCategories = async () => {
            try {
                const apiCall = axiosInstance.get('/admin/top-orders-category');
                const { success, message, data } = await handleApiResponse(apiCall);
                if (success) {
                    setTopCategories(data.topCategories);
                    setTopBrands(data.topBrands);
                } else {
                    console.error('Error fetching top categories:', message);
                }
            } catch (error) {
                console.error('Unexpected error fetching top categories:', error);
            }
        };

        fetchOrders();
        fetchTopCategories();
        // eslint-disable-next-line
    }, []);


    useEffect(() => {
        updateDashboard(orders);
        // eslint-disable-next-line
    }, [filterType, startDate, endDate, orders]);


    const updateDashboard = (ordersData) => {
        const filteredOrders = filterOrders(ordersData);
        setTotalSales(filteredOrders.reduce((total, order) => total + order.orderTotal, 0).toFixed(2))
        setTotalOrders(filteredOrders.length)
        setAverageOrderVal((filteredOrders.reduce((total, order) => total + order.orderTotal, 0) / orders.length).toFixed(2))

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

        setRecentOrders(
            filteredOrders
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                .slice(0, 5)
                .map(order => ({
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
                const startOfWeek = new Date(now);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                // Reset the time to midnight for startOfWeek
                startOfWeek.setHours(0, 0, 0, 0);

                // End of week is 6 days after the start of the week
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                return ordersData.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= startOfWeek && orderDate <= endOfWeek;
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
            case 'customeDate':
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                return ordersData.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= start && orderDate <= end;
                });
            case 'all':
                return ordersData;
            default:
                return ordersData;
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        let yPosition = 22;

        // Add Title
        doc.setFontSize(22);
        doc.text('Sales Report', 14, yPosition);
        yPosition += 18;

        // Add Summary
        doc.setFontSize(16);
        doc.text(`Total Sales: ${totalSales} Rs`, 14, yPosition);
        yPosition += 10;
        doc.text(`Number of Orders: ${totalOrders}`, 14, yPosition);
        yPosition += 10;
        doc.text(`Average Order Value: ${averageOrderVal} Rs`, 14, yPosition);
        yPosition += 10;
        doc.text(`Discount Impact: ${discountImpact}%`, 14, yPosition);
        yPosition += 10;
        doc.text(`Return Rate: ${returnRate}%`, 14, yPosition);
        yPosition += 20;

        // Add Sales Chart
        doc.setFontSize(16);
        doc.text('Sales Over Time', 14, yPosition);
        yPosition += 10;
        const chartCanvas = document.querySelector('.chart-container canvas');
        if (chartCanvas) {
            const imgData = chartCanvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 14, yPosition, 180, 100);
            yPosition += 110;
        }



        yPosition += 20;
        doc.setFontSize(16);
        doc.text('Top Brands', 14, yPosition);
        yPosition += 10;
        const topBrandTable = topBrands.map(brand => [brand.brand, brand.count]);
        doc.autoTable({
            head: [['Brand Name', 'Quantity']],
            body: topBrandTable,
            startY: yPosition,
            margin: { top: 10, left: 14, right: 14 },
            theme: 'grid',
        });


        yPosition = doc.lastAutoTable.finalY + 60;

        doc.setFontSize(16);
        doc.text('Top Categories', 14, yPosition);
        yPosition += 10;
        const topCategoriesTable = topCategories.map(category => [category.category, category.count]);
        doc.autoTable({
            head: [['Category', 'Quantity']],
            body: topCategoriesTable,
            startY: yPosition,
            margin: { top: 10, left: 14, right: 14 },
            theme: 'grid',
        });

        yPosition = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(16);
        doc.text('Top Products', 14, yPosition);
        yPosition += 10;
        const topProductsTable = topProducts.map(product => [product.name, product.quantity, `${product.totalRevenue.toFixed(2)} Rs`]);
        doc.autoTable({
            head: [['Product Name', 'Quantity', 'Total Revenue']],
            body: topProductsTable,
            startY: yPosition,
            margin: { top: 10, left: 14, right: 14 },
            theme: 'grid',
        });

        yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 20;
        doc.setFontSize(16);
        doc.text('Ledger', 14, yPosition);
        yPosition += 10;


        const tableData = orders.map(order => [
            order.orderId,
            order.customerId.name,
            order.paymentMethod,
            order.products[0].orderStatus,
            new Date(order.orderDate).toLocaleDateString(),
            order.products.map(product => (
                `${product.productName} - ${product.selectedColor} - ${product.selectedSize} - ${product.quantity} x ${product.discountPrice}`
            )).join(', '),
            order.orderTotal.toFixed(2)
        ]);

        const totalAmount = orders.reduce((acc, order) => acc + order.orderTotal, 0);

        // Add ledger table
        doc.autoTable({
            head: [['Order ID', 'Customer Name', 'Payment Method', 'Order Status', 'Date of Order', 'Product Details', 'Total Amount']],
            body: tableData,
            startY: yPosition,
            margin: { top: 10, left: 14, right: 14 },
            theme: 'grid',
        });

        // Add totals row
        doc.autoTable({
            body: [
                [
                    '',
                    '',
                    '',
                    '',
                    '',
                    'Total:',
                    totalAmount.toFixed(2)
                ]
            ],
            startY: doc.lastAutoTable.finalY + 10,
            margin: { left: 14, right: 14 },
            theme: 'grid',
            styles: {
                fontSize: 12,
                cellPadding: 2,
            },
            columns: [
                { width: 50 },
                { width: 50 },
                { width: 50 },
                { width: 50 },
                { width: 50 },
                { width: 90 },
                { width: 40 },
            ]
        });


        doc.save('SalesReport.pdf');
    };


    const generateExcel = () => {
        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryWsData = [
            ['Total Sales', `₹${totalSales}`],
            ['Number of Orders', totalOrders],
            ['Average Order Value', `₹${averageOrderVal}`],
            ['Discount Impact', `${discountImpact}%`],
            ['Return Rate', `${returnRate}%`]
        ];
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryWsData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Top Products Sheet
        const topProductsData = [['Product Name', 'Quantity', 'Total Revenue']];
        topProducts.forEach(product => {
            topProductsData.push([product.name, product.quantity, `₹${product.totalRevenue.toFixed(2)}`]);
        });
        const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);
        XLSX.utils.book_append_sheet(wb, topProductsWs, 'Top Products');

        // Top Categories Sheet
        const topCategoriesData = [['Category', 'Quantity']];
        topCategories.forEach(category => {
            topCategoriesData.push([category.category, category.count]);
        });
        const topCategoriesWs = XLSX.utils.aoa_to_sheet(topCategoriesData);
        XLSX.utils.book_append_sheet(wb, topCategoriesWs, 'Top Categories');

        // Top Brands Sheet
        const topBrandsData = [['Brand Name', 'Quantity']];
        topBrands.forEach(brand => {
            topBrandsData.push([brand.brand, brand.count]);
        });
        const topBrandsWs = XLSX.utils.aoa_to_sheet(topBrandsData);
        XLSX.utils.book_append_sheet(wb, topBrandsWs, 'Top Brands');

        // Sales Over Time Sheet
        const salesData = [['Date', 'Sales']];
        chartData.labels.forEach((label, index) => {
            salesData.push([label, chartData.datasets[0].data[index]]);
        });
        const salesWs = XLSX.utils.aoa_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, salesWs, 'Sales Over Time');


        // Ledger Sheet
        const ledgerData = [['Order ID', 'Customer Name', 'Payment Method', 'Order Status', 'Date of Order', 'Product Details', 'Total Amount']];

        orders.forEach(order => {
            const productDetails = order.products.map(product => (
                `${product.productName} - ${product.selectedColor} - ${product.selectedSize} - ${product.quantity} x ₹${product.discountPrice}`
            )).join(', ');

            ledgerData.push([
                order.orderId,
                order.customerId.name,
                order.paymentMethod,
                order.products[0].orderStatus,
                new Date(order.orderDate).toLocaleDateString(),
                productDetails,
                `₹${order.orderTotal.toFixed(2)}`
            ]);
        });

        // Calculate total ledger amount
        const totalAmount = orders.reduce((acc, order) => acc + order.orderTotal, 0);
        ledgerData.push(['', '', '', '', '', 'Total:', `₹${totalAmount.toFixed(2)}`]);

        const ledgerWs = XLSX.utils.aoa_to_sheet(ledgerData);
        XLSX.utils.book_append_sheet(wb, ledgerWs, 'Ledger');


        // Save Excel File
        XLSX.writeFile(wb, 'SalesReport.xlsx');
    };

    return (
        <Container fluid>
            <div className='dashboard-container d-flex justify-content-between align-items-center' >
                <Form className='d-flex'>
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
                <h2 className='text-uppercase font-monospace'>Dashboard</h2>
                <div>
                    <Dropdown as={ButtonGroup}>
                        <Button variant="primary" onClick={generatePDF}>Download Report</Button>

                        <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" className="d-flex align-items-center">
                            <i className="bi bi-caret-down-fill ms-1"></i>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={generatePDF}>
                                PDF <i className="bi bi-filetype-pdf"></i>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={generateExcel}>
                                Excel <i className="bi bi-file-earmark-excel"></i>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

            </div>


            <Row className="my-4">
                <Col md={4}>
                    {loading ?
                        <div>
                            <Skeleton height={77} width={'100%'} />
                        </div>
                        :
                        <Card className="text-center cards-active">
                            <Card.Body>
                                <Card.Title>Total Sales</Card.Title>
                                <Card.Text>{`₹${totalSales}`}</Card.Text>
                            </Card.Body>
                        </Card>
                    }
                </Col>
                <Col md={4}>
                    {loading ?
                        <div>
                            <Skeleton height={77} width={'100%'} />
                        </div>
                        :
                        <Card className="text-center cards-active">
                            <Card.Body>
                                <Card.Title>Number of Orders</Card.Title>
                                <Card.Text>{totalOrders}</Card.Text>
                            </Card.Body>
                        </Card>
                    }
                </Col>
                <Col md={4}>
                    {loading ?
                        <div>
                            <Skeleton height={77} width={'100%'} />
                        </div>
                        :
                        <Card className="text-center cards-active">
                            <Card.Body>
                                <Card.Title>Average Order Value</Card.Title>
                                <Card.Text>₹ {averageOrderVal}</Card.Text>
                            </Card.Body>
                        </Card>
                    }
                </Col>
            </Row>



            <Row className="my-4">
                <Col md={8} className="chart-container">
                    {loading ?
                        <div>
                            <Skeleton height={590} width={'100%'} />
                        </div>
                        :
                        <Card className='cards-active'>
                            <Card.Header>
                                <h5>Sales Chart</h5>
                            </Card.Header>
                            <Card.Body>
                                <Line data={chartData} options={{ scales: { x: { type: 'category' }, y: { beginAtZero: true } } }} />
                            </Card.Body>
                        </Card>
                    }
                </Col>
                <Col md={4}>
                    {loading ?
                        <div>
                            <Skeleton height={77} width={'100%'} />
                        </div>
                        :
                        <Card className="text-center cards-active">
                            <Card.Body>
                                <Card.Title>Return Rate</Card.Title>
                                <Card.Text>{!isNaN(returnRate) ? returnRate : 0}%</Card.Text>
                            </Card.Body>
                        </Card>
                    }
                    {loading ?
                        <div className='my-4'>
                            <Skeleton height={77} width={'100%'} />
                        </div>
                        :
                        <Card className="text-center my-4 cards-active">
                            <Card.Body>
                                <Card.Title>Discount Impact</Card.Title>
                                <Card.Text>{!isNaN(discountImpact) ? discountImpact : 0}%</Card.Text>
                            </Card.Body>
                        </Card>
                    }
                    {loading ?
                        <div>
                            <Skeleton height={380} width={'100%'} />
                        </div>
                        :
                        <Card className='cards-active'>
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
                    }
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    {loading ?
                        <div>
                            <Skeleton height={370} width={'100%'} />
                        </div>
                        :
                        <Card className='cards-active'>
                            <Card.Header>
                                <h5>Best selling Categories</h5>
                            </Card.Header>
                            <Card.Body>
                                {topCategories.length > 0 ? (
                                    <ul className="list-group">
                                        {topCategories.map((category, index) => (
                                            <li key={index} className="list-group-item">
                                                {category.category} - {category.totalSold}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div>
                                        No Categories
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    }
                </Col>
                <Col>
                    {loading ?
                        <div>
                            <Skeleton height={370} width={'100%'} />
                        </div>
                        :
                        <Card className='cards-active'>
                            <Card.Header>
                                <h5>Best selling Brands</h5>
                            </Card.Header>
                            <Card.Body>
                                {topBrands.length > 0 ? (
                                    <ul className="list-group">
                                        {topBrands.map((brand, index) => (
                                            <li key={index} className="list-group-item">
                                                {brand.brand} - {brand.totalSold}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div>
                                        No Brands
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    }
                </Col>
            </Row>
            {!loading &&
                <Row className="my-4">
                    <Col>
                        <Card className='cards-active'>
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
                                                <td>{order.orderId ? order.orderId : 'Pending Payment'}</td>
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
            }
            {!loading &&
                <Row>
                    <div className='d-flex justify-content-end'>
                        <button className='btn btn-info' onClick={() => setShowLedger(!showLedger)}>{showLedger ? 'Close Ledger' : 'Show Ledger'}</button>
                    </div>
                    {showLedger && (
                        <LedgerBook orders={orders} />
                    )}
                </Row>
            }
        </Container>
    );
};

export default Dashboard;
