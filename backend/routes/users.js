import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Product from '../model/product.js';
import Image from '../model/image.js';

const router = Router();

const getBase64Image = async (products) => {
  return await Promise.all(products.map(async product => {
      const mainImage = await Image.findById(product.mainImage);
      const additionalImages = await Promise.all(
          product.additionalImages.map(async id => await Image.findById(id))
      );

      return {
          ...product,
          mainImage: mainImage.image,
          additionalImages: additionalImages.map(image => image.image)
      };
  }));
}

router.get('/getProducts', authenticateToken, async (req, res) => {
  try {
      const products = await Product.find({}).lean();
      const populatedProducts = await getBase64Image(products)
      res.status(201).json({ status: true, products: populatedProducts });
  } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
  }
});



export default router;

