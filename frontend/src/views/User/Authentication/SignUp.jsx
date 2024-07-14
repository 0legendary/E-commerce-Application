import React, { useEffect, useState } from 'react'
import './authentication.css';
import axiosInstance from '../../../config/axiosConfig';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import { signUpAuthenticate, signUpGoogleAuthenticate, otpVerification } from '../../../config/authenticateCondition';
import GoogleAuth from './Google/GoogleAuth';
import { jwtDecode } from 'jwt-decode'
import OTPInput from 'react-otp-input';


function SignUp({ handleLoginClick, handleSignUpClick }) {
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState({})
  const [countdown, setCountdown] = useState(null);
  const [showManualLogin, setShowManualLogin] = useState(true)
  const [showGooglePass, setShowGooglePass] = useState(false)
  const [showOtpPage, setShowOtpPage] = useState(false)
  const [googleData, setGoogleData] = useState({})
  const [buttonEnabled, setButtonEnabled] = useState(false); // State to control button enablement
  const [formData, setFormData] = useState({
    username: 'alenmm',
    email: 'alenmullassery123@gmail.com',
    password: 'a1234567',
    confirmPassword: 'a1234567',
    otp: ''
  });

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

  const openGoogleSignUp = (googleUserData) => {
    const decoded = jwtDecode(googleUserData.credential);
    setShowManualLogin(false)
    setShowGooglePass(true)
    setErrors({})
    const { name, email, picture, sub } = decoded;
    const data = {
      username: name,
      email: email,
      profileImg: picture,
      googleId: sub,
    }
    setGoogleData(data)
  };

  const sendOTP = (e) => {
    e.preventDefault()
    let newErrors = {}
    googleData.googleId
      ? newErrors = signUpGoogleAuthenticate(formData.password, formData.confirmPassword)
      : newErrors = signUpAuthenticate(formData.username, formData.email, formData.password, formData.confirmPassword)
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      axiosInstance.post('/otp/verify', { email: googleData.email ? googleData.email : formData.email })
        .then(response => {
          if (response.data.status) {
            setCountdown(10)
            setButtonEnabled(false);
            setShowGooglePass(false)
            setShowManualLogin(false)
            setShowOtpPage(true)
            setSuccessMsg({ otpSendMsg: 'New OTP sended' })
            setErrors({})
            setTimeout(() => {
              setSuccessMsg('')
            }, 3000)

          } else {
            setShowOtpPage(false)
            setShowGooglePass(false)
            setShowManualLogin(true)
            setErrors({ unAuthorised: response.data.message })
          }
        })
        .catch(error => {
          console.error('Error sending login data:', error);
        });
    }
  }

  const handelGoogleSignUp = (e) => {
    e.preventDefault()
    let newErrors = {};
    newErrors = otpVerification(formData.otp)
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const signupData = {
        username: googleData.username,
        email: googleData.email,
        password: formData.password,
        googleId: googleData.googleId,
        profileImg: googleData.profileImg,
        otp: formData.otp
      };
      axiosInstance.post('/google/signup', signupData)
        .then(response => {
          if (response.data.status) {
            sessionStorage.setItem('accessToken', response.data.accessToken);
            setCountdown(3)
            setSuccessMsg({ accCreation: 'Account created successfully' })
            setErrors({})
            setTimeout(() => {
              navigate('/')
            }, 3000)

          } else {
            setErrors({ username: 'Already taken, try another one' })
          }
        })
        .catch(error => {
          console.error('Error sending login data:', error);
        });
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let newErrors = {};
    newErrors = otpVerification(formData.otp)
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      };
      axiosInstance.post('/signup', signupData)
        .then(response => {
          if (response.data.status) {
            sessionStorage.setItem('accessToken', response.data.accessToken);
            setErrors({})
            setCountdown(3)
            setSuccessMsg({ accCreation: 'Account created successfully' })
            setTimeout(() => {
              setSuccessMsg('')
              navigate('/')
            }, 3000)
          } else {
            setErrors({ unAuthorised: response.data.message })
          }
        })
        .catch(error => {
          console.error('Error sending login data:', error);
        });
    }
  };



  return (
    <div>
      <div className='authPage'>
        <div className="background">
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
        <form>
          <h3>Sign Up</h3>
          <div className="selection-div">
            <div
              className='login'
              onClick={handleLoginClick}>Sing In
            </div>
            <div
              className='login active'
              onClick={handleSignUpClick}>Sign Up
            </div>
          </div>
          {showManualLogin && (
            <>
              <label htmlFor="username">User Name</label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
              ></input>
              {errors.username && <div className="error">{errors.username}</div>}

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

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              ></input>
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}

              {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
              <div className='d-flex justify-content-start mt-3'>
                <GoogleAuth onSuccess={openGoogleSignUp} onError={() => setErrors({ unAuthorised: 'Something went wrong, try again later' })} />
              </div>
              <button onClick={sendOTP}>Sign Up</button>
            </>
          )}
          {showGooglePass && (
            <>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              ></input>
              {errors.password && <div className="error">{errors.password}</div>}

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              ></input>
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
              {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
              <div className='d-flex gap-2'>
                <button onClick={sendOTP}>Submit</button>
                <button onClick={() => { setShowManualLogin(true); setShowGooglePass(false); setShowOtpPage(false) }}>Cancel</button>
              </div>
            </>
          )}
          {showOtpPage && (
            <>
              <label className='mb-4' htmlFor="otp">Enter OTP</label>
              <OTPInput
                value={formData.otp}
                onChange={(otp) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    otp: otp.replace(/[^0-9]/g, ''),
                  }));
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
              <button onClick={googleData.googleId ? handelGoogleSignUp : handleSubmit}>Verify OTP</button>
            </>
          )}
          {successMsg.accCreation && (
            <p className='successMsg text-success'>{successMsg.accCreation}... <span className='redirect-text'>{countdown && countdown}</span></p>
          )}
          {successMsg.otpSendMsg && (
            <p className='successMsg text-success'>{successMsg.otpSendMsg}...</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default SignUp
