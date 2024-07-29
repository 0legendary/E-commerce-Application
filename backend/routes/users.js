import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Product from '../model/product.js';
import User from '../model/user.js'
import bcrypt from 'bcrypt'
import { generateOTP, sendOTPEmail } from '../utils/sendEmail.js';
import OTP from '../model/otp.js';
import Address from '../model/address.js';
import Cart from '../model/cart.js';


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




export default router;

