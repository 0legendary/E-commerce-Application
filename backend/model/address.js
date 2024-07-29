import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  altPhone: { type: String },
  addressType: { type: String, enum: ['home', 'work'], required: true },
  isPrimary: { type: Boolean, default: false }
},{ timestamps: true });

const Address = mongoose.model('Address', addressSchema);

export default Address;