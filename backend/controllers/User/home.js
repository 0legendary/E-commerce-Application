
import Product from '../../model/product.js';
import User from '../../model/user.js'
import Cart from '../../model/cart.js';
import Wishlist from '../../model/wishlist.js';
import Offer from '../../model/offer.js';
import Review from '../../model/review.js';
import { createResponse } from '../../utils/responseHelper.js';


export const getUserDetails = async (req, res) => {
  try {
    let userName = null;
    let cartLength = 0
    let wishListLength = 0;
    if (req.user && req.user.email) {
      const user = await User.findOne({ email: req.user.email }).select('name _id');
      if (user) {
        userName = user.name
        const cart = await Cart.findOne({ userId: user._id }).lean();
        if (cart && cart.products.length > 0) {
          cartLength = cart.products.length
        }
        const wishlist = await Wishlist.findOne({ userId: user._id }).lean();
        if (wishlist && wishlist.products.length > 0) {
          wishListLength = wishlist.products.length
        }
      }
    }
    res.status(201).json(createResponse(true, 'User details fetched successfully', { userName, cartLength, wishListLength }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error fetching user details', null, error.message));
  }
}

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
          res.status(200).json(createResponse(true, 'Products fetched successfully', { products, cartProducts: cartProductIds }));
          return;
        }
      }
    }
    res.status(200).json(createResponse(true, 'Products fetched successfully', { products }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error fetching products', null, error.message));
  }
}

export const getHomeProducts = async (req, res) => {
  try {
    // Fetch products and offers
    const products = await Product.find({})
      .populate('categoryId', 'name')
      .populate('images','images')
      .lean();
    const offers = await Offer.find({}).populate('imageID', 'images');

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

    res.status(200).json(createResponse(true, 'Products and offers fetched successfully', {
      products,
      offers,
      cartProducts: cartProductIds,
      wishlistProducts: wishlistProductIds
    }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error fetching products', null, error.message));
  }
}


export const singleProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId)
      .populate('categoryId', 'name')
      .populate('images','images')

    if (product) {
      const offers = await Offer.find({
        $or: [
          { applicableTo: productId },
          { applicableTo: product.categoryId._id }
        ]
      })
      let cartProducts
      let isProductInWishlist = false;
      let reviews
      if (req.user && req.user.email) {
        const userData = await User.findOne({ email: req.user.email });

        if (userData) {
          const cart = await Cart.findOne({ userId: userData._id }).lean();
          if (cart) {
            cartProducts = cart.products.filter(p =>
              p.productId.equals(productId)
            );
          }

          const wishlist = await Wishlist.findOne({ userId: userData._id })
          if (wishlist) {
            isProductInWishlist = wishlist.products.filter(p =>
              p.productId.equals(productId)
            );
          }
          reviews = await Review.find({ productId: productId })
          .populate('imagesId');
        }
      }
      const relatedProducts = await Product.find({
        categoryId: product.categoryId._id,
        _id: { $ne: productId }
      }).populate('images', 'images').limit(4);

      res.status(200).json(createResponse(true, 'Product fetched successfully', {
        product,
        offers,
        isProductInWishlist: isProductInWishlist.length > 0 ? true : false,
        cartProducts: cartProducts ? cartProducts : [],
        reviews: reviews.length > 0 ? reviews : [],
        relatedProducts
      }));
    } else {
      res.status(404).json(createResponse(false, 'Product not found'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error fetching product', null, error.message));
  }
}

