import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String 
  },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
  },
  profileImg: {
    type: String,
  },
  isGoogleUser: {
    type: Boolean,
  },
  isBlocked: {
    type: Boolean,
  },
}, { timestamps: true });



const User = mongoose.model('User', userSchema);

export default User;
