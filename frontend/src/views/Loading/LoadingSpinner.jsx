import React from 'react'
import './loadingSpinner.css'

const LoadingSpinner = ({ isLoadingAction }) => {
  return isLoadingAction ? (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  ) : null;
};


export default LoadingSpinner
