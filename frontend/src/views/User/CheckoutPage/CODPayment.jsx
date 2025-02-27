import React, { useState } from 'react'
import axiosInstance from '../../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import OrderSuccess from './OrderSuccess';
import { UploadPendingOrder } from '../../../config/CreatePendingPayment';
import { handleApiResponse } from '../../../utils/utilsHelper';

function CODPayment({ amount, totalDiscount, deliveryCharge, address, products, paymentMethod, checkoutId, coupon, offerDiscount }) {
  const [showSuccessPage, setShowSuccessPage] = useState(false)
  const [orderDetailsData, setOrderDetailsData] = useState({})
  const navigate = useNavigate();


  const handleCODPayment = async () => {
    const orderDetails = {
      customerId: address.userId,
      shippingAddress: {
        name: address.name,
        mobile: address.mobile,
        pincode: address.pincode,
        locality: address.locality,
        address: address.address,
        city: address.city,
        state: address.state,
        landmark: address.landmark,
        addressType: address.addressType,
        altPhone: address.altPhone
      },
      paymentMethod: paymentMethod,
      orderTotal: coupon.discount ? amount - coupon.discount : amount,
      shippingCost: deliveryCharge,
      discountAmount: totalDiscount,
      couponID: coupon.couponID ? coupon.couponID : null,
      couponDiscount: coupon.discountPercentage ? coupon.discountPercentage : 0,
      offerDiscount: offerDiscount > 0 ? offerDiscount : 0,
      products: products.map(product => {
        const offerDiscountPrice = product.offerDiscountPrice || 0;
        const discountPrice = product.discountedPrice - offerDiscountPrice;
        const totalPrice = product.quantity * discountPrice;
        return {
          productId: product.productId,
          productName: product.name,
          quantity: product.quantity,
          selectedColor: product.selectedColor,
          selectedSize: product.selectedSize,
          price: product.price,
          discountPrice: discountPrice,
          offerDiscount: offerDiscountPrice,
          totalPrice: totalPrice
        };
      })
    };

    try {
      const apiCall = axiosInstance.post('/user/payment/cod', { orderDetails, checkoutId });
      const response = await handleApiResponse(apiCall);

      if (response.success) {
        setOrderDetailsData(response.data.order);
        setShowSuccessPage(true);
      } else {
        UploadPendingOrder(orderDetails, checkoutId);
        setShowSuccessPage(false);
      }
    } catch (error) {
      UploadPendingOrder(orderDetails, checkoutId);
      console.error('Error getting data:', error);
    }
  };

  return (
    <div>
      <button className='btn btn-success m-3' onClick={handleCODPayment}>Continue with Cash on Delivery</button>
      {showSuccessPage && (
        <OrderSuccess onClose={() => navigate('/orders')} order={orderDetailsData} />
      )}
    </div>
  )
}

export default CODPayment
