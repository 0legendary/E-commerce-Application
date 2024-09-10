import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axiosConfig';
import { handleApiResponse } from '../../../utils/utilsHelper';
import OrderSuccess from '../CheckoutPage/OrderSuccess';
import { useNavigate } from 'react-router-dom';

function PendingPayment({ order, paymentMethod }) {
    const [showSuccessPage, setShowSuccessPage] = useState(false)
    const [orderDetailsData, setOrderDetailsData] = useState({})
    const [currentUser, setCurrentUser] = useState({})
    const navigate = useNavigate()


    useEffect(() => {
        const fetchUserPayment = async () => {
            const { success, data, message } = await handleApiResponse(
                axiosInstance.get('/user/user-payment')
            );

            if (success) {
                const updatedUser = {
                    ...data.user,
                    razorpayID: data.razorpayID
                };
                setCurrentUser(updatedUser);
            } else {
                console.error(message);
            }
        };

        fetchUserPayment();
    }, []);

    const handleOnlinePayment = async () => {
        const initPayment = async (paymentData) => {
            const options = {
                key: currentUser.razorpayID,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: "Olegendary",
                description: "shopping",
                order_id: paymentData.id,
                handler: async (response) => {
                    const { success, data } = await handleApiResponse(
                        axiosInstance.post('/user/payment/verify', { response, order, paymentMethod })
                    );
                    if (success) {
                        setOrderDetailsData(data.order);
                        setShowSuccessPage(true);
                    } else {
                        setShowSuccessPage(false);
                    }
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
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        }
        try {
            const { success, data, message } = await handleApiResponse(
                axiosInstance.post('/user/payments', { amount: order.orderTotal })
            );

            if (success) {
                initPayment(data);
            } else {
                console.error(message);
            }
        } catch (error) {
            console.error('Error initiating payment:', error.message);
        }
    };

    const handleCODPayment = async () => {
        try {
            const apiCall = axiosInstance.post('/user/pay/pending-payment', { order, paymentMethod });
            const response = await handleApiResponse(apiCall);
    
            if (response.success) {
                setOrderDetailsData(response.data.order);
                setShowSuccessPage(true);
            } else {
                setShowSuccessPage(false);
                console.error('Payment failed:', response.message);
            }
        } catch (error) {
            setShowSuccessPage(false);
            console.error('Error processing COD payment:', error);
        }
    };

    return (
        <div>
            <div>
                {paymentMethod === 'online' ? (
                    <button className='btn btn-success m-3' onClick={handleOnlinePayment}>Pay with Razorpay</button>
                ) : (
                    <button className='btn btn-success m-3' onClick={handleCODPayment}>Continue with Cash on Delivery</button>
                )}
                {showSuccessPage && (
                    <OrderSuccess onClose={() => navigate('/orders')} order={orderDetailsData} />
                )}
            </div>
        </div>
    )
}

export default PendingPayment
