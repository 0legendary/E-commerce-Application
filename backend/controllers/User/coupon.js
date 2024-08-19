import User from '../../model/user.js'
import Coupon from '../../model/coupon.js';


export const applyCoupon = async (req, res) => {
    const { code, orderAmount } = req.body;

    try {
        const coupon = await Coupon.findOne({ code });
        const user = await User.findOne({ email: req.user.email });
        if (!coupon) {
            return res.status(200).json({ status: false, message: 'Coupon not found' });
        }

        if (coupon.validUntil < new Date() || coupon.validFrom > new Date()) {
            return res.status(200).json({ status: false, message: 'Coupon expired' });
        }

        if (coupon.minOrderAmount > orderAmount) {
            return res.status(200).json({ status: false, message: 'Order amount is less than minimum required' });
        }

        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(200).json({ status: false, message: 'Coupon usage limit reached' });
        }

        if (coupon.usedUsers.includes(user._id)) {
            return res.status(200).json({ status: false, message: 'Coupon already used' });
        }

        let discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
        res.status(200).json({ status: true, coupon: { couponID: coupon._id, couponCode: coupon.code, discount, discountPercentage: coupon.discountValue } });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({})
        res.status(201).json({ status: true, coupons: coupons });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}