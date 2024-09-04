import React from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function GoogleAuth({ onSuccess }) {
  const handleGoogleLogin = (googleUserData) => {
    onSuccess(googleUserData);
  };

  const handleError = (error) => {
    console.error("Google Login Error:", error);
  };
  return (
    <div>
      <GoogleOAuthProvider clientId= {process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <GoogleLogin onSuccess={handleGoogleLogin} onError={handleError} scope="https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile" />
      </GoogleOAuthProvider>
    </div>
  )
}

export default GoogleAuth
