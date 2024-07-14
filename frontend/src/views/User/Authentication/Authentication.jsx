import React, { useState } from 'react';
import './authentication.css';
import SignUp from './SignUp';
import SignIn from './SignIn';

function Authentication() {
  const [activeTab, setActiveTab] = useState('signin');

  const handleLoginClick = () => {
    setActiveTab('signin');
  };

  const handleSignUpClick = () => {
    setActiveTab('signup');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  }

  return (
    <div>
      {activeTab === 'signin' ? (
        <SignIn
          handleSubmit={handleSubmit}
          handleLoginClick={handleLoginClick}
          handleSignUpClick={handleSignUpClick}
        />
      ) : (
        <SignUp
          handleSubmit={handleSubmit}
          handleLoginClick={handleLoginClick}
          handleSignUpClick={handleSignUpClick}
        />
      )}
    </div>
  )
}

export default Authentication;
