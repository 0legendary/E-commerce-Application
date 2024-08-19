
import Product from '../../model/product.js';
import User from '../../model/user.js'
import Cart from '../../model/cart.js';
import Wishlist from '../../model/wishlist.js';
import Offer from '../../model/offer.js';


export const getProducts = async (req, res) => {
    try {
      const products = await Product.find({})
        .populate('categoryId', 'name')
        .populate('mainImage', 'image')
        .populate('additionalImages', 'image')
        .lean();
  
      if (req.user && req.user.email) {
        const user = await User.findOne({ email: req.user.email });
        if (user) {
          const cart = await Cart.findOne({ userId: user._id }).lean();
          if (cart) {
            const cartProductIds = cart.products.map(p => p.productId.toString());
            res.status(200).json({
              status: true,
              products,
              cartProducts: cartProductIds
            });
            return;
          }
        }
      }
      res.status(201).json({ status: true, products });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  }

export const getHomeProducts = async (req, res) => {
  try {
    // Fetch products and offers
    const products = await Product.find({})
      .populate('categoryId', 'name')
      .populate('mainImage', 'image')
      .populate('additionalImages', 'image')
      .lean();
    const offers = await Offer.find({}).populate('imageID', 'image');

    // Initialize cart and wishlist product IDs as empty arrays
    let cartProductIds = [];
    let wishlistProductIds = [];

    // Check if user is authenticated and has an email
    if (req.user && req.user.email) {
      const user = await User.findOne({ email: req.user.email });

      if (user) {
        // Find the user's cart
        const cart = await Cart.findOne({ userId: user._id }).lean();
        const wishlist = await Wishlist.findOne({ userId: user._id }).lean();

        // Check if cart and wishlist exist and are not null
        if (cart) {
          cartProductIds = cart.products ? cart.products.map(p => p.productId.toString()) : [];
        }

        if (wishlist) {
          wishlistProductIds = wishlist.products ? wishlist.products.map(v => v.productId.toString()) : [];
        }
      }
    }

    // Send the response
    res.status(200).json({
      status: true,
      products,
      offers,
      cartProducts: cartProductIds,
      wishlistProducts: wishlistProductIds
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
}


export const singleProductWithoutMiddleware = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId)
      .populate('categoryId', 'name')
      .populate('mainImage', 'image')
      .populate('additionalImages', 'image');
    if (product) {
      const offers = await Offer.find({
        $or: [
          { applicableTo: productId },
          { applicableTo: product.categoryId._id }
        ]
      })
      if (req.user && req.user.email) {
        const user = await User.findOne({ email: req.user.email });
        if (user) {
          const cart = await Cart.findOne({ userId: user._id }).lean();
          if (cart) {
            const cartProducts = cart.products.filter(p =>
              p.productId.equals(productId)
            );
            res.status(200).json({
              status: true,
              product,
              cartProducts: cartProducts,
              offers
            });
            return;
          }
        }
      }
      res.status(200).json({ status: true, product: product, offers });
    } else {
      res.status(404).json({ status: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error fetching product' });
  }
}

export const singleProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId)
      .populate('categoryId', 'name')
      .populate('mainImage', 'image')
      .populate('additionalImages', 'image');
    if (product) {
      if (req.user && req.user.email) {
        const user = await User.findOne({ email: req.user.email });
        if (user) {
          const cart = await Cart.findOne({ userId: user._id }).lean();
          if (cart) {
            const cartProducts = cart.products.filter(p =>
              p.productId.equals(productId)
            );
            res.status(200).json({
              status: true,
              product,
              cartProducts: cartProducts
            });
            return;
          }
        }
      }
      res.status(200).json({ status: true, product: product });
    } else {
      res.status(404).json({ status: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error fetching product' });
  }
}