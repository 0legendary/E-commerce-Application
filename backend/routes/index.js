import { Router } from 'express';
import User from '../model/user.js';
import Admin from '../model/admin.js';
import OTP from '../model/otp.js';
import { generateOTP, sendOTPEmail } from '../utils/sendEmail.js'
import {createResponse} from '../utils/responseHelper.js'
import bcrypt from 'bcrypt';
import axios from 'axios';
import { authenticateToken, authenticateTokenAdmin, generateAccessToken, CheckAlreadyLogin } from '../middleware/authMiddleware.js';

const router = Router();


router.post('/verify-token', authenticateToken, (req, res) => {
  res.status(200).json(createResponse(true, 'Token is valid'));
});

router.post('/verify-token-admin', authenticateTokenAdmin, (req, res) => {
  res.status(200).json(createResponse(true, 'Token is valid'));

});

router.post('/verify-login', CheckAlreadyLogin, async (req, res) => {
  res.status(200).json(createResponse(true, 'Token is valid', { Admin: req?.user?.isAdmin }));
});


const generateReferralCode = () => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};


const registerUser = async (userData, referralCode) => {
  const referralOffer = {
    referrerReward: 50,
    refereeReward: 50
  };

  const referrer = await User.findOne({ referralCode });
  const newUser = new User({
    ...userData,
    referralCode: generateReferralCode(),
    referredBy: referrer ? referrer._id : null,
    referralRewards: [{
      rewardAmount: referralOffer.refereeReward,
      status: 'pending'
    }]
  });
  await newUser.save();

  if (referrer) {
    referrer.referralRewards.push({
      rewardAmount: referralOffer.referrerReward,
      status: 'pending'
    });
    await referrer.save();
  }
};

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = new Admin({
    name: 'Sherlock',
    email: 'bitsandbytes.alen@gmail.com',
    password: hashedPassword
  });


  await admin.save(admin)
}




router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.isBlocked) {
      return res.status(200).json(createResponse(false, 'Invalid email or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json(createResponse(false, 'Invalid email or password'));
    }

    // Creating JWT for user for authorization
    const accessToken = generateAccessToken({ email: user.email, isAdmin: false });
    res.status(200).json(createResponse(true, 'Login successful', { accessToken }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error'));
    console.error('Login error:', error);
  }
});



router.post('/google/login', async (req, res) => {
  const { credential } = req.body;
  const googleClientId = process.env.CLIENT_ID;
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);

    if (response.data.aud !== googleClientId) {
      return res.status(401).json(createResponse(false, 'Invalid token'));
    }

    const { email, sub, picture } = response.data;
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json(createResponse(false, 'No account found'));
    }

    if (user.isBlocked) {
      return res.status(400).json(createResponse(false, 'Unauthorized'));
    }

    if (!user.isGoogleUser) {
      user.googleId = sub;
      user.profileImg = picture;
      user.isGoogleUser = true;
      user.isBlocked = false;
      await user.save();
    }

    // Creating JWT for user for authorization
    const accessToken = generateAccessToken({ email: email, isAdmin: false });
    res.status(200).json(createResponse(true, 'Login successful', { accessToken }));

  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error'));
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

      res.status(200).json(createResponse(true, 'OTP sent to your email for verification'));

    } else {
      res.status(404).json(createResponse(false, 'This email is already taken, try with another email'));
    }

  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
});



router.post('/forgot-pass/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp}`);

    const user = await User.findOne({ email });
    if (user) {
      let otpRecord = await OTP.findOne({ email });
      if (otpRecord) {
        otpRecord.otp = otp;
      } else {
        otpRecord = new OTP({ email, otp });
      }
      await otpRecord.save();

      await sendOTPEmail(email, otp);
      res.status(200).json(createResponse(true, 'OTP sent successfully'));
    } else {
      res.status(404).json(createResponse(false, 'User not found'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
    console.error('Send OTP error:', error);
  }
});

router.post('/forgot-pass/reset-password', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json(createResponse(true, 'Password changed successfully'));
    } else {
      res.status(404).json(createResponse(false, 'User not found'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
    console.error('Reset password error:', error);
  }
});


router.post('/forgot-pass/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const findUser = await OTP.findOne({ email });
    if (findUser && findUser.otp === otp) {
      await OTP.deleteOne({ email });
      res.status(200).json(createResponse(true, 'OTP verified successfully'));
    } else {
      res.status(400).json(createResponse(false, 'Invalid OTP'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
    console.error('Verify OTP error:', error);
  }
});

router.post('/signup', async (req, res) => {
  const { username, email, password, otp, referralCode } = req.body;

  try {
    const findUser = await OTP.findOne({ email });

    if (findUser && findUser.otp === otp.toString()) {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const userData = {
        name: username,
        email,
        password: hashedPassword,
        isGoogleUser: false
      };
      
      await registerUser(userData, referralCode);

      await OTP.deleteOne({ email });

      // Creating JWT for user for authorization
      const accessToken = generateAccessToken({ email, isAdmin: false });

      res.status(201).json(createResponse(true, 'Account created successfully', { accessToken }));
    } else {
      res.status(400).json(createResponse(false, 'OTP not matched'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
    console.error('Signup error:', error);
  }
});


router.post('/google/signup', async (req, res) => {
  const { username, email, password, googleId, profileImg, otp, referralCode } = req.body;

  try {
    const findUser = await OTP.findOne({ email });

    if (findUser && findUser.otp === otp.toString()) {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        name: username,
        email,
        password: hashedPassword,
        googleId,
        profileImg,
        isGoogleUser: true,
        isBlocked: false
      };

      await registerUser(newUser, referralCode);

      await OTP.deleteOne({ email });

      // Creating JWT for user for authorization
      const accessToken = generateAccessToken({ email, isAdmin: false });

      res.status(201).json(createResponse(true, 'Account created successfully', { accessToken }));
    } else {
      res.status(400).json(createResponse(false, 'OTP not matched'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
    console.error('Signup error:', error);
  }
});




// Admin Authentication

router.post('/admin/google/login', async (req, res) => {
  const { credential } = req.body;
  const googleClientId = process.env.CLIENT_ID;
  
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (response.data.aud !== googleClientId) {
      return res.status(401).json(createResponse(false, 'Invalid token'));
    }

    const { email, sub, picture } = response.data;

    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(200).json(createResponse(false, 'No account found'));
    }

    if (!admin.isGoogleUser) {
      admin.googleId = sub;
      admin.profileImg = picture;
      admin.isGoogleUser = true;
      admin.isBlocked = false;
      await admin.save();
    }

    // Creating JWT for user for authorization
    const accessToken = generateAccessToken({ email: email, isAdmin: true });
    
    res.status(200).json(createResponse(true, 'Login successful', { accessToken }));

  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
    console.error('Login error:', error);
  }
});




router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json(createResponse(false, 'Invalid email or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json(createResponse(false, 'Invalid email or password'));
    }

    const accessToken = generateAccessToken({ username: user.username, isAdmin: true });
    res.status(200).json(createResponse(true, 'Login successful', { accessToken }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
});



router.post('/admin/forgot-pass/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOTP();
    console.log(otp);
    const returnedAdmin = await Admin.findOne({ email });

    if (returnedAdmin) {
      const findAdminOTP = await OTP.findOne({ email });
      if (findAdminOTP) {
        findAdminOTP.otp = otp;
        await findAdminOTP.save();
      } else {
        const newOTP = new OTP({ email, otp });
        await newOTP.save();
      }
      await sendOTPEmail(email, otp);
      res.status(200).json(createResponse(true, 'New OTP sent to your email'));
    } else {
      res.status(200).json(createResponse(false, 'Admin not found'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
    console.error('Send OTP error:', error);
  }
});

router.post('/admin/forgot-pass/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const findAdmin = await OTP.findOne({ email });
    if (findAdmin.otp === otp) {
      await OTP.deleteOne({ email });
      res.status(200).json(createResponse(true, 'OTP verified successfully'));
    } else {
      res.status(200).json(createResponse(false, 'Invalid OTP'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
});




router.post('/admin/reset-password', async (req, res) => {
  const { email, password } = req.body;
  try {
    const returnedAdmin = await Admin.findOne({ email });
    if (returnedAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      returnedAdmin.password = hashedPassword;
      returnedAdmin.save();
      res.status(200).json(createResponse(true, 'Password reset successfully', null));
    } else {
      res.status(200).json(createResponse(false, 'Admin not found'));
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Server error', null, error.message));
  }
});


export default router;

