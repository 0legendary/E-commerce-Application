import React from 'react'
import axiosInstance from '../../../config/axiosConfig';
import { useNavigate } from 'react-router-dom'; 

function CODPayment({ amount, totalDiscount, deliveryCharge, address, products, paymentMethod, checkoutId }) {
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
      orderTotal: amount,
      shippingCost: deliveryCharge,
      discountAmount: totalDiscount,
      products: products.map(product => ({
        productId: product.productId,
        productName: product.name,
        quantity: product.quantity,
        selectedColor: product.selectedColor,
        selectedSize: product.selectedSize,
        price: product.price,
        discountPrice:product.discountedPrice,
        totalPrice: product.quantity * product.price
      }))
    };

    try {
      const response = await axiosInstance.post('/user/payment/cod', { orderDetails, checkoutId });
      if (response.data.status) {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error getting data:', error);
    }
  };

  return (
    <div>
      <button className='btn btn-success m-3' onClick={handleCODPayment}>Continue with Cash on Delivery</button>
    </div>
  )
}

export default CODPayment
