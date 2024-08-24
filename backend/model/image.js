import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  images: [
    {
      uuid: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number, required: true },
      mimeType: { type: String, required: true },
      cdnUrl: { type: String, required: true },
      mainImage: {type: Boolean, default: false}
    }
  ]
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);

export default Image;
