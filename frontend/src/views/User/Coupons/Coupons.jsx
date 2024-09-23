import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
import './Coupons.css';

function Coupons() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const apiCall = axiosInstance.get('/user/get-coupons');
        const response = await handleApiResponse(apiCall);
        if (response.success) {
          setCoupons(response.data.coupons);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchCoupons();
  }, []);


  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        {coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div className="col-md-4 mb-4" key={coupon._id}>
              <div className="coupon-card card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title coupon-code text-uppercase mb-3">
                    <i class="bi bi-gift-fill me-2"></i>{coupon.code}
                  </h5>
                  <p className="card-text text-muted">{coupon.description}</p>
                  <hr />
                  <p className="card-text">
                    <strong>Discount:</strong> <span className="text-primary">{coupon.discountValue}%</span>
                  </p>
                  <p className="card-text">
                    <strong>Minimum Order:</strong> <span className="text-secondary">₹{coupon.minOrderAmount}</span>
                  </p>
                  <p className="card-text">
                    <strong>Validity:</strong> <span className="text-secondary">{new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-md-8">
            <div className="no-coupons-available text-center p-5 bg-light border rounded">
              <i class="bi bi-emoji-frown display-4 text-muted"></i>
              <h5 className="mt-3">No Coupons Available</h5>
              <p className="text-muted">Please check back later for exciting offers!</p>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}

export default Coupons
