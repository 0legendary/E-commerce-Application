import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../../config/axiosConfig';
import Layout from '../Header/Layout'
import NewAddress from '../Profile/Address/NewAddress';
import EditAddress from '../Profile/Address/EditAddress';
import { Button } from 'react-bootstrap';

import './Checkout.css'
import OnlinePayment from './OnlinePayment';
import CODPayment from './CODPayment';
import PaymentPolicy from '../Policies/PaymentPolicy';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Checkout() {
    const { product_Id } = useParams();
    const [addresses, setAddresses] = useState([])
    const [products, setProducts] = useState([])
    const [offers, setOffers] = useState([])
    const [referralOffer, setReferralOffer] = useState({})
    const [showAddress, setShowAddress] = useState(true)
    const [showProduct, setShowProduct] = useState(false)
    const [showPayment, setShowPayment] = useState(false)

    const [newAddress, setNewAddress] = useState(false)
    const [showEditAddress, setShowEditAddress] = useState(false)
    const [editAddress, setEditAddress] = useState({})
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [paymetPolicy, setPaymetPolicy] = useState(false)
    const [couponCode, setCouponCode] = useState('')
    const [couponAvailable, setCouponAvailable] = useState({})
    const [errorMsg, setErrorMsg] = useState('')
    const [priceDetails, setPriceDetails] = useState({
        itemCount: 0,
        totalPrice: 0,
        totalDiscount: 0,
        totalAmount: 0,
        deliveryCharge: 0,
        offerDiscount: 0,
        referralOfferDiscount: 0
    });

    const mainHeading = "Checkout";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];

    useEffect(() => {
        axiosInstance.get(`/user/checkout/${product_Id}`)
            .then(response => {
                if (response.data.status) {
                    let data = response.data
                    setReferralOffer(data.referralOffer ? data.referralOffer : {})
                    setOffers(data.offers)
                    const primaryAddress = data.addresses.find(address => address.isPrimary);
                    setSelectedAddress(primaryAddress ? primaryAddress : data.addresses[0])
                    setAddresses(data.addresses)
                    setProducts(data.products)
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, [product_Id]);

    useEffect(() => {
        calculatePriceDetails(products);

        // eslint-disable-next-line 
    }, [products]);

    const updateOfferPrices = () => {
        const updatedProducts = products.map(item => {
            const offerPrice = getApplicableOffer(item.productId, item.categoryId, item.discountedPrice);
            return {
                ...item,
                offerDiscountPrice: offerPrice > 0 ? offerPrice : 0
            };
        });
        setProducts(updatedProducts);
    };

    const handelNewAddress = () => {
        setNewAddress(true)
        setShowEditAddress(false)
    }

    const updatePrimaryAddress = (address_id) => {
        setAddresses(prevAddresses =>
            prevAddresses.map(preAddress =>
                preAddress._id === address_id
                    ? { ...preAddress, isPrimary: true }
                    : { ...preAddress, isPrimary: false }
            )
        );
    };

    const handelCancleAddress = (address) => {
        setNewAddress(false)
        setShowEditAddress(false)
        setSelectedAddress(address)
        if (address && address._id) {
            setAddresses([...addresses, address]);
            address.isPrimary && updatePrimaryAddress(address._id)
        }
    }

    const handelCancleEditAddress = (address) => {
        setNewAddress(false)
        setShowEditAddress(false)
        if (address && address._id) {
            setAddresses(prevAddresses =>
                prevAddresses.map(preAddress =>
                    address._id === preAddress._id ? address : preAddress
                )
            );
            address.isPrimary && updatePrimaryAddress(address._id);
        }
    }

    const handelEditAddress = (addressId) => {
        const addressToEdit = addresses.find(address => address._id === addressId);
        setEditAddress(addressToEdit);
        setNewAddress(false)
        setShowEditAddress(true)
    }

    const handleAddressChange = (pAddress) => {
        setSelectedAddress(pAddress)
    };


    const handleQuantityChange = async (item_id, change) => {
        let newQuantity
        setProducts(products.map(item => {
            if (item._id === item_id) {
                newQuantity = item.quantity + change;

                const maxLimit = 5;
                const stockAvailable = item.selectedStock;

                if (newQuantity > maxLimit) {
                    newQuantity = maxLimit;
                    toast.error(`Maximum ${newQuantity} can added for ${item.name}`, {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else if (newQuantity > stockAvailable) {
                    newQuantity = stockAvailable;
                    toast.error(`${item.selectedStock} stock are available for ${item.name}`, {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else if (newQuantity < 1) {
                    newQuantity = 1;
                    toast.error(`Minimum ${newQuantity} are required`, {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else {
                    toast.success(`You've changed ${item.name} QUANTITY to ${newQuantity}`, {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }

                return { ...item, quantity: newQuantity };
            }
            return item;
        }));

        if (!product_Id) {
            toast.success(`You've changed QUANTITY to ${newQuantity}`, {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            try {
                await axiosInstance.put(`/user/update-cart-item/${item_id}`, { quantity: newQuantity });
            } catch (error) {
                toast.error('Something went wrong ', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                console.error('Error updating cart item quantity:', error);
            }
        }

    };
    const handleRemoveFromCart = async (item_id) => {
        axiosInstance.delete(`/user/delete-cart-items/${item_id}`)
            .then(response => {
                if (response.data.status) {
                    toast.error("Prouct removed", {
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setProducts(products.filter(items => items._id !== item_id));
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }



    const calculatePriceDetails = (cartItems) => {
        let totalPrice = 0;
        let totalDiscount = 0;
        let offerDiscount = 0;
        let referralOfferDiscount = 0;

        cartItems.forEach(item => {
            const itemTotalPrice = item.quantity * item.price;
            const itemDiscount = item.quantity * (item.price - item.discountedPrice);

            totalPrice += itemTotalPrice;
            totalDiscount += itemDiscount;

            offerDiscount += getApplicableOffer(item.productId, item.categoryId, item.discountedPrice);
        });

        if (referralOffer.rewardAmount) referralOfferDiscount = referralOffer.rewardAmount

        let totalAmount = totalPrice - totalDiscount;

        let deliveryCharge = totalAmount > 500 ? 0 : 50
        if (deliveryCharge > 0) totalAmount += 50

        totalAmount -= offerDiscount
        totalAmount -= referralOfferDiscount
        setPriceDetails({
            itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
            totalPrice,
            totalDiscount,
            totalAmount,
            deliveryCharge,
            offerDiscount,
            referralOfferDiscount,
        });

        getCouponDetails(couponAvailable.couponCode, totalAmount)
    };


    const handleApplyCoupon = () => {
        if (!couponCode) {
            toast.error('Please enter coupon code', {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return
        }

        axiosInstance.post('/user/apply-coupon', { code: couponCode, orderAmount: priceDetails.totalAmount })
            .then(response => {
                if (response.data.status) {
                    setCouponAvailable(response.data.coupon)
                    toast.success("Coupon Applied", {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else {
                    toast.error(response.data.message, {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setCouponAvailable({})

                }
            })
            .catch(error => {
                setCouponAvailable({})
                console.error('Error getting data:', error);
            });
    };


    const getApplicableOffer = (productId, categoryId, price) => {
        const currentDate = new Date();
        const applicableOffers = offers.filter(offer =>
            (offer.applicableTo.includes(productId) || offer.applicableTo.includes(categoryId)) &&
            new Date(offer.startDate) <= currentDate &&
            new Date(offer.endDate) >= currentDate &&
            offer.isActive
        );

        const discount = applicableOffers.reduce((totalDiscount, offer) => {
            let offerDiscount = 0;
            if (offer.discountAmount) {
                offerDiscount += offer.discountAmount;
            }
            if (offer.discountPercentage) {
                offerDiscount += price * (offer.discountPercentage / 100);
            }
            return totalDiscount + offerDiscount;
        }, 0);

        return discount;
    };

    const getCouponDetails = (code, totalAmount) => {
        axiosInstance.post('/user/apply-coupon', { code: code, orderAmount: totalAmount })
            .then(response => {
                if (response.data.status) {
                    setCouponAvailable(response.data.coupon)

                } else {

                    setCouponAvailable({})

                }
            })
            .catch(error => {
                setCouponAvailable({})
                console.error('Error getting data:', error);
            });
    }


    const handleAddressSave = () => {
        // Check if addresses exist and if no address is selected
        if (addresses && addresses.length > 0 && (!selectedAddress || !selectedAddress._id)) {
            toast.error('Please select an address', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        // Check if no addresses are available and no new address is created
        if ((!addresses || addresses.length === 0) && (!selectedAddress || !selectedAddress._id)) {
            toast.error("Please create a new address", {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        setErrorMsg('')
        setShowAddress(false);
        setShowProduct(true)
    }

    return (
        <div className='checkout'>
            <ToastContainer />
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />

            <div className='container text-white'>

                <div className='row'>
                    <div className='col-md-8'>
                        {showAddress ? (
                            <div>
                                {!newAddress && (
                                    <button className="btn btn-primary my-3 address-card p-3 mb-3 border rounded position-relative" onClick={handelNewAddress}>
                                        Add New Address
                                    </button>
                                )}
                                {newAddress && (<NewAddress handleCancel={handelCancleAddress} />)}
                                {showEditAddress && (<EditAddress address={editAddress} handleCancel={handelCancleEditAddress} />)}
                                <div className="address-list mt-4">
                                    {addresses.map((address) => (
                                        address._id ? (
                                            <div key={address._id} className={`address-card p-3 mb-3 border rounded position-relative ${address.isPrimary ? 'border-success' : ''}`}>
                                                <input
                                                    className="form-check-input radio-btn"
                                                    type="radio"
                                                    name="address"
                                                    id={`address-${address._id}`}
                                                    checked={selectedAddress._id === address._id}
                                                    onChange={() => handleAddressChange(address)}
                                                />
                                                <label className="form-check-label" htmlFor={`address-${address._id}`}>
                                                    <div className="dropdown position-absolute top-0 end-0 p-2">
                                                        <button className="btn btn-secondary">
                                                            <li className="dropdown-item" onClick={() => handelEditAddress(address._id)}>Edit</li>
                                                        </button>
                                                    </div>
                                                    <div className="address-type mb-2">
                                                        <strong>{address.addressType}</strong>
                                                    </div>
                                                    <div className="address-details">
                                                        <div className="mb-2">
                                                            <strong>{address.name}</strong> - {address.mobile}
                                                        </div>
                                                        <div>
                                                            {address.address}, {address.city}, {address.state}, {address.pincode}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        ) : null
                                    ))}
                                    {errorMsg && <p className='text-danger'>{errorMsg}</p>}
                                    <div className='d-flex justify-content-end p-2'>
                                        <button className='btn btn-success' onClick={handleAddressSave}>Save</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='text-white'>
                                {selectedAddress ? (
                                    <div key={selectedAddress._id} className={`address-card p-3 mb-3 border rounded position-relative ${selectedAddress.isPrimary ? 'border-success' : ''}`}>
                                        <div className="dropdown position-absolute top-0 end-0 p-2 d-block">
                                            <button className="btn btn-secondary">
                                                <li className="dropdown-item" onClick={() => { setShowAddress(true); setShowPayment(false); setShowProduct(false); setShowEditAddress(false) }}>Change</li>
                                            </button>
                                            <div className='mt-4 d-flex justify-content-center border-2 text-success'>
                                                <i class="bi bi-check-circle"></i>
                                            </div>
                                        </div>
                                        <div className="address-type mb-2">
                                            <strong>{selectedAddress.addressType}</strong>
                                        </div>
                                        <div className="address-details">
                                            <div className="mb-2">
                                                <strong>{selectedAddress.name}</strong> - {selectedAddress.mobile}
                                            </div>
                                            <div>
                                                {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.pincode}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {showProduct ? (
                            <div>
                                {products.length > 0 ? (
                                    <div>
                                        {products.map(item => {
                                            const offerPrice = getApplicableOffer(item.productId, item.categoryId, item.discountedPrice)
                                            const finalPrice = item.discountedPrice - offerPrice;
                                            let mainImage = item.images.filter((img) => img.mainImage)
                                            return (
                                                <div key={item._id} className="cart-item d-flex align-items-center mb-3 border rounded p-3">
                                                    <div className="cart-item-image me-3">
                                                        <img src={mainImage[0].cdnUrl} alt={item.name} className="img-thumbnail" />
                                                    </div>
                                                    <div className="cart-item-details d-flex flex-column">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <h5 className="me-3">{item.name}</h5>
                                                            <span className="text-white">{item.brand}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <span className="me-3">Size: {item.selectedSize}</span>
                                                            <span className="me-3">Color: {item.selectedColor}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i class="bi bi-dash-circle me-2" onClick={() => handleQuantityChange(item._id, -1)}></i>
                                                            <span className="me-2">{item.quantity}</span>
                                                            <i class="bi bi-plus-circle" onClick={() => handleQuantityChange(item._id, +1)}></i>
                                                        </div>
                                                        <div className="mb-2">
                                                            <span className="me-2">₹ {finalPrice}</span>
                                                            {item.discountedPrice !== item.price && (
                                                                <span className="text-danger me-2"><del>${item.price}</del></span>
                                                            )}
                                                            {offerPrice > 0 && <span className="me-2 mt-1 text-success">₹ {offerPrice.toFixed(2)} OFF</span>}
                                                        </div>
                                                        {product_Id === 'null' && (
                                                            <Button variant="danger" onClick={() => handleRemoveFromCart(item._id)}>
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div className='d-flex justify-content-end p-2'>
                                            <button className='btn btn-success' onClick={() => { setShowAddress(false); setShowProduct(false); setShowEditAddress(false); setShowPayment(true); updateOfferPrices() }}>Continue</button>

                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        No Products for purchase
                                        <Link to="/shop">
                                            <button className='btn btn-success m-3'>Shop</button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="address-card p-3 mb-3 border rounded position-relative d-block">
                                {!showAddress && !showAddress && (
                                    <div className="dropdown position-absolute top-0 end-0 p-2">
                                        <button className="btn btn-secondary">
                                            <li className="dropdown-item" onClick={() => { setShowAddress(false); setShowProduct(true); setShowPayment(false); setShowEditAddress(false) }}>Change</li>
                                        </button>
                                        <div className='mt-4 d-flex justify-content-center border-2 text-success'>
                                            <i class="bi bi-check-circle"></i>
                                        </div>
                                    </div>
                                )}
                                <h4>Order summary</h4>
                                <h5>{products.length} items</h5>
                            </div>
                        )}

                        {showPayment ? (
                            <div className="address-card p-3 mb-3 border rounded position-relative">
                                <div className="my-3">
                                    {!paymetPolicy && (
                                        <div>
                                            <PaymentPolicy confirmBtn={() => setPaymetPolicy(true)} />
                                        </div>
                                    )}
                                    {paymetPolicy && (
                                        <div>
                                            <div className='d-flex justify-content-between'>
                                                <h4>Select Payment Method</h4>
                                                <button className='btn btn-secondary' onClick={() => setPaymetPolicy(false)}>Show Policy</button>
                                            </div>
                                            {couponAvailable.discount ? priceDetails.totalAmount - couponAvailable.discount : priceDetails.totalAmount > 1000 ? (
                                                <>
                                                    <div className='mt-3'>
                                                        <input
                                                            type="radio"
                                                            id="razorpay"
                                                            name="payment-method"
                                                            value="Razorpay"
                                                            className='form-check-input radio-btn'
                                                            checked={paymentMethod === 'Razorpay'}
                                                            onChange={() => setPaymentMethod('Razorpay')}
                                                        />
                                                        <label htmlFor="razorpay">Online</label>
                                                        {paymentMethod === 'Razorpay' && (
                                                            <OnlinePayment
                                                                itemCount={priceDetails.itemCount}
                                                                totalPrice={priceDetails.totalPrice}
                                                                totalDiscount={priceDetails.totalDiscount}
                                                                amount={priceDetails.totalAmount}
                                                                deliveryCharge={priceDetails.deliveryCharge}
                                                                address={selectedAddress}
                                                                products={products}
                                                                paymentMethod={'online'}
                                                                checkoutId={product_Id}
                                                                coupon={couponAvailable}
                                                                offerDiscount={priceDetails.offerDiscount}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className='mt-3'>
                                                        <input
                                                            type="radio"
                                                            id="cod"
                                                            name="payment-method"
                                                            value="COD"
                                                            className='form-check-input radio-btn'
                                                            checked={paymentMethod === 'COD'}
                                                            onChange={() => setPaymentMethod('COD')}
                                                        />
                                                        <label htmlFor="cod">Cash on Delivery</label>
                                                        {paymentMethod === 'COD' && (
                                                            <CODPayment
                                                                itemCount={priceDetails.itemCount}
                                                                totalPrice={priceDetails.totalPrice}
                                                                totalDiscount={priceDetails.totalDiscount}
                                                                amount={priceDetails.totalAmount}
                                                                deliveryCharge={priceDetails.deliveryCharge}
                                                                address={selectedAddress}
                                                                products={products}
                                                                paymentMethod={'COD'}
                                                                checkoutId={product_Id}
                                                                coupon={couponAvailable}
                                                                offerDiscount={priceDetails.offerDiscount}
                                                            />
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <CODPayment
                                                        itemCount={priceDetails.itemCount}
                                                        totalPrice={priceDetails.totalPrice}
                                                        totalDiscount={priceDetails.totalDiscount}
                                                        amount={priceDetails.totalAmount}
                                                        deliveryCharge={priceDetails.deliveryCharge}
                                                        address={selectedAddress}
                                                        products={products}
                                                        paymentMethod={'COD'}
                                                        checkoutId={product_Id}
                                                        coupon={couponAvailable}
                                                        offerDiscount={priceDetails.offerDiscount}
                                                    />
                                                    Cash on delivery is only available for order greater than 1000
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="address-card p-3 mb-3 border rounded position-relative">
                                <h5>Payment Option</h5>
                            </div>
                        )}
                    </div>
                    <div className='col-md-4 font-monospace'>
                        <div className="total-price p-3 border rounded w-100">
                            <div className="coupon-section mb-5">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button className="btn btn-primary" onClick={handleApplyCoupon}>Apply</button>
                                </div>
                            </div>
                            <h3 className='mb-3 d-flex justify-content-center'>Price Details</h3>
                            <div className='d-flex justify-content-between'>
                                <p>Price ({priceDetails.itemCount} items):</p>
                                <p>₹{priceDetails.totalPrice.toFixed(2)}</p>
                            </div>
                            <div className='d-flex justify-content-between'>
                                <p>Discount:</p>
                                <p>- ₹{priceDetails.totalDiscount.toFixed(2)}</p>
                            </div>
                            <div className='d-flex justify-content-between'>
                                <p>Offer discount:</p>
                                <p>- ₹{priceDetails.offerDiscount.toFixed(2)}</p>
                            </div>
                            {priceDetails.referralOfferDiscount > 0 && (
                                <div className='d-flex justify-content-between'>
                                    <p>Referral Offer discount:</p>
                                    <p>- ₹{priceDetails.referralOfferDiscount.toFixed(2)}</p>
                                </div>
                            )}
                            <div className='d-flex justify-content-between'>
                                <p>Delivery Charge:</p>
                                <p>- ₹{priceDetails.deliveryCharge.toFixed(2)}</p>
                            </div>
                            <div className='d-flex justify-content-between'>
                                <p>Coupons applied: {couponAvailable.couponCode}</p>
                                <p>{couponAvailable.couponCode ? `- ₹${couponAvailable.discount.toFixed(2)}` : `₹0`}</p>
                            </div>
                            <div className='d-flex justify-content-between'>
                                <p>Total Amount:</p>
                                <p> ₹{couponAvailable.discount ? priceDetails.totalAmount - couponAvailable.discount : priceDetails.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
