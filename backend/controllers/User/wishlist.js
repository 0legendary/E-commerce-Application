import User from '../../model/user.js'
import Wishlist from '../../model/wishlist.js';

export const addToWishlist =async (req, res) => {
    const { productId } = req.body;
  
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
      let wishlist = await Wishlist.findOne({ userId: user._id });
  
      if (!wishlist) {
        wishlist = new Wishlist({
          userId: user._id,
          products: [{
            productId: productId,
          }],
        });
      } else {
        wishlist.products.push({
          productId,
        });
      }
      await wishlist.save();
      res.status(200).json({ status: true });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Server error' });
      console.error('Error deleting address:', error);
    }
  }

  export const getWishlistProducts = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      const wishlist = await Wishlist.findOne({ userId: user._id }).populate({
        path: 'products.productId',
        select: 'name brand variations images',
        populate: {
          path: 'images',
          select: 'images'
        }
      });
      if (!wishlist) {
        return res.status(404).json({ status: false });
      }
  
      console.log(wishlist.products[0].productId);
      const populatedProducts = wishlist.products.map(product => ({
        productId: product.productId._id,
        images: product.productId.images.images,
        name: product.productId.name,
        price: product.productId.variations[0].price,
        discountPrice: product.productId.variations[0].discountPrice,
        brand: product.productId.brand,
        stock: product.productId.variations[0].stock,
        _id: product._id,
      }));
  
      res.status(200).json({ status: true, products: populatedProducts });
    } catch (error) {
      console.error('Error fetching cart products:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  }

  export const deleteWishlistProduct = async (req, res) => {
    const { id } = req.params
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      const result = await Wishlist.updateOne(
        { userId: user._id },
        { $pull: { products: { productId: id } } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ status: false, message: 'Product not found in wishlist' });
      }
  
      res.status(200).json({ status: true });
    } catch (error) {
      console.error('Error fetching cart products:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  }