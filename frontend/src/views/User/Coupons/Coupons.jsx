import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosConfig';
function Coupons() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    axiosInstance.get('/user/get-coupons')
      .then(response => {
        if (response.data.status) {
          setCoupons(response.data.coupons);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);


  return (
    <div className="container mt-4">
      <div className="row">
        {coupons.map(coupon => (
          <div className="col-md-4 mb-3" key={coupon._id}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title text-success">{coupon.code}</h5>
                <p className="card-text text-success">{coupon.description}</p>
                <p className="card-text"><strong>Discount:</strong> {coupon.discountValue}%</p>
                <p className="card-text"><strong>Minimum Order Amount:</strong> ₹{coupon.minOrderAmount}</p>
                <p className="card-text"><strong>Validity:</strong> {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Coupons
