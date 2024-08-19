import Coupon from "../../model/coupon.js";

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({})
        res.status(201).json({ status: true, coupons: coupons });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
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
        res.status(201).json({ status: true, coupon: newCoupon });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

export const editCoupon = async (req, res) => {
    const formData = req.body;
    try {
        const { _id, ...updateData } = formData;
        const updatedCoupon = await Coupon.findByIdAndUpdate(_id, updateData, { new: true });

        if (!updatedCoupon) {
            return res.status(404).json({ status: false, message: 'Coupon not found' });
        }

        res.status(200).json({ status: true, coupon: updatedCoupon });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}