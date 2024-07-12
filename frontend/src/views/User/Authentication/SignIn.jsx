import React, { useEffect, useState } from 'react'
import './authentication.css';
import axiosInstance from '../../../config/axiosConfig';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import { loginAuthenticate } from '../../../config/authenticateCondition';

function SignIn({ handleLoginClick, handleSignUpClick }) {
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('')
  const [countdown, setCountdown] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);


  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    newErrors = loginAuthenticate(formData.email, formData.password)
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const loginData = {
        email: formData.email,
        password: formData.password,
      };
      axiosInstance.post('/login', loginData)
        .then(response => {
          if (response.data.status) {
            sessionStorage.setItem('accessToken', response.data.accessToken);
            setErrors({})
            setSuccessMsg('Login successful')
            setTimeout(() => {
              if (response.data.control === 'user') {
                navigate("/")
              } else {
                navigate("/admin")
              }
            }, 3000)
            setCountdown(3)
          } else {
            setErrors({ unAuthorised: 'Wrong Email or Password' })
          }

        })
        .catch(error => {
          setErrors({ unAuthorised: 'Wrong Email or Password' })
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
        <form onSubmit={handleSubmit}>
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


          {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
          <i class="bi bi-google"></i>
          <button type="submit">Sign In</button>
          {successMsg !== '' && (
            <p className='successMsg text-success'>{successMsg}... <span className='redirect-text'>{countdown && countdown}</span></p>
          )}
        </form>
      </div>
    </div>
  )
}

export default SignIn
