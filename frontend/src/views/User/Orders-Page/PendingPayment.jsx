import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axiosConfig';
import OrderSuccess from '../CheckoutPage/OrderSuccess';
import { useNavigate } from 'react-router-dom';

function PendingPayment({ order, paymentMethod }) {
    const [showSuccessPage, setShowSuccessPage] = useState(false)
    const [orderDetailsData, setOrderDetailsData] = useState({})
    const [currentUser, setCurrentUser] = useState({})
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

    const handleOnlinePayment = async () => {
        const initPayment = async (paymentData) => {
            const options = {
                key: currentUser.razorpayID,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: "Olegendary",
                description: "shopping",
                order_id: paymentData.id,
                handler: (response) => {
                    
                    axiosInstance.post('/user/pay/pending-payment', { response, order, paymentMethod })
                        .then(response => {
                            if (response.data.status) {
                                setOrderDetailsData(response.data.order)
                                setShowSuccessPage(true)
                            } else {
                                setShowSuccessPage(false)
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
            const { data } = await axiosInstance.post('/user/payments', { amount: order.orderTotal })
            initPayment(data.data)
        } catch (error) {
            console.log(error);
        }
    };

    const handleCODPayment = async () => {
        try {
            const response = await axiosInstance.post('/user/pay/pending-payment', { order, paymentMethod })
            if (response.data.status) {
                setOrderDetailsData(response.data.order)
                setShowSuccessPage(true)
            } else {
                setShowSuccessPage(false)
            }
        } catch (error) {
            console.error('Error getting data:', error);
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
