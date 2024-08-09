import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button } from 'react-bootstrap';
import NewCoupon from './NewCoupon';
import axiosInstance from '../../../config/axiosConfig';
import moment from 'moment';


function Coupon() {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false)
    const [coupons, setCoupons] = useState([]);

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

    return (
        <div className="container mt-5 text-white font-monospace">
            <h2 className="mb-4">Manage Coupons</h2>
            {showForm && (
                <div>
                    <NewCoupon cancelCreate={handleCreateCoupon} coupons={coupons} />
                </div>
            )}
            {!showForm && (
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
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCoupons.map((coupon, index) => (
                                <tr key={index}>
                                    <td>{coupon.code}</td>
                                    <td>{coupon.discountValue}</td>
                                    <td>₹{coupon.minOrderAmount}</td>
                                    <td>{moment(coupon.validFrom).format('MMMM D, YYYY')}</td>
                                    <td>{moment(coupon.validUntil).format('MMMM D, YYYY')}</td>
                                    <td>{coupon.usageLimit}</td>
                                    <td>{coupon.usedCount}</td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

        </div>
    );
}

export default Coupon;
