import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';

function OnlinePayment({ amount, totalDiscount, deliveryCharge, address, products, paymentMethod, checkoutId }) {
  const [currentUser, setCurrentUser] = useState({})
  const navigate = useNavigate()
  console.log(checkoutId);
  useEffect(() => {
    axiosInstance.get('/user/user-payment')
      .then(response => {
        if (response.data.status) {
          response.data.user.razorpayID = response.data.razorpayID
          setCurrentUser(response.data.user ? response.data.user : {})
        }
      })
      .catch(error => {
        console.error('Error getting data:', error);
      });
  }, []);

  const handlePayment = async () => {

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
        totalPrice: product.quantity * product.price
      }))
    }
    const initPayment = async (paymentData) => {
      const options = {
        key: currentUser.razorpayID,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Olegendary",
        description: "shopping",
        order_id: paymentData.id,
        handler: (response) => {
          axiosInstance.post('/user/payment/verify', { response, orderDetails, checkoutId })
            .then(response => {
              if (response.data.status) {
                navigate('/orders')
              }
            })
            .catch(error => {
              console.error('Error getting data:', error);
            })
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.mobile ? currentUser.mobile : null,
          userId: currentUser._id
        },
        notes: {
          address: "Your Address",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    }

    try {
      const { data } = await axiosInstance.post('/user/payments', { amount: amount })
      initPayment(data.data)
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <button className='btn btn-success m-3' onClick={handlePayment}>Pay with Razorpay</button>
    </div>
  )
}

export default OnlinePayment
