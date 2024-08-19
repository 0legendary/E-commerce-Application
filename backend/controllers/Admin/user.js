import User from "../../model/user.js";

export const getAllUser = async (req, res) => {
    try {
        const users = await User.find({})
        res.status(201).json({ status: true, users: users });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}

export const toggleBlockUser = async (req, res) => {
    const { id, isBlocked } = req.body;
    try {
        const user = await User.findById(id);
        if (user) {
            user.isBlocked = isBlocked;
            await user.save();
            res.json({ status: true });
        } else {
            res.json({ status: false, message: 'User not found' });
        }
    } catch (error) {
        res.json({ status: false, message: 'Error updating user status', error });
    }
}