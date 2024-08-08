import React from 'react';
import './PaymentPolicy.css';
const PaymentPolicy = ({ confirmBtn }) => {
    return (
        <div>
            <div className="container mt-5 text-white pay-policy">
                <div className="row">
                    <div className="col-md-12">
                        <div className='d-flex justify-content-center font-monospace'>
                            <h1 className="">Payment Policy</h1>
                        </div>

                        <div className='rounded-3 p-4'>
                            <section className="mb-5">
                                <h2 className="mb-3">Accepted Payment Methods</h2>
                                <ul>
                                    <li>COD (Cash on Delivery)</li>
                                    <li>Razorpay (for secure online payments)</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h2 className="mb-3">Payment Security</h2>
                                <p>
                                    We prioritize your security and use industry-standard encryption protocols to ensure that your payment details are protected. All transactions are processed through secure and trusted payment gateways. For more details, please refer to our <a href="/privacy-policy">Privacy Policy</a> and <a href="/security-policy">Security Policy</a>.
                                </p>
                            </section>

                            <section className="mb-5">
                                <h2 className="mb-3">Payment Processing</h2>
                                <ul>
                                    <li><strong>COD:</strong> Payments through Cash On Delivery while purachasing a product.</li>
                                    <li><strong>Razorpay Payments:</strong> Payments through Razorpay are processed in real-time. You will receive a transaction confirmation once the payment is completed.</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h2 className="mb-3">Order Confirmation</h2>
                                <p>
                                    After your payment is successfully processed, you will receive an order confirmation email with your order number and details. If you do not receive a confirmation email, please check your spam folder or contact our customer support.
                                </p>
                            </section>

                            <section className="mb-5">
                                <h2 className="mb-3">Refunds and Cancellations</h2>
                                <ul>
                                    <li><strong>Refunds:</strong> If you are eligible for a refund, it will be processed through the original payment method used for the purchase. Refunds typically take 5-7 business days to reflect in your account.</li>
                                    <li><strong>Cancellations:</strong> Orders can be canceled before they are processed and shipped. Once an order is in processing or has been shipped, cancellations may not be possible. Please contact our customer support for assistance with cancellations.</li>
                                </ul>
                            </section>

                            <section className="mb-5">
                                <h2 className="mb-3">Currency</h2>
                                <p>
                                    All transactions on our website are processed in Rupees. If you are making a purchase from a different country, please be aware that currency conversion fees may apply.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-3">Contact Us</h2>
                                <p>If you have any questions about our payment policy or need assistance with a payment issue, please contact our customer support team at:</p>
                                <ul>
                                    <li><strong>Email:</strong> <a href="mailto:bitsandbytes.alen@gmail.com">bitsandbytes.alen@gmail.com</a></li>
                                    <li><strong>Phone:</strong> 9961689333</li>
                                    <li><strong>Address:</strong> 221B Baker Street, NY</li>
                                </ul>
                            </section>
                            <div className='d-flex mb-1 align-items-center justify-content-end'>
                                <button className='btn btn-success' onClick={confirmBtn}>I Agree</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    );
};

export default PaymentPolicy;
