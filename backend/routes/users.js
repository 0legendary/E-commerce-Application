import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Product from '../model/product.js';
import Image from '../model/image.js';

const router = Router();

router.get('/getProducts', authenticateToken, async (req, res) => {
    try {
        const products = await Product.find({})
          .populate('categoryId', 'name') 
          .populate('mainImage', 'image')
          .populate('additionalImages', 'image')
          .lean();
        res.status(201).json({ status: true, products });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
  });
  



  router.get('/shop/:id', authenticateToken, async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId)
            .populate('categoryId', 'name') // Populate category name
            .populate('mainImage', 'image') // Populate main image
            .populate('additionalImages', 'image'); // Populate additional images
        if (product) {  
            res.status(200).json({ status: true, product: product });
        } else {
            res.status(404).json({ status: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error fetching product' });
    }
});


export default router;

