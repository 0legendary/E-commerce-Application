import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../../config/axiosConfig';
import Layout from '../Header/Layout'
import Address from '../Profile/Address/Address';
import NewAddress from '../Profile/Address/NewAddress';
import EditAddress from '../Profile/Address/EditAddress';
import { Button } from 'react-bootstrap';

import './Checkout.css'
import OnlinePayment from './OnlinePayment';
import CODPayment from './CODPayment';

function Checkout() {
    const { product_Id } = useParams();
    const [addresses, setAddresses] = useState([])
    const [products, setProducts] = useState([])
    const [showAddress, setShowAddress] = useState(true)
    const [showProduct, setShowProduct] = useState(false)
    const [showPayment, setShowPayment] = useState(false)

    const [newAddress, setNewAddress] = useState(false)
    const [showEditAddress, setShowEditAddress] = useState(false)
    const [editAddress, setEditAddress] = useState({})
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [message, setMessage] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');


    const mainHeading = "Checkout";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];

    useEffect(() => {
        axiosInstance.get(`/user/checkout/${product_Id}`)
            .then(response => {
                if (response.data.status) {
                    console.log(response.data);
                    let data = response.data
                    const primaryAddress = data.addresses.find(address => address.isPrimary);
                    setSelectedAddress(primaryAddress)
                    setAddresses(data.addresses)
                    setProducts(data.products)
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, [product_Id]);

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
                    setMessage(`Maximum ${newQuantity} can added for ${item.name}`)
                }
                if (newQuantity > stockAvailable) {
                    newQuantity = stockAvailable;
                    setMessage(`${item.selectedStock} stock are available for ${item.name}`)
                }
                if (newQuantity < 1) {
                    newQuantity = 1;
                    setMessage(`Minimum ${newQuantity} are required`)
                }
                setMessage(`You've changed ${item.name} QUANTITY to ${newQuantity}`)
                setTimeout(() => {
                    setMessage('')
                }, 2000);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));


        try {
            await axiosInstance.put(`/user/update-cart-item/${item_id}`, { quantity: newQuantity });
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
        }
    };
    const handleRemoveFromCart = async (item_id) => {
        axiosInstance.delete(`/user/delete-cart-items/${item_id}`)
            .then(response => {
                if (response.data.status) {
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

        cartItems.forEach(item => {
            const itemTotalPrice = item.quantity * item.price;
            const itemDiscount = item.quantity * (item.price - item.discountedPrice);

            totalPrice += itemTotalPrice;
            totalDiscount += itemDiscount;
        });

        const totalAmount = totalPrice - totalDiscount;
        let deliveryCharge = totalAmount > 500 ? 0 : 50

        return {
            itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
            totalPrice,
            totalDiscount,
            totalAmount,
            deliveryCharge
        };
    };

    const { itemCount, totalPrice, totalDiscount, totalAmount, deliveryCharge } = calculatePriceDetails(products);


    return (
        <div className='checkout'>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <div className='container text-white'>

                <div className='row'>
                    <div className='col-md-8'>
                        {showAddress ? (
                            <div >
                                <h2>Address Management</h2>
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
                                    <div className='d-flex justify-content-end p-2'>
                                        <button className='btn btn-success' onClick={() => { setShowAddress(false); setShowProduct(true) }}>Save</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='text-white'>
                                {selectedAddress ? (
                                    <div key={selectedAddress._id} className={`address-card p-3 mb-3 border rounded position-relative ${selectedAddress.isPrimary ? 'border-success' : ''}`}>
                                        <div className="dropdown position-absolute top-0 end-0 p-2">
                                            <button className="btn btn-secondary">
                                                <li className="dropdown-item" onClick={() => setShowAddress(true)}>Change</li>
                                            </button>
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
                                        {products.map(item => (
                                            <div key={item._id} className="cart-item d-flex align-items-center mb-3 border rounded p-3">
                                                <div className="cart-item-image me-3">
                                                    <img src={item.mainImage} alt={item.name} className="img-thumbnail" />
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
                                                        <span className="me-2">${item.discountedPrice}</span>
                                                        {item.discountedPrice !== item.price && (
                                                            <span className="text-danger"><del>${item.price}</del></span>
                                                        )}
                                                    </div>
                                                    {product_Id == 'null' && (
                                                        <Button variant="danger" onClick={() => handleRemoveFromCart(item._id)}>
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className='d-flex justify-content-end p-2'>
                                            <button className='btn btn-success' onClick={() => { setShowAddress(false); setShowProduct(false); setShowPayment(true) }}>Continue</button>
                                        </div>
                                        {message && <p className='text-success'>{message}</p>}
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
                            <div className="address-card p-3 mb-3 border rounded position-relative">
                                {!showAddress && !showAddress && (
                                    <div className="dropdown position-absolute top-0 end-0 p-2">
                                        <button className="btn btn-secondary">
                                            <li className="dropdown-item" onClick={() => { setShowAddress(false); setShowProduct(true); setShowPayment(false) }}>Change</li>
                                        </button>
                                    </div>
                                )}

                                <h4>Order summary</h4>
                                <h5>{products.length} items</h5>
                            </div>
                        )}

                        {showPayment ? (
                            <div className="address-card p-3 mb-3 border rounded position-relative">
                                <div className="my-3">
                                    <h4>Select Payment Method</h4>
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
                                                itemCount={itemCount}
                                                totalPrice={totalPrice}
                                                totalDiscount={totalDiscount}
                                                amount={totalAmount}
                                                deliveryCharge={deliveryCharge}
                                                address={selectedAddress}
                                                products={products}
                                                paymentMethod={'online'}
                                                checkoutId={product_Id}
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
                                                itemCount={itemCount}
                                                totalPrice={totalPrice}
                                                totalDiscount={totalDiscount}
                                                amount={totalAmount}
                                                deliveryCharge={deliveryCharge}
                                                address={selectedAddress}
                                                products={products}
                                                paymentMethod={'COD'}
                                                checkoutId={product_Id}
                                            />
                                        )}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="address-card p-3 mb-3 border rounded position-relative">
                                <h5>Payment Option</h5>
                            </div>
                        )}
                    </div>
                    <div className='col-md-4'>
                        <div className="total-price p-3 border rounded">
                            <h5>Price Details</h5>
                            <p>Price ({itemCount} items) ₹{totalPrice}</p>
                            <p>Discount -₹{totalDiscount}</p>
                            <p>Delivery Charge -₹{deliveryCharge}</p>
                            <p>Total Amount ₹{totalAmount}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
