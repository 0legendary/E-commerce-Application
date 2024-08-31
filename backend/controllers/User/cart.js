import Product from '../../model/product.js';
import User from '../../model/user.js'
import Cart from '../../model/cart.js';
import Offer from '../../model/offer.js';


export const addToCart = async (req, res) => {
    const { productId } = req.body;
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
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
      res.status(200).json({ status: true });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Server error' });
      console.error('Error deleting address:', error);
    }
  }

  export const shopAddToCart = async (req, res) => {
    const { productId, price, discountedPrice, selectedStock, selectedColor, selectedSize, categoryId } = req.body;
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
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
  
      res.status(200).json({ status: true, product: addedProduct });
  
    } catch (error) {
      res.status(500).json({ status: false, message: 'Server error' });
      console.error('Error adding to cart:', error);
    }
  }

  export const getCartUser = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
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
  
      console.log(cart.products[0].productId);
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


      const offers =await Offer.find({})
      res.status(200).json({ status: true, products: populatedProducts, offers: offers ? offers : [] });
    } catch (error) {
      console.error('Error fetching cart products:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  }

  export const deleteCartItems = async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      const cart = await Cart.findOne({ userId: user._id });
      if (!cart) {
        return res.status(404).json({ status: false, message: 'Cart not found' });
      }
  
      const productIndex = cart.products.findIndex(product => product._id.toString() === id);
      if (productIndex === -1) {
        return res.status(404).json({ status: false, message: 'Product not found in cart' });
      }
  
      cart.products.splice(productIndex, 1);
  
      cart.totalPrice = cart.products.reduce((total, product) => total + (product.quantity * product.price), 0);
      cart.totalDiscount = cart.products.reduce((total, product) => total + (product.quantity * (product.price - product.discountedPrice || 0)), 0);
  
      await cart.save();
  
      res.status(200).json({ status: true, cart });
    } catch (error) {
      console.error('Error deleting product from cart:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  }

  export const updateCartItems = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        console.log(1);
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      const cart = await Cart.findOne({ userId: user._id });
      if (!cart) {
        console.log(2);
        return res.status(404).json({ status: false, message: 'Cart not found' });
      }
  
      const itemIndex = cart.products.findIndex(item => item._id.toString() === itemId);
      if (itemIndex === -1) {
        console.log(3);
        return res.status(404).json({ status: false });
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
  
      res.status(200).json({ status: true });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  }