import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
}, { timestamps: true });



const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
