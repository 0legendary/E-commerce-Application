import { Router } from 'express';
import User from '../model/user.js';
import OTP from '../model/otp.js';
import { generateOTP, sendOTPEmail } from '../utils/sendEmail.js'
import bcrypt from 'bcrypt';
import axios from 'axios';
import { authenticateToken, authenticateTokenAdmin, generateAccessToken, CheckAlreadyLogin } from '../middleware/authMiddleware.js';

const router = Router();


router.post('/verify-token', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Token is valid' });
});

router.post('/verify-token-admin', authenticateTokenAdmin, (req, res) => {
  res.status(200).json({ message: 'Token is valid' });
});

router.post('/verify-login', CheckAlreadyLogin, async (req, res) => {
  res.status(200).json({ Admin: req.user.isAdmin });
});

const createAdmin = async () => {
  const db = getDB();
  const adminName = 'Sherlock'
  const adminEmail = 'admin@gmail.com'
  const adminPass = 'admin123'

  const hashedPassword = await bcrypt.hash(adminPass, 10);
  await db.collection(Collections.admin).insertOne({ adminName, adminEmail, password: hashedPassword, createdAt: new Date() });
}



router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ status: false, message: 'Invalid email or password' });
    }
    //creating JWT for user for authorization
    const accessToken = generateAccessToken({ username: user.username, isAdmin: false })
    res.status(200).json({ status: true, message: 'Login successful', accessToken })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Login error:', error);
  }
});

router.post('/google/login', async (req, res) => {
  const { credential } = req.body
  const googleClientId = process.env.CLIENT_ID
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (response.data.aud !== googleClientId) {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    }
    const { email, sub, picture } = response.data;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: 'No account found' })
    }
    if(!user.isGoogleUser){
      user.googleId = sub
      user.profileImg = picture
      user.isGoogleUser = true
      user.save()
    }
    //creating JWT for user for authorization
    const accessToken = generateAccessToken({ email: email, isAdmin: false })
    res.status(200).json({ status: true, accessToken })
    
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Login error:', error);
  }
});


router.post('/otp/verify', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOTP()
    console.log(otp);
    const findUserOTP = await OTP.findOne({ email });
    const findUserData = await User.findOne({ email });
    if (!findUserData) {
      if (findUserOTP) {
        findUserOTP.otp = otp;
        await findUserOTP.save();
      } else {
        const newOTP = new OTP({
          email,
          otp
        });
        await newOTP.save();

      }
      await sendOTPEmail(email, otp);
      
      res.status(200).json({ status: true, message: 'OTP sent to your email for verification' });
    }else{
      res.status(200).json({ status: false, message: 'This email is already taken, try with another email' });
    }

  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});


router.post('/signup', async (req, res) => {
  const { username, email, password, otp } = req.body;
  try {
    const findUser = await OTP.findOne({ email });
    if (findUser.otp === otp.toString()) {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        name: username,
        email,
        password: hashedPassword,
        isGoogleUser: false
      });


      await newUser.save();
      await OTP.deleteOne({ email });
      const accessToken = generateAccessToken({ email: email, isAdmin: false })
      res.status(201).json({ status: true, accessToken })
    } else {
      res.status(201).json({
        status: false,
        message: 'OTP not matched',
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});

router.post('/google/signup', async (req, res) => {
  const { username, email, password, googleId, profileImg, otp } = req.body;
  try {
    const findUser = await OTP.findOne({ email });
    if (findUser.otp === otp.toString()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create new user
      const newUser = new User({
        name: username,
        email,
        password: hashedPassword,
        googleId,
        profileImg,
        isGoogleUser: true
      });

      await newUser.save();
      await OTP.deleteOne({ email });
      const accessToken = generateAccessToken({ email: email, isAdmin: false })
      res.status(201).json({ status: true, accessToken })

    } else {
      res.status(201).json({
        status: false,
        message: 'OTP not matched',
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});



export default router;

