import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        auto: true,
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    
        required: true
    },
    shippingAddress: {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        pincode: { type: String, required: true },
        locality: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        landmark: { type: String },
        addressType: { type: String }
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'COD', 'pending'],
        required: true
    },
    orderTotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    couponID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },
    couponDiscount: {
        type: Number,
        default: 0
    },
    offerDiscount: {
        type: Number,
        default: 0
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        selectedColor: {
            type: String,
            required: true
        },
        selectedSize: {
            type: String,
            required: true
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled','returned'],
            default: 'pending'
        },
        price: {
            type: Number,
            required: true
        },
        discountPrice: {
            type: Number,
            required: true
        },
        offerDiscount: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    orderTracking: {
        trackingNumber: { type: String },
        carrier: { type: String },
        status: { type: String }
    },
    refund: {
        refundAmount: { type: Number },
        refundDate: { type: Date },
        refundReason: { type: String }
    },
    customerReviews: [{
        reviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        },
        reviewText: { type: String },
        rating: { type: Number, min: 1, max: 5 }
    }]
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
