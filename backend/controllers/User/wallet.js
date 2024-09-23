import User from "../../model/user.js";
import Wallet from "../../model/wallet.js";
import crypto from 'crypto'
import { createResponse } from "../../utils/responseHelper.js";


export const getWallet = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('-password');
    if (!user) {
      return res.status(404).json(createResponse(false, 'User not found'));
    }
    const wallet = await Wallet.find({ userId: user._id })
    if (!wallet) return res.status(200).json(createResponse(false, 'Wallet not found'));
    res.status(200).json(createResponse(true, 'Wallet fetched successfully', { wallet, userData: user }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error fetching orders'));
  }
}


export const addWallet = async (req, res) => {
  try {
    const { response, amount, description, userID } = req.body;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;


    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json(createResponse(false, "Invalid signature sent!"));
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
    res.status(200).json(createResponse(true, 'Amount added to wallet',
      {
        wallet: {
          balance: wallet.balance,
          transactions: wallet.transactions
        }
      }));

  } catch (error) {
    res.status(500).json(createResponse(false, 'Error fetching wallet'));
  }
}