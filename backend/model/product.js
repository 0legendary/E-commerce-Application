import mongoose from 'mongoose';

const variationSchema = new mongoose.Schema({
  size: { type: Number, required: true },
  stock: { type: Number, required: true },
  color: { type: [String], required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  weight: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  variations: [variationSchema],
  material: {
    type: String,
    required: true
  },
  images: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true
  },
  gender: String,
  season: String,
  offers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    }
  ]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
