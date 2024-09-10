import User from "../../model/user.js";
import { createResponse } from "../../utils/responseHelper.js";

export const getAllUser = async (req, res) => {
    try {
        const users = await User.find({})
        return res.status(200).json(createResponse(true, 'Users fetched successfully', users));
    } catch (error) {
        return res.status(500).json(createResponse(false, 'Error fetching users', null, error.message));
    }
}

export const toggleBlockUser = async (req, res) => {
    const { id, isBlocked } = req.body;
    try {
        const user = await User.findById(id);
        if (user) {
            user.isBlocked = isBlocked;
            await user.save();
            return res.status(200).json(createResponse(true, 'User status updated successfully'));
        } else {
            return res.status(404).json(createResponse(false, 'User not found'));
        }
    } catch (error) {
        return res.status(500).json(createResponse(false, 'Error updating user status', null, error.message));
    }
};