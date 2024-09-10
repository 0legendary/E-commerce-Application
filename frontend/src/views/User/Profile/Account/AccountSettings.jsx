import React, { useState, useEffect } from 'react';
import './AccountSettings.css';
import axiosInstance from '../../../../config/axiosConfig';
import { handleApiResponse } from '../../../../utils/utilsHelper';
import { editPasswordAuth, editProfileAuth } from '../../../../config/editProfileAuth';
import { otpVerification, signUpGoogleAuthenticate } from '../../../../config/authenticateCondition';
import OTPInput from 'react-otp-input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AccountSettings() {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState(null)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({})
    const [countdown, setCountdown] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showOtpPage, setShowOtpPage] = useState(false)
    const [otp, setOtp] = useState('')
    const [showNewPassInput, setShowNewPassInput] = useState(false)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/user/user');
                const { success, message, data } = await handleApiResponse(response);

                if (success) {
                    setName(data.name);
                    setEmail(data.email);
                    setMobile(data.mobile);
                } else {
                    console.error('Error:', message);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserData();
    }, []);


    useEffect(() => {
        if (countdown === null) return;
        const timer = setTimeout(() => {
            if (countdown > 0) {
                setCountdown(countdown - 1);
            } else {
                setButtonEnabled(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const handleEditClick = () => {
        setIsEditing(true);
        setIsUpdatingPassword(false);
    };

    const handleUpdatePasswordClick = () => {
        setIsEditing(false);
        setIsUpdatingPassword(true);
    };

    const handleSave = async () => {
        let errors = editProfileAuth(name, mobile);
        setErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                // Await the PUT request
                const response = await axiosInstance.put('/user/edit-user', { name, mobile });
                // Await the handling of the API response
                const { success, message, data } = await handleApiResponse(response);

                if (success) {
                    setName(data.user.name);
                    setMobile(data.user.mobile || null);
                    setErrors({});
                    setIsEditing(false);

                    toast.success('Profile updated successfully', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else {
                    toast.error(`Error: ${message}`, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
            } catch (error) {
                toast.error('Error updating profile', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                console.error('Error updating user:', error);
            }
        }
    };


    const handlePasswordChange = async () => {
        let errors = editPasswordAuth(currentPassword, newPassword, confirmPassword);
        setErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const response = await axiosInstance.put('/user/edit-password', { currentPassword, newPassword });
                const { success, message } = await handleApiResponse(response);

                if (success) {
                    setNewPassword('');
                    setCurrentPassword('');
                    setConfirmPassword('');
                    setErrors({});
                    setIsEditing(false);
                    setIsUpdatingPassword(false);

                    toast.success('Password changed successfully', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else {
                    toast.error(message, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
            } catch (error) {
                toast.error('Error updating password', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                console.error('Error updating password:', error);
            }
        }
    };

    const handleForgotPass = (e) => {
        e.preventDefault()
        sendOTP(e)
        setIsUpdatingPassword(false)
        setShowOtpPage(true)
    }

    const sendOTP = async (e) => {
        e.preventDefault();

        try {
            const response = await axiosInstance.get('/user/send-otp');
            const { success, message } = await handleApiResponse(response);

            if (success) {
                setCountdown(10);
                setButtonEnabled(false);
                setErrors({});
                toast.success(message, {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else {
                toast.error(message, {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        } catch (error) {
            toast.error('Error sending OTP', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            console.error('Error sending OTP:', error);
        }
    };


    const verifyOTP = async (e) => {
        e.preventDefault();

        // Validate OTP
        let newErrors = otpVerification(otp);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await axiosInstance.post('/user/verify-otp', { otp });
                const { success, message } = await handleApiResponse(response);

                if (success) {
                    toast.success(message, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });

                    // Handle post-success actions
                    setTimeout(() => {
                        setShowOtpPage(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setShowNewPassInput(true);
                    }, 2000);
                } else {
                    toast.error('Something went wrong', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
            } catch (error) {
                console.error('Error verifying OTP:', error);
                toast.error('Error verifying OTP', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        }
    };


    const updatePassword = async (e) => {
        e.preventDefault();
        let newErrors = {};
        newErrors = signUpGoogleAuthenticate(newPassword, confirmPassword);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await axiosInstance.post('/user/reset-password', { password: newPassword });
                const { success, message } = await handleApiResponse(response);

                if (success) {
                    toast.success(message, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setNewPassword('');
                    setConfirmPassword('');
                    setTimeout(() => {
                        setShowOtpPage(false);
                        setShowNewPassInput(false);
                        setIsEditing(false);
                        setIsUpdatingPassword(false);
                    }, 1000);
                } else {
                    toast.error('Something went wrong, try again later', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setShowOtpPage(false);
                    setShowNewPassInput(false);
                }
            } catch (error) {
                console.error('Error updating password:', error);
                toast.error('Error updating password', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        }
    }


    return (
        <div className="container acc-setting mt-5">
            <ToastContainer />
            {!isEditing && !isUpdatingPassword && !showOtpPage && !showNewPassInput && (
                <div className="card bg-dark text-white">
                    <div className="card-body">
                        <h2 className="card-title">Account Settings</h2>
                        <p className="card-text"><strong>Name:</strong> {name}</p>
                        <p className="card-text"><strong>Email:</strong> {email}</p>
                        <p className="card-text"><strong>Mobile number:</strong> {mobile ? mobile : 'No mobile number'}</p>
                        <div className="d-flex justify-content-between mt-3">
                            <button className="btn btn-primary" onClick={handleEditClick}>Edit</button>
                            <button className="btn btn-secondary" onClick={handleUpdatePasswordClick}>Update Password</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="card bg-dark text-white mt-4">
                    <div className="card-body">
                        <h2 className="card-title">Edit Account</h2>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && <p className="text-danger mt-2">{errors.name}</p>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mobile</label>
                            <input
                                type="number"
                                className="form-control"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                            {errors.mobile && <p className="text-danger mt-2">{errors.mobile}</p>}
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}


            {isUpdatingPassword && (
                <div className="card bg-dark text-white mt-4">
                    <div className="card-body">
                        <h2 className="card-title">Update Password</h2>
                        <div className="mb-3">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            {errors.currPass && <p className="text-danger mt-2">{errors.currPass}</p>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {errors.newPass && <p className="text-danger mt-2">{errors.newPass}</p>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {errors.confirmNewPass && <p className="text-danger mt-2">{errors.confirmNewPass}</p>}
                        </div>
                        <button className="btn btn-link text-warning float-end" onClick={handleForgotPass}>Forgot password?</button>
                        <div className="d-flex justify-content-between mt-3">
                            <button className="btn btn-primary" onClick={handlePasswordChange}>Update</button>
                            <button className="btn btn-secondary" onClick={() => setIsUpdatingPassword(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showOtpPage && (
                <div className="card bg-dark text-white mt-4">
                    <div className="card-body">
                        <h2 className="card-title">Verify OTP</h2>
                        <label className="form-label" htmlFor="otp">Enter OTP</label>
                        <OTPInput
                            value={otp}
                            onChange={(otp) => {
                                setOtp(otp.replace(/[^0-9]/g, ''));
                                setErrors((prevErrors) => ({
                                    ...prevErrors,
                                    otp: '',
                                    unAuthorised: ''
                                }));
                            }}
                            numInputs={6}
                            separator={<span>-</span>}
                            inputStyle={{
                                width: '2.5rem',
                                height: '2.5rem',
                                margin: '0 0.5rem',
                                fontSize: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                            focusStyle={{
                                border: '1px solid #007bff',
                                outline: 'none',
                            }}
                            renderInput={(inputProps) => (
                                <input {...inputProps} />
                            )}
                        />
                        <div className="mt-3">
                            {buttonEnabled ? (
                                <button className="btn btn-link text-warning" onClick={sendOTP}>Resend OTP</button>
                            ) : (
                                <button className="btn btn-link text-secondary" disabled>Resend OTP in {countdown}</button>
                            )}
                        </div>
                        {errors.unAuthorised && <div className="text-danger mt-2">{errors.unAuthorised}</div>}
                        {errors.otp && <div className="text-danger mt-2">{errors.otp}</div>}
                        <div className="d-flex justify-content-between mt-3">
                            <button className="btn btn-primary" onClick={verifyOTP}>Verify OTP</button>
                        </div>
                    </div>
                </div>
            )}


            {showNewPassInput && (
                <div className="card bg-dark text-white mt-4">
                    <div className="card-body">
                        <h2 className="card-title">Set New Password</h2>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="password">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {errors.password && <div className="text-danger mt-2">{errors.password}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {errors.confirmPassword && <div className="text-danger mt-2">{errors.confirmPassword}</div>}
                        </div>
                        {errors.unAuthorised && <p className="text-danger mt-2">{errors.unAuthorised}</p>}
                        <div className="d-flex justify-content-between mt-3">
                            <button className="btn btn-primary" onClick={updatePassword}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountSettings;
