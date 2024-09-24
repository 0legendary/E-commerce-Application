import React, { useEffect, useState } from 'react'
import './authentication.css';
import axiosInstance from '../../../config/axiosConfig';
import {handleApiResponse} from '../../../utils/utilsHelper';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import { loginAuthenticate } from '../../../config/authenticateCondition';
import GoogleAuth from './Google/GoogleAuth';
import OTPInput from 'react-otp-input';
import { validateEmailForOTP, otpVerification, signUpGoogleAuthenticate } from '../../../config/authenticateCondition';
import LoadingSpinner from '../../Loading/LoadingSpinner';

function SignIn({ handleLoginClick, handleSignUpClick }) {
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState({})
  const [countdown, setCountdown] = useState(null);
  const [showManualLogin, setShowManualLogin] = useState(true)
  const [showOtpPage, setShowOtpPage] = useState(false)
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [showNewPassInput, setShowNewPassInput] = useState(false)
  const [isLoadingAction, setIsLoadingAction] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [newPassForm, setNewPassForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formOtp, setFormOtp] = useState('');

  const navigate = useNavigate()


  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    setErrors({
      ...errors,
      [id]: '',
      unAuthorised: ''
    });
  };

  const handleNewPassChange = (e) => {
    const { id, value } = e.target;
    setNewPassForm({
      ...newPassForm,
      [id]: value,
    });
    setErrors({
      ...errors,
      [id]: '',
      unAuthorised: ''
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingAction(true)
    let newErrors = {};
    newErrors = loginAuthenticate(formData.email, formData.password);
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      const loginData = {
        email: formData.email,
        password: formData.password,
      };
  
      try {
        const apiCall = axiosInstance.post('/login', loginData);
        const response = await handleApiResponse(apiCall);
  
        if (response.success) {
          sessionStorage.setItem('accessToken', response.data.accessToken);
          setSuccessMsg({ login: 'Login successful' });
          setTimeout(() => {
            navigate("/");
            setSuccessMsg({ login: '' });
          }, 2000);
          setCountdown(2);
        } else {
          setErrors({ unAuthorised: response.message });
        }
      } catch (error) {
        setErrors({ unAuthorised: 'Unauthorized' });
        console.error('Error sending login data:', error);
      }finally{
        setIsLoadingAction(false)
      }
    }
  };
  
  const openGoogleSignIn = async (googleUserData) => {
    setIsLoadingAction(true)
    setErrors({});
    const credential = googleUserData.credential;
  
    try {
      const apiCall = axiosInstance.post('/google/login', { credential });
      const response = await handleApiResponse(apiCall);
      
      if (response.success) {
        sessionStorage.setItem('accessToken', response.data.accessToken);
        setSuccessMsg({ login: 'Login successful' });
        setTimeout(() => {
          navigate("/");
          setSuccessMsg({ login: '' });
        }, 2000);
        setCountdown(2);
      } else {
        setErrors({ unAuthorised: response.message });
      }
    } catch (error) {
      console.error('Error verifying Google credential:', error);
    }finally{
      setIsLoadingAction(false)
    }
  };
  



  const handleForgotPass = (e) => {
    e.preventDefault()
    let newErrors = {}
    newErrors = validateEmailForOTP(formData.email)
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      sendOTP(e)
      setShowManualLogin(false)
      setShowOtpPage(true)
    }

  }

  const sendOTP = async (e) => {
    e.preventDefault();
    setIsLoadingAction(true)

    const apiCall = axiosInstance.post('/forgot-pass/send-otp', { email: formData.email });
    const response = await handleApiResponse(apiCall);
  
    if (response.success) {
      setCountdown(10);
      setButtonEnabled(false);
      setSuccessMsg({ newOTPSend: 'New OTP sent to your email' });
      setErrors({});
      setTimeout(() => {
        setSuccessMsg({ newOTPSend: '' });
      }, 2000);
      setIsLoadingAction(false)
    } else {
      setIsLoadingAction(false)
      setErrors({ unAuthorised: response.message });
    }
  };
  

  const verifyOTP = async (e) => {
    setIsLoadingAction(true)
    e.preventDefault();

    let newErrors = otpVerification(formOtp);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const apiCall = axiosInstance.post('/forgot-pass/verify-otp', { otp: formOtp, email: formData.email });
        const { success, message } = await handleApiResponse(apiCall);

        if (success) {
          setSuccessMsg({ otpVerified: message });
          setTimeout(() => {
            setShowOtpPage(false);
            setShowNewPassInput(true);
            setSuccessMsg({ otpVerified: '' });
          }, 2000);
        } else {
          setErrors({ otp: message });
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        setErrors({ otp: 'Error occurred while verifying OTP' });
      }finally{
        setIsLoadingAction(false)
      }
    }
  };


  const updatePassword = async (e) => {
    setIsLoadingAction(true)
    e.preventDefault();

    let newErrors = signUpGoogleAuthenticate(newPassForm.password, newPassForm.confirmPassword);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const apiCall = axiosInstance.post('/forgot-pass/reset-password', { email: formData.email, password: newPassForm.password });
        const { success, message } = await handleApiResponse(apiCall);

        if (success) {
          setSuccessMsg({ passChanged: message });
          setFormData({
            email: '',
            password: '',
          });
          setTimeout(() => {
            setShowOtpPage(false);
            setShowNewPassInput(false);
            setShowManualLogin(true);
            setSuccessMsg({ passChanged: '' });
          }, 1000);
        } else {
          setErrors({ unAuthorised: message });
          setShowOtpPage(false);
          setShowNewPassInput(false);
          setShowManualLogin(true);
        }
      } catch (error) {
        console.error('Error updating password:', error);
        setErrors({ unAuthorised: 'Error occurred while updating password' });
        setShowOtpPage(false);
        setShowNewPassInput(false);
        setShowManualLogin(true);
      }finally{
        setIsLoadingAction(false)
      }
    }
  };

  return (
    <div>
      <LoadingSpinner isLoadingAction={isLoadingAction} />
      <div className='authPage'>
        <div className="background">
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
        <form >
          <h3>Sign In</h3>
          <div className="selection-div">
            <div
              className='login active'
              onClick={handleLoginClick}>Sing In
            </div>
            <div
              className='login'
              onClick={handleSignUpClick}>Sign Up
            </div>
          </div>
          {showManualLogin && (
            <>
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                value={formData.email}
                onChange={handleChange}
              ></input>
              {errors.email && <div className="error">{errors.email}</div>}

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              ></input>
              {errors.password && <div className="error">{errors.password}</div>}
              <button className='forgot-pass' onClick={handleForgotPass}>Forgot password ?</button>
              <div className='d-flex justify-content-start mt-5'>
                <GoogleAuth onSuccess={openGoogleSignIn} onError={() => setErrors({ unAuthorised: 'Something went wrong, try again later' })} />
              </div>

              {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
              <button onClick={handleSubmit}>Sign In</button>
            </>
          )}
          {showOtpPage && (
            <>
              <label className='mb-4' htmlFor="otp">Enter OTP</label>
              <OTPInput
                value={formOtp}
                onChange={(otp) => {
                  setFormOtp(otp.replace(/[^0-9]/g, ''));
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
              {successMsg.otpVerified && <p className='successMsg text-success'>{successMsg.otpVerified}</p>}
              {successMsg.newOTPSend && <p className='successMsg text-success'>{successMsg.newOTPSend}</p>}

            </>
          )}

          {showNewPassInput && (
            <>
              <label htmlFor="password">Enter New Password</label>
              <input
                type="password"
                id="password"
                value={newPassForm.password}
                onChange={handleNewPassChange}
              ></input>
              {errors.password && <div className="error">{errors.password}</div>}

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={newPassForm.confirmPassword}
                onChange={handleNewPassChange}
              ></input>
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
              {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
              <div className='d-flex gap-2'>
                <button onClick={updatePassword}>Submit</button>
                {/* <button onClick={() => { setShowManualLogin(true); setShowGooglePass(false); setShowOtpPage(false) }}>Cancel</button> */}
              </div>
              {successMsg.passChanged && <p className='successMsg text-success'>{successMsg.passChanged}</p>}

            </>
          )}
          {successMsg.login && <p className='successMsg text-success'>{successMsg.login}... <span className='redirect-text'>{countdown && countdown}</span></p>}
        </form>
      </div>
    </div>
  )
}

export default SignIn
