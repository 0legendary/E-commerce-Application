import Coupon from "../../model/coupon.js";
import { createResponse } from "../../utils/responseHelper.js";

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({})
        res.status(201).json(createResponse(true,'All coupons fetched successfully', {coupons}));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error fetching coupons', null, error.message));
    }
}

export const createNewCoupon = async (req, res) => {
    const { code, discountValue, description, minOrderAmount, validFrom, validUntil, usageLimit, maxDiscount } = req.body;

    try {
        const newCoupon = new Coupon({
            code,
            description,
            discountValue,
            minOrderAmount,
            validFrom,
            validUntil,
            maxDiscount,
            usageLimit
        });

        await newCoupon.save();
        res.status(201).json(createResponse(true,'New coupon created successfully', {coupon: newCoupon}));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error creating new coupon', null, error.message));
    }
}

export const editCoupon = async (req, res) => {
    const formData = req.body;
    try {
        const { _id, ...updateData } = formData;
        const updatedCoupon = await Coupon.findByIdAndUpdate(_id, updateData, { new: true });

        if (!updatedCoupon) {
            return res.status(404).json(createResponse(false, 'Coupon not found'));
        }

        res.status(200).json(createResponse(true, 'Coupon updated successfully', { coupon: updatedCoupon }));
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json(createResponse(false, 'Server error', null, error.message));
    }
};