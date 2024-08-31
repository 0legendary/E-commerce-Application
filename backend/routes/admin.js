import { Router } from 'express';
import { authenticateTokenAdmin } from '../middleware/authMiddleware.js';
import { addImage, deleteImage, addNewProduct, getProducts, editProducts, updateProducts, moveToTrashProduct, deletePermenantly } from '../controllers/Admin/product.js';
import { getAllUser, toggleBlockUser } from '../controllers/Admin/user.js';
import { createNewCategory, deleteCategory, editCategory, getAllCategories, toggleCategory } from '../controllers/Admin/category.js';
import { getAllOrders } from '../controllers/Admin/orders.js';
import { createNewCoupon, editCoupon, getAllCoupons } from '../controllers/Admin/coupons.js';
import { createNewOfferAdmin, deleteOffer, editOfferAdmin, getOffersAdmin, toggleOffersAdmin } from '../controllers/Admin/offer.js';
import { topOrderCategory } from '../controllers/Admin/dashboard.js';

const router = Router();

// Products Management
router.post('/uploadImage', authenticateTokenAdmin, addImage);
router.post('/deleteImage', authenticateTokenAdmin, deleteImage);
router.post('/addProduct', authenticateTokenAdmin, addNewProduct)
router.get('/getProducts', authenticateTokenAdmin, getProducts);
router.get('/edit/getProduct/:id', authenticateTokenAdmin, editProducts);
router.put('/updateProduct', authenticateTokenAdmin, updateProducts);
router.post('/moveToTrash', authenticateTokenAdmin, moveToTrashProduct);
router.post('/deletePermanently', authenticateTokenAdmin, deletePermenantly);


//user management
router.get('/getAllUsers', authenticateTokenAdmin, getAllUser);
router.post('/toggleBlockUser', authenticateTokenAdmin, toggleBlockUser);


//category
router.get('/getAllCategories', authenticateTokenAdmin, getAllCategories);
router.post('/newCategory', authenticateTokenAdmin, createNewCategory)
router.put('/editCategory', authenticateTokenAdmin, editCategory);
router.delete('/deleteCategory/:_id', authenticateTokenAdmin, deleteCategory);
router.put('/toggleCategory', authenticateTokenAdmin, toggleCategory);




//orders
router.get('/all-orders', authenticateTokenAdmin, getAllOrders);


//coupons
router.get('/get-coupons', authenticateTokenAdmin, getAllCoupons);
router.post('/create-coupon', authenticateTokenAdmin, createNewCoupon);
router.post('/edit-coupon', authenticateTokenAdmin, editCoupon);


//offers
router.get('/get-offers', authenticateTokenAdmin, getOffersAdmin);
router.post('/delete-offer', authenticateTokenAdmin, deleteOffer);
router.post('/add-offer', authenticateTokenAdmin, createNewOfferAdmin);
router.post('/edit-offer', authenticateTokenAdmin, editOfferAdmin);
router.put('/toggle-offers', authenticateTokenAdmin, toggleOffersAdmin);
router.get('/top-orders-category', authenticateTokenAdmin, topOrderCategory);


export default router;

