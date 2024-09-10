import Product from '../../model/product.js';
import User from '../../model/user.js'
import Cart from '../../model/cart.js';
import Offer from '../../model/offer.js';
import { createResponse } from '../../utils/responseHelper.js';


export const addToCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json(createResponse(false, 'Product not found'));
    }
    let cart = await Cart.findOne({ userId: user._id });

    const product = await Product.findById(productId);
    const productDetails = product.variations[0];
    const productPrice = productDetails.price;
    const discountedPrice = productDetails.discountPrice || productPrice;
    if (!cart) {
      cart = new Cart({
        userId: user._id,
        products: [{
          productId: productId,
          quantity: 1,
          selectedStock: productDetails.stock,
          price: productPrice,
          discountedPrice: discountedPrice,
          selectedColor: product.variations[0].color[0],
          selectedSize: product.variations[0].size,
          categoryId: product.categoryId
        }],
        totalPrice: productPrice,
        totalDiscount: productPrice - discountedPrice
      });
    } else {
      cart.products.push({
        productId,
        price: productPrice,
        selectedStock: productDetails.stock,
        discountedPrice: discountedPrice,
        selectedColor: product.variations[0].color[0],
        selectedSize: product.variations[0].size,
        categoryId: product.categoryId
      });

      cart.totalPrice = cart.products.reduce((total, p) => total + (p.quantity * p.price), 0);
      cart.totalDiscount = cart.products.reduce((total, p) => total + (p.quantity * (p.price - p.discountedPrice || 0)), 0);
    }

    await cart.save();
    res.status(200).json(createResponse(true, 'Product added to cart'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
}

export const shopAddToCart = async (req, res) => {
  const { productId, price, discountedPrice, selectedStock, selectedColor, selectedSize, categoryId } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json(createResponse(false, 'User not found'));
    }

    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      cart = new Cart({
        userId: user._id,
        products: [{
          productId,
          quantity: 1,
          price,
          selectedStock,
          discountedPrice,
          selectedColor,
          selectedSize,
          categoryId
        }],
        totalPrice: price,
        totalDiscount: discountedPrice ? price - discountedPrice : 0
      });
    } else {
      cart.products.push({
        productId,
        price,
        selectedStock,
        discountedPrice,
        selectedColor,
        selectedSize,
        categoryId
      });

      cart.totalPrice = cart.products.reduce((total, p) => total + (p.quantity * p.price), 0);
      cart.totalDiscount = cart.products.reduce((total, p) => total + (p.quantity * (p.price - p.discountedPrice || 0)), 0);
    }

    await cart.save();

    const addedProduct = cart.products.find(p =>
      p.productId.equals(productId) &&
      p.selectedColor === selectedColor &&
      p.selectedSize == selectedSize
    );

    res.status(200).json(createResponse(true, 'Product added to cart', { product: addedProduct }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
}

export const getCartUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json(createResponse(false, 'User not found'));
    }

    const cart = await Cart.findOne({ userId: user._id }).populate({
      path: 'products.productId',
      select: 'name images categoryId',
      populate: {
        path: 'images',
        select: 'images'
      }
    });

    if (!cart) {
      return res.status(404).json({ status: false });
    }

    const populatedProducts = cart.products.map(product => ({
      productId: product.productId._id,
      name: product.productId.name,
      images: product.productId.images.images,
      quantity: product.quantity,
      price: product.price,
      discountedPrice: product.discountedPrice,
      selectedColor: product.selectedColor,
      selectedSize: product.selectedSize,
      selectedStock: product.selectedStock,
      categoryId: product.productId.categoryId,
      _id: product._id,
    }));


    const offers = await Offer.find({})
    res.status(200).json(createResponse(true, 'Cart retrieved successfully', {
      products: populatedProducts,
      offers: offers || []
    }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
}

export const deleteCartItems = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json(createResponse(false, 'User not found'));
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json(createResponse(false, 'Product not found in cart'));
    }

    const productIndex = cart.products.findIndex(product => product._id.toString() === id);
    if (productIndex === -1) {
      return res.status(404).json({ status: false, message: 'Product not found in cart' });
    }

    cart.products.splice(productIndex, 1);

    cart.totalPrice = cart.products.reduce((total, product) => total + (product.quantity * product.price), 0);
    cart.totalDiscount = cart.products.reduce((total, product) => total + (product.quantity * (product.price - product.discountedPrice || 0)), 0);

    await cart.save();

    res.status(200).json(createResponse(true, 'Product removed from cart', { cart }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
}

export const updateCartItems = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json(createResponse(false, 'User not found'));
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json(createResponse(false, 'Cart not found'));
    }

    const itemIndex = cart.products.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json(createResponse(false, 'Item not found in cart'));
    }

    const maxLimit = 5;
    const itemStock = cart.products[itemIndex].stock;

    let newQuantity = quantity;

    if (newQuantity > maxLimit) newQuantity = maxLimit;
    if (newQuantity > itemStock) newQuantity = itemStock;
    if (newQuantity < 1) newQuantity = 1;

    cart.products[itemIndex].quantity = newQuantity;
    cart.totalPrice = cart.products.reduce((total, product) => total + (product.quantity * product.price), 0);
    cart.totalDiscount = cart.products.reduce((total, product) => total + (product.quantity * (product.price - product.discountedPrice || 0)), 0);
    await cart.save();

    res.status(200).json(createResponse(true, 'Cart item updated successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
}