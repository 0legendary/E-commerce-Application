import Coupon from "../../model/coupon.js";
import Image from "../../model/image.js";
import Order from "../../model/order.js";
import Product from "../../model/product.js";
import Review from "../../model/review.js";
import User from "../../model/user.js";
import Wallet from "../../model/wallet.js";

const updateStockOnCancel = async (orderId, productId) => {
    const order = await Order.findOne({ orderId });
    if (!order) return;

    const productInOrder = order.products.find(product => product._id.toString() === productId);
    if (!productInOrder) return;

    const product = await Product.findById(productInOrder.productId);
    if (!product) return;

    const variation = product.variations.find(v => v.size === parseInt(productInOrder.selectedSize));
    if (!variation) return;

    variation.stock += productInOrder.quantity;
    await product.save();
}


export const getAllOrders = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email })
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const orders = await Order.find({ customerId: user._id })
            .populate({
                path: 'products.productId',
                select: 'images',
                populate: {
                    path: 'images',
                    select: 'images.cdnUrl images.mainImage'
                }
            });
        res.json({ status: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Error fetching user' });
    }
}


export const updateOrderStatus = async (req, res) => {
    const { orderId, productId, status } = req.body;

    try {
        const result = await Order.updateOne(
            { orderId, 'products._id': productId },
            { $set: { 'products.$.orderStatus': status } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ status: false, message: 'Order or product not found' });
        }

        if (status === 'canceled') {
            const order = await Order.findOne({ orderId });
            if (!order) {
                return res.status(404).json({ status: false, message: 'Order not found' });
            }

            // Recalculate order total
            const newTotal = order.products
                .filter(product => product.orderStatus !== 'canceled')
                .reduce((total, product) => total + product.totalPrice, 0);

            const coupon = await Coupon.findById(order.couponID);
            let newDiscountAmount = 0;
            if (order.couponDiscount > 0) {
                newDiscountAmount = newTotal * (order.couponDiscount / 100);
                if (newDiscountAmount > coupon.maxDiscount) newDiscountAmount = coupon.maxDiscount
            }

            await Order.updateOne({ orderId }, { $set: { orderTotal: newTotal - newDiscountAmount } });

            //refund the amount
            if (status === 'canceled' || status === 'returned' && order.paymentMethod === 'online') {
                const canceledProduct = order.products.find(product =>
                    product._id.toString() === productId && product.orderStatus === 'canceled'
                );
                if (!canceledProduct) {
                    return res.status(404).json({ status: false, message: 'Canceled product not found' });
                }
                let couponDiscount = order.couponDiscount > 0 ? (canceledProduct.totalPrice * order.couponDiscount / 100) > coupon.maxDiscount ? coupon.maxDiscount : (canceledProduct.totalPrice * order.couponDiscount / 100) : 0
                const refundAmount = canceledProduct.totalPrice - couponDiscount

                let wallet = await Wallet.findOne({ userId: order.customerId });
                if (!wallet) {
                    wallet = new Wallet({
                        userId: order.customerId,
                        balance: 0
                    });
                }
                wallet.balance += refundAmount;

                await wallet.save();
                let description = canceledProduct.productName ? `Refund for ${status} order: ${canceledProduct.productName}` : `Refund for ${status} order`
                wallet.transactions.push({
                    amount: refundAmount,
                    type: 'credit',
                    description: description,
                    createdAt: new Date()
                });

                await wallet.save();
            }
        }

        if (status !== 'returned') {
            await updateStockOnCancel(orderId, productId);
        }

        return res.json({ status: true });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}


export const addNewReview = async (req, res) => {
    const reviewData = req.body
    try {
        let savedImage = null;
        if (reviewData.reviewImages && reviewData.reviewImages.length > 0) {
            const newImage = new Image({ images: reviewData.reviewImages });
            savedImage = await newImage.save();
        }

        const newReview = new Review({
            orderId: reviewData.orderId,
            productId: reviewData.productId,
            customerId: reviewData.customerId,
            rating: reviewData.rating,
            reviewText: reviewData.reviewText,
            imagesId: savedImage ? [savedImage._id] : []
        })

        const savedReview = await newReview.save();

        await Order.findOneAndUpdate(
            { orderId: reviewData.orderId },
            {
                $push: {
                    customerReviews: {
                        reviewId: savedReview._id,
                        reviewText: reviewData.reviewText,
                        rating: reviewData.rating
                    }
                }
            },
            { new: true }
        );

        res.json({ status: true, newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Error fetching user' });
    }
}