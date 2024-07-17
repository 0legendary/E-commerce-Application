import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, require: true },
  description: { type: String, require: true },
  category: { type: String, require: true },
  brand: { type: String, require: true },
  price: { type: String, require: true },
  discountPrice: { type: Number, require: true },
  stock: { type: String },
  sizeOptions: { type: [String] },
  colorOptions: { type: [String] },
  material: { type: String },
  mainImage: { type: String, require: true },
  additionalImages: { type: [String], require: true },
  weight: String,
  gender: String,
  season: String
});

const Product = mongoose.model('Product', productSchema);

export default Product