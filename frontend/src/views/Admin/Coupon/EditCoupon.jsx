import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { couponValidate } from '../../../config/validateCoupon';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
import LoadingSpinner from '../../Loading/LoadingSpinner';

function EditCoupon({ completeEditCoupon, coupon, allCoupons }) {
    const [errors, setErrors] = useState({})
    const [isLoadingAction, setIsLoadingAction] = useState(false)
    const [formData, setFormData] = useState({
        ...coupon,
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : ''
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
        setIsLoadingAction(true);
        const allCouponsData = allCoupons.filter(val => val._id !== formData._id);
        const validationErrors = couponValidate(formData, allCouponsData);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const apiCall = axiosInstance.post('/admin/edit-coupon', formData);
                const { success, data, message } = await handleApiResponse(apiCall);

                if (success) {
                    completeEditCoupon(data.coupon);
                    setFormData({});
                    setErrors({});
                } else {
                    console.error('Error editing coupon:', message);
                    setErrors({ server: message });
                }
                setIsLoadingAction(false);
            } catch (error) {
                setIsLoadingAction(false);
                console.error('Error during API request:', error);
                setErrors({ server: 'An unexpected error occurred' });
            } finally {
                setIsLoadingAction(false);
            }
        } else {
            setErrors(validationErrors);
        }
    };
    return (
        <Card className="p-3 mt-5">
            <LoadingSpinner isLoadingAction={isLoadingAction} />
            <h2 className='text-center'>Edit Coupon</h2>
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
                            Update
                        </Button>
                        <Button variant="secondary" onClick={completeEditCoupon}>
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
        </Card>
    )
}

export default EditCoupon
