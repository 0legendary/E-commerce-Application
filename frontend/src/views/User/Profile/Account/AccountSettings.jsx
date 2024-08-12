import React, { useState, useEffect } from 'react';
import './AccountSettings.css';
import axiosInstance from '../../../../config/axiosConfig';
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
        axiosInstance.get('/user/user')
            .then(response => {
                if (response.data.status) {
                    setName(response.data.name)
                    setEmail(response.data.email)
                    setMobile(response.data.mobile)
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
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


    const handleSave = () => {
        let Errors = editProfileAuth(name, mobile)
        setErrors(Errors)
        if (Object.keys(Errors).length === 0) {
            axiosInstance.put('/user/edit-user', { name, mobile })
                .then(response => {
                    if (response.data.status) {
                        setName(response.data.user.name);
                        setMobile(response.data.user.mobile ? response.data.user.mobile : null);
                        setErrors({})
                        setIsEditing(false);
                        toast.success('Profile updated', {
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                    }
                })
                .catch(error => {
                    toast.error('Error while updating profile', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    console.error('Error updating user:', error);
                });
        }
    };

    const handlePasswordChange = () => {
        let Errors = editPasswordAuth(currentPassword, newPassword, confirmPassword)
        setErrors(Errors)
        if (Object.keys(Errors).length === 0) {
            axiosInstance.put('/user/edit-password', { currentPassword, newPassword })
                .then(response => {
                    if (response.data.status) {
                        setNewPassword('')
                        setCurrentPassword('')
                        setConfirmPassword('')
                        setErrors({})
                        setIsEditing(false);
                        setIsUpdatingPassword(false);
                        toast.success('Password changed', {
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                    } else {
                        toast.error(response.data.message, {
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                    }
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                });
        }
    };


    const handleForgotPass = (e) => {
        e.preventDefault()
        sendOTP(e)
        setIsUpdatingPassword(false)
        setShowOtpPage(true)
    }

    const sendOTP = (e) => {
        e.preventDefault()
        axiosInstance.get('/user/send-otp')
            .then(response => {
                if (response.data.status) {
                    setCountdown(10)
                    setButtonEnabled(false)
                    setErrors({})
                    toast.success('OTP send to your verified Email', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else {
                    toast.error('Verification Failed', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
            })
            .catch(error => {
                console.error('Error sending login data:', error);
            });
    }

    const verifyOTP = (e) => {
        e.preventDefault()
        let newErrors = {};
        newErrors = otpVerification(otp)
        console.log(newErrors);
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            axiosInstance.post('/user/verify-otp', { otp: otp })
                .then(response => {
                    if (response.data.status) {
                        toast.success('OTP verified', {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                        setTimeout(() => {
                            setShowOtpPage(false)
                            setNewPassword('')
                            setConfirmPassword('')
                            setShowNewPassInput(true)
                        }, 2000);
                    }else{
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
                })
        }
    }


  const updatePassword = (e) => {
    e.preventDefault()
    let newErrors = {}
    newErrors = signUpGoogleAuthenticate(newPassword, confirmPassword)
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      axiosInstance.post('/user/reset-password', { password: newPassword })
        .then(response => {
          if (response.data.status) {
            toast.success('Password changed', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => {
              setShowOtpPage(false)
              setShowNewPassInput(false)
              setIsEditing(false)
              setIsUpdatingPassword(false)
            }, 1000);
          } else {
            toast.error('something went wrong, try again later', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setShowOtpPage(false)
            setShowNewPassInput(false)
          }
        })
    }
  }


    return (
        <div className="container acc-setting mt-5">
            <ToastContainer/>
            {!isEditing && !isUpdatingPassword && !showOtpPage && !showNewPassInput &&(
                <div className="account-details text-white">
                    <h2>Account Settings</h2>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Mobile number:</strong> {mobile ? mobile : 'No mobile number'}</p>
                    <button className="btn btn-primary me-2" onClick={handleEditClick}>Edit</button>
                    <button className="btn btn-secondary" onClick={handleUpdatePasswordClick}>Update Password</button>
                </div>
            )}

            {isEditing && (
                <div className="edit-form text-white">
                    <h2>Edit Account</h2>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    {errors.name && <p className='text-danger'>{errors.name}</p>}
                    <div className="mb-3">
                        <label className="form-label">Mobile</label>
                        <input
                            type="number"
                            className="form-control"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                        />
                    </div>
                    {errors.mobile && <p className='text-danger'>{errors.mobile}</p>}
                    <button className="btn btn-primary me-2" onClick={handleSave}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            )}

            {isUpdatingPassword && (
                <div className="password-form text-white">
                    <h2>Update Password</h2>
                    <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        {errors.currPass && <p className='text-danger'>{errors.currPass}</p>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        {errors.newPass && <p className='text-danger'>{errors.newPass}</p>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {errors.confirmNewPass && <p className='text-danger'>{errors.confirmNewPass}</p>}
                    </div>
                    <button className='forgot-pass' onClick={handleForgotPass}>Forgot password ?</button>
                    <button className="btn btn-primary me-2" onClick={handlePasswordChange}>Update</button>
                    <button className="btn btn-secondary" onClick={() => setIsUpdatingPassword(false)}>Cancel</button>
                </div>
            )}

            {showOtpPage && (
                <>
                    <label className='mb-4 text-white' htmlFor="otp">Enter OTP</label>
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
                    {buttonEnabled ? (
                        <button className='resend-btn' onClick={sendOTP}>Resend OTP</button>
                    ) : (
                        <button className='resend-btn btn-disabled' disabled>Resend OTP in {countdown}</button>
                    )}
                    {errors.unAuthorised && <div className="error">{errors.unAuthorised}</div>}
                    {errors.otp && <div className="error">{errors.otp}</div>}
                    <button onClick={verifyOTP}>Verify OTP</button>

                </>
            )}
            {showNewPassInput && (
                <>
                    <label htmlFor="password">Enter New Password</label>
                    <input
                        type="password"
                        id="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    ></input>
                    {errors.password && <div className="error">{errors.password}</div>}

                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    ></input>
                    {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
                    {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
                    <div className='d-flex gap-2'>
                        <button onClick={updatePassword}>Submit</button>
                        {/* <button onClick={() => { setShowManualLogin(true); setShowGooglePass(false); setShowOtpPage(false) }}>Cancel</button> */}
                    </div>

                </>
            )}
        </div>
    );
}

export default AccountSettings;
