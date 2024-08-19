import { Router } from 'express';
import { authenticateToken, getUser } from '../middleware/authMiddleware.js';
import { getHomeProducts, getProducts, singleProduct, singleProductWithoutMiddleware } from '../controllers/User/home.js';
import { editUserPassword, editUserProfile, getUserProfile, resetPassword, sendOTP, verifyOTP } from '../controllers/User/userProfile.js';
import { addNewAddress, deleteAddress, editAddress } from '../controllers/User/Address.js';
import { addToCart, deleteCartItems, getCartUser, shopAddToCart, updateCartItems } from '../controllers/User/cart.js';
import { checkoutProduct, payByCod, payment, pendingOrder, repayPendingOrder, userPayment, verifyPayment } from '../controllers/User/checkout.js';
import { getAllOrders, updateOrderStatus } from '../controllers/User/order.js';
import { addWallet, getWallet } from '../controllers/User/wallet.js';
import { addToWishlist, deleteWishlistProduct, getWishlistProducts } from '../controllers/User/wishlist.js';
import { applyCoupon, getCoupons } from '../controllers/User/coupon.js';

const router = Router();

//home
router.get('/getProducts', authenticateToken, getProducts);
//without middle ware
router.get('/home/getProducts', getUser, getHomeProducts);
//without middle ware
router.get('/shop-product/:id', singleProductWithoutMiddleware);
router.get('/shop/:id', authenticateToken, singleProduct);


// user profile
router.get('/user', authenticateToken, getUserProfile);
router.put('/edit-user', authenticateToken, editUserProfile);
router.put('/edit-password', authenticateToken, editUserPassword);
router.get('/send-otp', authenticateToken, sendOTP);
router.post('/verify-otp', authenticateToken, verifyOTP);
router.post('/reset-password', authenticateToken, resetPassword);

//address
router.get('/addresses', authenticateToken, );
router.post('/add-address', authenticateToken, addNewAddress);
router.post('/edit-address', authenticateToken, editAddress);
router.delete('/delete-address/:id', authenticateToken, deleteAddress);

// cart
router.post('/add-to-cart', authenticateToken, addToCart);
router.post('/shop/add-to-cart', authenticateToken, shopAddToCart);
router.get('/get-cart-products', authenticateToken, getCartUser);
router.delete('/delete-cart-items/:id', authenticateToken, deleteCartItems);
router.put('/update-cart-item/:itemId', authenticateToken, updateCartItems);


//checkout
router.get('/checkout/:product_id', authenticateToken, checkoutProduct);
router.post('/payments', payment);
router.get('/user-payment', authenticateToken, userPayment);
router.post('/payment/verify', verifyPayment);
router.post('/payment/cod', payByCod);
router.post('/pendingOrder', pendingOrder);
router.post('/pay/pending-payment', repayPendingOrder);


//orders
router.get('/all-orders', authenticateToken, getAllOrders);
router.post('/update-order-status', updateOrderStatus);

//wallet
router.get('/wallet', authenticateToken, getWallet);
router.post('/add-wallet', addWallet);


//wishlist
router.post('/add-to-wishlist', authenticateToken, addToWishlist);
router.get('/get-wishlist-products', authenticateToken, getWishlistProducts);
router.delete('/delete-wishlist-item/:id', authenticateToken, deleteWishlistProduct);


//coupons
router.post('/apply-coupon', authenticateToken, applyCoupon);
router.get('/get-coupons', authenticateToken, getCoupons);


export default router;

