import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  isBlocked: {type: Boolean},
  offers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    }
  ]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
