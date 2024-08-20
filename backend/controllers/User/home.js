
import Product from '../../model/product.js';
import User from '../../model/user.js'
import Cart from '../../model/cart.js';
import Wishlist from '../../model/wishlist.js';
import Offer from '../../model/offer.js';
import Review from '../../model/review.js';


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


export const singleProduct = async (req, res) => {
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
      let cartProducts
      let isProductInWishlist = false;
      let reviews
      if (req.user && req.user.email) {
        const userData = await User.findOne({ email: req.user.email });

        if (userData) {
          const cart = await Cart.findOne({ userId: userData._id }).lean();
          //console.log(cart);
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
            .populate('imagesId', 'image');
        }
      }
      res.status(200).json({
        status: true,
        product,
        offers,
        isProductInWishlist: isProductInWishlist.length > 0 ? true : false,
        cartProducts: cartProducts ? cartProducts : [],
        reviews: reviews.length > 0 ? reviews : []
      });

    } else {
      res.status(404).json({ status: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error fetching product' });
  }
}

