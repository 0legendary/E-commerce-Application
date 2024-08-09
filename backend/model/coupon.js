import mongoose from 'mongoose';


const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    discountValue: {
        type: Number,
        required: true
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: 0
    },
    usedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', CouponSchema);

export default Coupon;