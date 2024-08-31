import Product from '../../model/product.js';
import User from '../../model/user.js'
import Address from '../../model/address.js';
import Cart from '../../model/cart.js';
import Order from '../../model/order.js';
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { v4 } from 'uuid'
import Coupon from '../../model/coupon.js';
import Offer from '../../model/offer.js';


export const checkoutProduct = async (req, res) => {
    const { product_id } = req.params;
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const addresses = await Address.find({ userId: user._id });
        let populatedProducts

        if (product_id === 'null') {
            const cart = await Cart.findOne({ userId: user._id }).populate({
                path: 'products.productId',
                populate: {
                    path: 'images',
                    select: 'images'
                }
            });
            
            console.log('jkhbhj',cart.products[0].productId.images);

            if (cart && cart.products.length > -1) {
                populatedProducts = cart.products.map(product => ({
                    productId: product.productId._id,
                    name: product.productId.name,
                    images: product.productId.images.images,
                    quantity: product.quantity,
                    price: product.price,
                    discountedPrice: product.discountedPrice,
                    selectedColor: product.selectedColor,
                    selectedSize: product.selectedSize,
                    selectedStock: product.selectedStock,
                    categoryId: product.categoryId,
                    _id: product._id,
                }));
            } else {
                populatedProducts = []
            }
        } else {
            const product = await Product.findOne({ _id: product_id }).populate({
                path: 'images',
                select: 'images'
            });
            let Variations = product.variations[0]
            populatedProducts = [{
                productId: product._id,
                name: product.name,
                images: product.images.images,
                quantity: 1,
                price: Variations.price,
                discountedPrice: Variations.discountPrice,
                selectedColor: Variations.color[0],
                selectedSize: Variations.size,
                selectedStock: Variations.stock,
                categoryId: product.categoryId,
                _id: product._id,
            }]
        }
        const offers = await Offer.find({})
        res.status(200).json({ status: true, addresses, products: populatedProducts, offers });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}


export const payment = async (req, res) => {
    const { amount } = req.body;
    try {
        const instance = new Razorpay({
            key_id: process.env.KEY_ID.toString(),
            key_secret: process.env.RAZORPAY_SECRET_KEY,
        });

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex")
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log("Can't create orders");
                console.log(error);
                return res.status(500).json({ status: false, message: "Something went wrong!" });
            }
            res.status(200).json({ status: true, data: order });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

export const userPayment = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select('-password');
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        res.json({ status: true, user, razorpayID: process.env.KEY_ID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Error fetching user' });
    }
}


export const verifyPayment = async (req, res) => {
    try {
        const { response, orderDetails, checkoutId } = req.body;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            console.log("Invalid signature");
            res.status(400).json({ status: false, message: "invalid signature sent!" });
        }

        const newOrder = new Order({
            orderId: razorpay_order_id,
            customerId: orderDetails.customerId,
            shippingAddress: orderDetails.shippingAddress,
            paymentMethod: orderDetails.paymentMethod,
            orderTotal: orderDetails.orderTotal,
            shippingCost: orderDetails.shippingCost,
            discountAmount: orderDetails.discountAmount,
            couponID: orderDetails.couponID,
            couponDiscount: orderDetails.couponDiscount,
            offerDiscount: orderDetails.offerDiscount,
            products: orderDetails.products,
        });

        await newOrder.save();
        if (orderDetails.couponID) {
            const coupon = await Coupon.findById({ _id: orderDetails.couponID });
            if (coupon._id) {
                coupon.usedCount += 1;
                coupon.usageLimit -= 1;
                coupon.usedUsers.push(orderDetails.customerId);
                await coupon.save();
            }
        }



        if (checkoutId == 'null') {
            await Cart.deleteOne({ userId: orderDetails.customerId });
        }



        for (const product of orderDetails.products) {
            const foundProduct = await Product.findOne({ _id: product.productId });
            if (foundProduct) {
                const productVariation = foundProduct.variations.find(
                    (variation) => variation.size == parseInt(product.selectedSize)
                );

                if (productVariation) {
                    productVariation.stock -= product.quantity;
                    await foundProduct.save();
                }
            }
        }

        res.status(200).json({ status: true, order: newOrder })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const payByCod = async (req, res) => {
    try {
        const { orderDetails, checkoutId } = req.body;

        const newOrder = new Order({
            orderId: v4(),
            customerId: orderDetails.customerId,
            shippingAddress: orderDetails.shippingAddress,
            paymentMethod: orderDetails.paymentMethod,
            orderTotal: orderDetails.orderTotal,
            shippingCost: orderDetails.shippingCost,
            discountAmount: orderDetails.discountAmount,
            couponID: orderDetails.couponID,
            couponDiscount: orderDetails.couponDiscount,
            offerDiscount: orderDetails.offerDiscount,
            products: orderDetails.products,
        });

        await newOrder.save();
        if (orderDetails.couponID) {
            const coupon = await Coupon.findById({ _id: orderDetails.couponID });
            if (coupon._id) {
                coupon.usedCount += 1;
                coupon.usageLimit -= 1;
                coupon.usedUsers.push(orderDetails.customerId);
                await coupon.save();
            }
        }


        if (checkoutId == 'null') {
            await Cart.deleteOne({ userId: orderDetails.customerId });
        }

        for (const product of orderDetails.products) {
            const foundProduct = await Product.findOne({ _id: product.productId });
            if (foundProduct) {
                const productVariation = foundProduct.variations.find(
                    (variation) => variation.size == parseInt(product.selectedSize)
                );

                if (productVariation) {
                    productVariation.stock -= product.quantity;
                    await foundProduct.save();
                }
            }
        }

        res.status(200).json({ status: true, order: newOrder })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const pendingOrder = async (req, res) => {
    console.log('Creating pending order');
    try {
        const orderDetails = req.body.order;
        const newOrder = new Order({
            orderId: null,
            customerId: orderDetails.customerId,
            shippingAddress: orderDetails.shippingAddress,
            paymentMethod: 'pending',
            orderTotal: orderDetails.orderTotal,
            shippingCost: orderDetails.shippingCost,
            couponID: orderDetails.couponID,
            couponDiscount: orderDetails.couponDiscount,
            offerDiscount: orderDetails.offerDiscount,
            products: orderDetails.products,
        });

        await newOrder.save();

        if (req.body.checkoutId == 'null') {
            await Cart.deleteOne({ userId: orderDetails.customerId });
        }
        console.log('order saved');
        res.status(200).json({ status: true, order: newOrder })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const repayPendingOrder = async (req, res) => {
    try {
        const { response, order, paymentMethod } = req.body;
        if (response && response.razorpay_order_id && response.razorpay_payment_id) {
            const sign = response.razorpay_order_id + "|" + response.razorpay_payment_id;

            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
                .update(sign.toString())
                .digest("hex");

            if (response.razorpay_signature !== expectedSign) {
                console.log("Invalid signature");
                res.status(400).json({ status: false, message: "invalid signature sent!" });
            }
        }


        const PendingOrder = await Order.findOne({ _id: order._id })
        PendingOrder.orderId = response && response.razorpay_order_id ? response.razorpay_order_id : v4()
        PendingOrder.paymentMethod = paymentMethod

        await PendingOrder.save();

        if (PendingOrder.couponID) {
            const coupon = await Coupon.findById({ _id: PendingOrder.couponID });
            if (coupon._id) {
                coupon.usedCount += 1;
                coupon.usageLimit -= 1;
                coupon.usedUsers.push(PendingOrder.customerId);
                await coupon.save();
            }
        }

        for (const product of PendingOrder.products) {
            const foundProduct = await Product.findOne({ _id: product.productId });
            if (foundProduct) {
                const productVariation = foundProduct.variations.find(
                    (variation) => variation.size == parseInt(product.selectedSize)
                );

                if (productVariation) {
                    productVariation.stock -= product.quantity;
                    await foundProduct.save();
                }
            }
        }

        res.status(200).json({ status: true, order: PendingOrder })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}