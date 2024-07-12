import React from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function GoogleAuth({ onSuccess }) {
  const handleGoogleLogin = (googleUserData) => {
    onSuccess(googleUserData);
  };

  return (
    <div>
      <GoogleOAuthProvider clientId="919917757946-oqcg3lsomt8hnec7hhjd55uvfs56ec65.apps.googleusercontent.com">
        <GoogleLogin onSuccess={handleGoogleLogin} />
      </GoogleOAuthProvider>
    </div>
  )
}

export default GoogleAuth
