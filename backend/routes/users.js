import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Product from '../model/product.js';
import User from '../model/user.js'
import Wallet from '../model/wallet.js'
import bcrypt from 'bcrypt'
import { generateOTP, sendOTPEmail } from '../utils/sendEmail.js';
import OTP from '../model/otp.js';
import Address from '../model/address.js';
import Cart from '../model/cart.js';
import Order from '../model/order.js';
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { v4 } from 'uuid'
const router = Router();

router.get('/getProducts', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('categoryId', 'name')
      .populate('mainImage', 'image')
      .populate('additionalImages', 'image')
      .lean();

    if (req.user && req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (user) {
        // Find the user's cart
        const cart = await Cart.findOne({ userId: user._id }).lean();
        if (cart) {
          // Extract product IDs from the cart
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
});

//without middle ware
router.get('/home/getProducts', async (req, res) => {
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
});


//without middle ware
router.get('/shop-product/:id', async (req, res) => {
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
});


router.get('/shop/:id', authenticateToken, async (req, res) => {
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
});


router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('name email mobile');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    res.json({ status: true, name: user.name, email: user.email, mobile: user.mobile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error fetching user' });
  }
});

router.put('/edit-user', authenticateToken, async (req, res) => {
  const { name, mobile } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { name, mobile },
      { new: true, runValidators: true }
    ).select('name mobile');

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    res.json({ status: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error updating user' });
  }
});



router.put('/edit-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.json({ status: false, message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({ status: false, message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ status: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error updating password' });
  }
});


router.get('/send-otp', authenticateToken, async (req, res) => {
  try {
    const otp = generateOTP()
    console.log(otp);
    const returnedAdmin = await User.findOne({ email: req.user.email });
    if (returnedAdmin) {
      const findAdminOTP = await OTP.findOne({ email: req.user.email })
      if (findAdminOTP) {
        findAdminOTP.otp = otp
        await findAdminOTP.save()
      } else {
        const newOTP = new OTP({
          email: req.user.email,
          otp
        });
        await newOTP.save();
      }
      await sendOTPEmail(req.user.email, otp);
      res.status(200).json({ status: true });
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});


router.post('/verify-otp', authenticateToken, async (req, res) => {
  const { otp } = req.body;
  try {
    const findAdmin = await OTP.findOne({ email: req.user.email });
    if (findAdmin.otp === otp) {
      await OTP.deleteOne({ email: req.user.email });
      res.status(200).json({ status: true });
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});


router.post('/reset-password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  try {
    const returnedUser = await User.findOne({ email: req.user.email });
    if (returnedUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      returnedUser.password = hashedPassword;
      returnedUser.save();
      res.status(200).json({ status: true });
    } else {
      res.status(200).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});


router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const addresses = await Address.find({ userId: user._id });

    res.status(200).json({ status: true, addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
});


router.post('/add-address', authenticateToken, async (req, res) => {
  const { address } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (address.isPrimary) {
      await Address.updateMany(
        { userId: user._id },
        { isPrimary: false }
      );
    }

    const newAddress = new Address({
      userId: user._id,
      ...address
    });

    const savedAddress = await newAddress.save();

    res.status(200).json({ status: true, address: savedAddress });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});

router.post('/edit-address', authenticateToken, async (req, res) => {
  const { address } = req.body;
  const userId = address.userId;

  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      address._id,
      address,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ status: false, message: 'Address not found' });
    }

    if (address.isPrimary) {
      await Address.updateMany(
        { userId: userId, _id: { $ne: address._id } },
        { isPrimary: false }
      );
    }

    res.status(200).json({ status: true, address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
});




router.delete('/delete-address/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const addressToDelete = await Address.findOne({ _id: id, userId: user._id });
    if (!addressToDelete) {
      return res.status(404).json({ status: false, message: 'Address not found or not authorized' });
    }
    if (addressToDelete.isPrimary) {
      const nextPrimaryAddress = await Address.findOne({ userId: user._id }).sort({ createdAt: 1 });
      if (nextPrimaryAddress) {
        await Address.updateOne({ _id: nextPrimaryAddress._id }, { $set: { isPrimary: true } });
      }
    }
    const result = await Address.deleteOne({ _id: id, userId: user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ status: false, message: 'Address not found or not authorized' });
    }

    res.status(200).json({ status: true });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Error deleting address:', error);
  }
});


router.post('/add-to-cart', authenticateToken, async (req, res) => {
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
          selectedSize: product.variations[0].size
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
        selectedSize: product.variations[0].size
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
});


router.post('/shop/add-to-cart', authenticateToken, async (req, res) => {
  const { productId, price, discountedPrice, selectedStock, selectedColor, selectedSize } = req.body;
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
          selectedSize
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
        selectedSize
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
});


//cart
router.get('/get-cart-products', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const cart = await Cart.findOne({ userId: user._id }).populate({
      path: 'products.productId',
      select: 'name mainImage',
      populate: {
        path: 'mainImage',
        select: 'image'
      }
    });

    if (!cart) {
      return res.status(404).json({ status: false });
    }


    const populatedProducts = cart.products.map(product => ({
      productId: product.productId._id,
      name: product.productId.name,
      mainImage: product.productId.mainImage.image,
      quantity: product.quantity,
      price: product.price,
      discountedPrice: product.discountedPrice,
      selectedColor: product.selectedColor,
      selectedSize: product.selectedSize,
      selectedStock: product.selectedStock,
      _id: product._id,
    }));
    res.status(200).json({ status: true, products: populatedProducts });
  } catch (error) {
    console.error('Error fetching cart products:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
});

router.delete('/delete-cart-items/:id', authenticateToken, async (req, res) => {
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
});

router.put('/update-cart-item/:itemId', authenticateToken, async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ status: false, message: 'Cart not found' });
    }

    const itemIndex = cart.products.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
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
});


router.put('/update-address/:address_id', authenticateToken, async (req, res) => {
  const { address_id } = req.params;
  try {
    const address = await Address.findById(address_id);

    if (!address) {
      return res.status(404).json({ status: false, message: 'Address not found' });
    }

    if (address.isPrimary) {
      return res.status(200).json({ status: true });
    }
    address.isPrimary = true;
    await address.save();

    await Address.updateMany(
      { userId: address.userId, _id: { $ne: address_id } },
      { isPrimary: false }
    );


    res.status(200).json({ status: true });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
});



//checkout

router.get('/checkout/:product_id', authenticateToken, async (req, res) => {
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
        select: 'name mainImage',
        populate: {
          path: 'mainImage',
          select: 'image'
        }
      });

      if (cart && cart.products.length > -1) {
        populatedProducts = cart.products.map(product => ({
          productId: product.productId._id,
          name: product.productId.name,
          mainImage: product.productId.mainImage.image,
          quantity: product.quantity,
          price: product.price,
          discountedPrice: product.discountedPrice,
          selectedColor: product.selectedColor,
          selectedSize: product.selectedSize,
          selectedStock: product.selectedStock,
          _id: product._id,
        }));
      } else {
        populatedProducts = []
      }
    } else {
      const product = await Product.findOne({ _id: product_id }).populate({
        path: 'mainImage',
        select: 'image'
      });
      let Variations = product.variations[0]
      populatedProducts = [{
        productId: product._id,
        name: product.name,
        mainImage: product.mainImage.image,
        quantity: 1,
        price: Variations.price,
        discountedPrice: Variations.discountPrice,
        selectedColor: Variations.color[0],
        selectedSize: Variations.size,
        selectedStock: Variations.stock,
        _id: product._id,
      }]
    }

    res.status(200).json({ status: true, addresses, products: populatedProducts });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
});


router.post('/payments', async (req, res) => {
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
});



router.get('/user-payment', authenticateToken, async (req, res) => {
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
});



router.post('/payment/verify', async (req, res) => {
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
      products: orderDetails.products,
    });

    await newOrder.save();

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

    res.status(200).json({ status: true })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/payment/cod', async (req, res) => {
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
      products: orderDetails.products,
    });

    await newOrder.save();

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

    res.status(200).json({ status: true })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



//orders

router.get('/all-orders', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const orders = await Order.find({ customerId: user._id })
      .populate({
        path: 'products.productId',
        select: 'mainImage',
        populate: {
          path: 'mainImage',
          select: 'image'
        }
      });
    res.json({ status: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error fetching user' });
  }
});

const updateStockOnCancel = async (orderId, productId) => {
  const order = await Order.findOne({ orderId });
  if (!order) return;

  const productInOrder = order.products.find(product => product._id.toString() === productId);
  if (!productInOrder) return;

  const product = await Product.findById(productInOrder.productId);
  if (!product) return;

  const variation = product.variations.find(v => v.size === parseInt(productInOrder.selectedSize));
  if (!variation) return;

  variation.stock += productInOrder.quantity;
  await product.save();
}

router.post('/update-order-status', async (req, res) => {
  const { orderId, productId, status } = req.body;

  try {
    const result = await Order.updateOne(
      { orderId, 'products._id': productId },
      { $set: { 'products.$.orderStatus': status } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ status: false, message: 'Order or product not found' });
    }

    if (status === 'canceled') {
      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ status: false, message: 'Order not found' });
      }

      const newTotal = order.products
        .filter(product => product.orderStatus !== 'canceled')
        .reduce((total, product) => total + product.discountPrice * product.quantity, 0);

      await Order.updateOne({ orderId }, { $set: { orderTotal: newTotal } });

      if (order.paymentMethod !== 'COD') {
        const canceledProduct = order.products.find(product =>
          product._id.toString() === productId && product.orderStatus === 'canceled'
        );
        if (!canceledProduct) {
          return res.status(404).json({ status: false, message: 'Canceled product not found' });
        }
        const refundAmount = canceledProduct.discountPrice * canceledProduct.quantity;
        let wallet = await Wallet.findOne({ userId: order.customerId });
        if (!wallet) {
          wallet = new Wallet({
            userId: order.customerId,
            balance: 0
          });
        }
        wallet.balance += refundAmount;

        await wallet.save();

        wallet.transactions.push({
          amount: refundAmount,
          type: 'credit',
          description: `Refund for canceled order`,
          createdAt: new Date()
        });

        await wallet.save();
      }
    }

    if (status !== 'returned') {
      await updateStockOnCancel(orderId, productId);
    }

    return res.json({ status: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
});


router.get('/wallet', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('-password');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const wallet = await Wallet.find({ userId: user._id })
    if (!wallet) res.json({ status: false });
    res.json({ status: true, wallet, userData: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Error fetching user' });
  }
});



router.post('/add-wallet', async (req, res) => {
  try {
    const { response, amount, description, userID } = req.body;
    console.log(description);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;


    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      console.log("Invalid signature");
      return res.status(400).json({ status: false, message: "Invalid signature sent!" });
    }

    let wallet = await Wallet.findOne({ userId: userID });
    if (!wallet) {
      wallet = new Wallet({
        userId: userID,
        balance: 0,
        transactions: []
      });
    }

    wallet.balance += amount;

    wallet.transactions.push({
      amount: amount,
      type: 'credit',
      description: description,
      createdAt: new Date()
    });

    await wallet.save();

    res.status(200).json({
      status: true,
      wallet: {
        balance: wallet.balance,
        transactions: wallet.transactions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "An error occurred" });
  }
});


export default router;

