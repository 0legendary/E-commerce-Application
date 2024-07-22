import mongoose from 'mongoose';

const variationSchema = new mongoose.Schema({
  size: { type: Number, required: true },
  stock: { type: Number, required: true },
  color: { type: Array, required: true },
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
    ref: 'Category', required: true
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
  mainImage: {
    type: String,
    required: true
  },
  additionalImages: {
    type: [String],
    required: true
  },
  gender: String,
  season: String
});

const Product = mongoose.model('Product', productSchema);

export default Product;
