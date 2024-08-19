import User from '../../model/user.js'
import Address from '../../model/address.js';


export const getAddresses = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const addresses = await Address.find({ userId: user._id });

        res.status(200).json({ status: true, addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

export const addNewAddress = async (req, res) => {
    const { address } = req.body;
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        if (address.isPrimary) {
            await Address.updateMany(
                { userId: user._id },
                { isPrimary: false }
            );
        }

        const newAddress = new Address({
            userId: user._id,
            ...address
        });

        const savedAddress = await newAddress.save();

        res.status(200).json({ status: true, address: savedAddress });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error' });
        console.error('Signup error:', error);
    }
}

export const editAddress = async (req, res) => {
    const { address } = req.body;
    const userId = address.userId;
  
    try {
      const updatedAddress = await Address.findByIdAndUpdate(
        address._id,
        address,
        { new: true, runValidators: true }
      );
  
      if (!updatedAddress) {
        return res.status(404).json({ status: false, message: 'Address not found' });
      }
  
      if (address.isPrimary) {
        await Address.updateMany(
          { userId: userId, _id: { $ne: address._id } },
          { isPrimary: false }
        );
      }
  
      res.status(200).json({ status: true, address: updatedAddress });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  }


export const deleteAddress = async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      const addressToDelete = await Address.findOne({ _id: id, userId: user._id });
      if (!addressToDelete) {
        return res.status(404).json({ status: false, message: 'Address not found or not authorized' });
      }
      if (addressToDelete.isPrimary) {
        const nextPrimaryAddress = await Address.findOne({ userId: user._id }).sort({ createdAt: 1 });
        if (nextPrimaryAddress) {
          await Address.updateOne({ _id: nextPrimaryAddress._id }, { $set: { isPrimary: true } });
        }
      }
      const result = await Address.deleteOne({ _id: id, userId: user._id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ status: false, message: 'Address not found or not authorized' });
      }
  
      res.status(200).json({ status: true });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Server error' });
      console.error('Error deleting address:', error);
    }
  }