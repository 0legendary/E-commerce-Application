import React, { useEffect, useState } from 'react'
import './authentication.css';
import axiosInstance from '../../../config/axiosConfig';
import 'bootstrap-icons/font/bootstrap-icons.css';
//import { useNavigate } from 'react-router-dom';
import { signUpAuthenticate, signUpGoogleAuthenticate } from '../../../config/authenticateCondition';
import GoogleAuth from './Google/GoogleAuth';
import { jwtDecode } from 'jwt-decode'


function SignUp({ handleLoginClick, handleSignUpClick }) {
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('')
  const [countdown, setCountdown] = useState(null);
  const [googleSignup, setGoogleSignup] = useState(false)
  const [googleData, setGoogleData] = useState({})
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  //const navigate = useNavigate()

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


  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    newErrors = signUpAuthenticate(formData.username, formData.email, formData.password, formData.confirmPassword)

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };
      axiosInstance.post('/signup', signupData)
        .then(response => {
          if (response.data.status) {
            setSuccessMsg('Account created successfully')
            setErrors({})
            setTimeout(() => {
              handleLoginClick()
            }, 3000)

          } else {
            setErrors({ username: 'Already taken, try another one' })
          }
        })
        .catch(error => {
          console.error('Error sending login data:', error);
        });
    }
  };


  useEffect(() => {
    if (countdown === null) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleGoogleSignUp = (googleUserData) => {

    console.log('Google user data:', googleUserData);
    const decoded = jwtDecode(googleUserData.credential);
    setGoogleSignup(true)
    const { name, email, picture, sub } = decoded;
    const data = {
      username: name,
      email: email,
      profileImg: picture,
      googleId: sub,
    }
    setGoogleData(data)
  };

  const googleSignUp = (e) => {
    e.preventDefault()
    let newErrors = {};
    newErrors = signUpGoogleAuthenticate(formData.password, formData.confirmPassword)

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const signupData = {
        username: googleData.username,
        email: googleData.email,
        password: googleData.password,
        googleId: googleData.googleId,
        profileImg: googleData.profileImg,
        password: formData.password,
      };
      console.log(signupData);
      axiosInstance.post('/google/signup', signupData)
        .then(response => {
          if (response.data.status) {
            setSuccessMsg('Account created successfully')
            setErrors({})
            setTimeout(() => {
              handleLoginClick()
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

  return (
    <div>
      <div className='authPage'>
        <div className="background">
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
        <form onSubmit={!googleSignup ? handleSubmit : googleSignUp}>
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

          {!googleSignup ? (
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
                <GoogleAuth onSuccess={handleGoogleSignUp} onError={() => console.log('Login Failed')} />
              </div>
            </>
          ) : (
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
            </>
          )}

          <button type="submit">Sign Up</button>
          {successMsg !== '' && (
            <p className='successMsg text-success'>{successMsg}... <span className='redirect-text'>{countdown && countdown}</span></p>
          )}
        </form>
      </div>
    </div>
  )
}

export default SignUp
