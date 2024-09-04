import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { couponValidate } from '../../../config/validateCoupon';
import axiosInstance from '../../../config/axiosConfig';

function NewCoupon({ cancelCreate, coupons }) {
    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        code: '',
        discountValue: '',
        description: '',
        minOrderAmount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        maxDiscount: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrors({
            ...errors,
            [name]: ''
        })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let validationErrors = couponValidate(formData, coupons)

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await axiosInstance.post('/admin/create-coupon', formData);
                if (response.data.status) {
                    cancelCreate(response.data.coupon)
                    setFormData({
                        code:'',
                        description:'',
                        discountValue: '',
                        minOrderAmount: '',
                        validFrom: '',
                        validUntil: '',
                        usageLimit: ''
                    });
                    setErrors({});

                } else {
                    console.error('Error creating coupon:', response.data.message);
                    setErrors({ server: response.data.message });
                }
            } catch (error) {
                console.error('Error during API request:', error);
                setErrors({ server: 'An unexpected error occurred' });
            }
        } else {
            setErrors(validationErrors);
        }

    };

    return (
        <Container className="mt-5">
            <h2>Create New Coupon</h2>
            <Form onSubmit={handleSubmit} className='d-flex gap-3 w-100'>
                <div className='w-50'>
                    <Form.Group controlId="formCode" className='my-3'>
                        <Form.Label>Coupon Code</Form.Label>
                        <Form.Control
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Enter coupon code"
                            isInvalid={!!errors.code}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.code}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formDiscountValue" className='my-3'>
                        <Form.Label>Discount Value (%)</Form.Label>
                        <Form.Control
                            type="number"
                            name="discountValue"
                            value={formData.discountValue}
                            onChange={handleChange}
                            placeholder="Enter discount percentage"
                            isInvalid={!!errors.discountValue}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.discountValue}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="formMinOrderAmount" className='my-3'>
                        <Form.Label>Minimum Order Amount</Form.Label>
                        <Form.Control
                            type="number"
                            name="minOrderAmount"
                            value={formData.minOrderAmount}
                            onChange={handleChange}
                            placeholder="Enter minimum order amount"
                            isInvalid={!!errors.minOrderAmount}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.minOrderAmount}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formMaxDiscount" className='my-3'>
                        <Form.Label>Maximum discount</Form.Label>
                        <Form.Control
                            type="number"
                            name="maxDiscount"
                            value={formData.maxDiscount}
                            onChange={handleChange}
                            placeholder="Enter maximum discount"
                            isInvalid={!!errors.maxDiscount}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.maxDiscount}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <div className='my-5 d-flex'>
                        <Button variant="primary" type="submit" className="me-2">
                            Create
                        </Button>
                        <Button variant="secondary" onClick={cancelCreate}>
                            Cancel
                        </Button>
                    </div>
                </div>

                <div className='w-50'>
                    <Form.Group controlId="formDescription" className='my-3'>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                            isInvalid={!!errors.description}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.description}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="formValidFrom" className='my-3'>
                        <Form.Label>Valid From</Form.Label>
                        <Form.Control
                            type="date"
                            name="validFrom"
                            value={formData.validFrom}
                            onChange={handleChange}
                            isInvalid={!!errors.validFrom}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.validFrom}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formValidUntil" className='my-3'>
                        <Form.Label>Valid Until</Form.Label>
                        <Form.Control
                            type="date"
                            name="validUntil"
                            value={formData.validUntil}
                            onChange={handleChange}
                            isInvalid={!!errors.validUntil}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.validUntil}
                        </Form.Control.Feedback>
                    </Form.Group>


                    <Form.Group controlId="formUsageLimit" className='my-3'>
                        <Form.Label>Usage Limit</Form.Label>
                        <Form.Control
                            type="number"
                            name="usageLimit"
                            value={formData.usageLimit}
                            onChange={handleChange}
                            placeholder="Enter usage limit"
                            isInvalid={!!errors.usageLimit}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.usageLimit}
                        </Form.Control.Feedback>
                    </Form.Group>
                </div>
            </Form>
        </Container>
    );
}

export default NewCoupon;
