import { Router } from 'express';
import  User  from '../model/user.js';
import bcrypt from 'bcrypt';
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



// router.post('/login', async (req, res) => {
//   const { email, password } = req.body
//   const db = getDB();
//   try {
//     const user = await db.collection(Collections.users).findOne({ email });
//     const Admin = await db.collection(Collections.admin).findOne({ adminEmail: email });
//     if (!user && !Admin) {
//       return res.status(400).json({ status: false, message: 'Invalid email or password' });
//     }
//     const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
//     const isPasswordValidAdmin = Admin ? await bcrypt.compare(password, Admin.password) : false;
//     if (!isPasswordValid && !isPasswordValidAdmin) {
//       return res.status(400).json({ status: false, message: 'Invalid email or password' });
//     }
//     //creating JWT for user for authorization
//     const accessToken = generateAccessToken(user ? { username: user.username, isAdmin: false } : { username: Admin.adminEmail, isAdmin: true })
//     let control = user ? 'user' : 'admin'
//     res.status(200).json({ status: true, control, message: 'Login successful', accessToken })


//   } catch (error) {
//     res.status(500).json({ status: false, message: 'Server error' });
//     console.error('Login error:', error);
//   }
// });



router.post('/signup', async (req, res) => {
  const { username, email, password, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(200).json({ status: false, message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name: username,
      email,
      mobile,
      password: hashedPassword,
    });

    // Save user to the database
    const savedUser = await newUser.save();

    // Send success response
    res.status(201).json({
      status: true,
      message: 'User created successfully',
      created: {
        _id: savedUser._id,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});



export default router;
