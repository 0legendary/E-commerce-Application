import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button, Pagination } from 'react-bootstrap';
import NewCoupon from './NewCoupon';
import axiosInstance from '../../../config/axiosConfig';
import moment from 'moment';
import EditCoupon from './EditCoupon';


function Coupon() {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editData, setEditData] = useState({})
    const [coupons, setCoupons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;


    useEffect(() => {
        axiosInstance.get('/admin/get-coupons')
            .then(response => {
                if (response.data.status) {
                    setCoupons(response.data.coupons);
                }
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };


    const filteredCoupons = coupons.filter(coupon => {
        return (
            coupon.code.toLowerCase().includes(search.toLowerCase()) ||
            moment(coupon.validFrom).format('MMMM D, YYYY').includes(search) ||
            moment(coupon.validUntil).format('MMMM D, YYYY').includes(search)
        );
    });

    const handleCreateCoupon = (coupon) => {
        coupon.code && setCoupons([...coupons, coupon])
        setShowForm(!showForm)
    }
    const handleEditCoupon = (editCoupon) => {
        setShowEditForm(!showEditForm)
        setEditData(editCoupon)
    }

    const completeEditCoupon = (editedCoupon) => {
        setShowEditForm(!showEditForm)
        if (editedCoupon._id) {
            const updatedCoupons = coupons.map(coupon =>
                coupon._id === editedCoupon._id ? editedCoupon : coupon
            );
            setCoupons(updatedCoupons);
        }
    }

    const indexOfLastCoupon = currentPage * itemsPerPage;
    const indexOfFirstCoupon = indexOfLastCoupon - itemsPerPage;
    const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

    const pageCount = Math.ceil(filteredCoupons.length / itemsPerPage);



    return (
        <div className="container mt-5 text-white font-monospace">
            <h2 className="mb-4">Manage Coupons</h2>
            {showForm && (
                <div>
                    <NewCoupon cancelCreate={handleCreateCoupon} coupons={coupons} />
                </div>
            )}
            {showEditForm && (
                <div>
                    <EditCoupon completeEditCoupon={completeEditCoupon} coupon={editData} allCoupons={coupons} />
                </div>
            )}
            {!showForm && !showEditForm && (
                <div>
                    <Form className="mb-4 d-flex">
                        <Button variant="outline-success" className='me-5' onClick={handleCreateCoupon}>Create</Button>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search by code, valid date, or expiry date"
                                value={search}
                                onChange={handleSearch}
                            />
                            <Button variant="outline-secondary">Search</Button>
                        </InputGroup>
                    </Form>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount Value (%)</th>
                                <th>Min Order Amount</th>
                                <th>Valid From</th>
                                <th>Valid Until</th>
                                <th>Usage Limit</th>
                                <th>Used Count</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCoupons.length > 0 ? (
                                currentCoupons.map((coupon, index) => (
                                    <tr key={index}>
                                        <td>{coupon.code}</td>
                                        <td>{coupon.discountValue}</td>
                                        <td>₹{coupon.minOrderAmount}</td>
                                        <td>{moment(coupon.validFrom).format('MMMM D, YYYY')}</td>
                                        <td>{moment(coupon.validUntil).format('MMMM D, YYYY')}</td>
                                        <td>{coupon.usageLimit}</td>
                                        <td>{coupon.usedCount}</td>
                                        <td><Button onClick={() => handleEditCoupon(coupon)}>Edit</Button></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">No coupons found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    <nav className='d-flex justify-content-end'>
                        <Pagination>
                            <Pagination.Prev
                                onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                                disabled={currentPage === 1}
                            />
                            {Array.from({ length: pageCount }, (_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={currentPage === index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, pageCount))}
                                disabled={currentPage === pageCount}
                            />
                        </Pagination>
                    </nav>
                </div>
            )}

        </div>
    );
}

export default Coupon;
