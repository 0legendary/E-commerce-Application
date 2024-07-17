import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  image: {
    type: String,
  }
});



const Image = mongoose.model('Image', imageSchema);

export default Image;
