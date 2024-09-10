import User from '../../model/user.js'
import bcrypt from 'bcrypt'
import { generateOTP, sendOTPEmail } from '../../utils/sendEmail.js';
import OTP from '../../model/otp.js';
import { createResponse } from '../../utils/responseHelper.js';


export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select('name email mobile');
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }
        res.json(createResponse(true, 'User profile fetched successfully', { name: user.name, email: user.email, mobile: user.mobile }));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error fetching user'));
    }
}

export const editUserProfile = async (req, res) => {
    const { name, mobile } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { email: req.user.email },
            { name, mobile },
            { new: true, runValidators: true }
        ).select('name mobile');

        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        res.json(createResponse(true, 'Profile updated successfully', { user }));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error updating user'));
    }
}


export const editUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email: req.user.email });

        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Current password is incorrect'));
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json(createResponse(true, 'Password updated successfully'));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error updating password'));
    }
}

export const sendOTP = async (req, res) => {
    try {
        const otp = generateOTP()
        console.log(otp);
        const returnedAdmin = await User.findOne({ email: req.user.email });
        if (returnedAdmin) {
            const findAdminOTP = await OTP.findOne({ email: req.user.email })
            if (findAdminOTP) {
                findAdminOTP.otp = otp
                await findAdminOTP.save()
            } else {
                const newOTP = new OTP({
                    email: req.user.email,
                    otp
                });
                await newOTP.save();
            }
            await sendOTPEmail(req.user.email, otp);
            res.status(200).json(createResponse(true, 'OTP sent successfully'));
        } else {
            res.status(200).json(createResponse(false, 'No user found'));
        }
    } catch (error) {
        res.status(500).json(createResponse(false, 'Server error'));
    }
}

export const verifyOTP = async (req, res) => {
    const { otp } = req.body;
    try {
        const findAdmin = await OTP.findOne({ email: req.user.email });
        if (findAdmin.otp === otp) {
            await OTP.deleteOne({ email: req.user.email });
            res.status(200).json(createResponse(true, 'OTP verified successfully'));
        } else {
            res.status(200).json(createResponse(false, 'Invalid OTP'));
        }
    } catch (error) {
        res.status(500).json(createResponse(false, 'Server error'));
    }
}

export const resetPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const returnedUser = await User.findOne({ email: req.user.email });
        if (returnedUser) {
            const hashedPassword = await bcrypt.hash(password, 10);
            returnedUser.password = hashedPassword;
            returnedUser.save();
            res.status(200).json(createResponse(true, 'Password changed'));
        } else {
            res.status(200).json(createResponse(false, 'Something wrong while changing password'));
        }
    } catch (error) {
        res.status(500).json(createResponse(false, 'Server error'));
    }
}