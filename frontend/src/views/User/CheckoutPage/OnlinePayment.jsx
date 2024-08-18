import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import OrderSuccess from './OrderSuccess';
import { UploadPendingOrder } from '../../../config/CreatePendingPayment';

function OnlinePayment({ amount, totalDiscount, deliveryCharge, address, products, paymentMethod, checkoutId, coupon, offerDiscount }) {
  const [currentUser, setCurrentUser] = useState({})
  const [showSuccessPage, setShowSuccessPage] = useState(false)
  const [orderDetailsData, setOrderDetailsData] = useState({})
  const navigate = useNavigate()
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
                setOrderDetailsData(response.data.order)
                setShowSuccessPage(true)
              } else {
                console.log('order canceled');
                UploadPendingOrder(orderDetails,checkoutId)
                setShowSuccessPage(false)
              }
            })
            .catch(error => {
              UploadPendingOrder(orderDetails,checkoutId)
              console.error('Error getting data:', error);
            })
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.mobile ? currentUser.mobile : null,
          userId: currentUser._id
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
            UploadPendingOrder(orderDetails);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    }

    try {
      const { data } = await axiosInstance.post('/user/payments', { amount: coupon.discount ? amount - coupon.discount : amount })
      initPayment(data.data)
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <button className='btn btn-success m-3' onClick={handlePayment}>Pay with Razorpay</button>
      {showSuccessPage && (
        <OrderSuccess onClose={() => navigate('/orders')} order={orderDetailsData} />
      )}
    </div>
  )
}

export default OnlinePayment
