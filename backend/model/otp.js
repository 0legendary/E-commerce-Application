import mongoose from 'mongoose';

const otpScheme = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    default: null,
  },
});


const OTP = mongoose.model('OTP', otpScheme);

export default OTP;

