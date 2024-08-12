import React, { useEffect, useState } from 'react'
import Layout from '../Header/Layout'
import axiosInstance from '../../../config/axiosConfig';
import { Modal, Button } from 'react-bootstrap';
import './Cart.css'
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Cart() {
    const [addresses, setAddresses] = useState([])
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState({});
    const [initialAddress, setInitialAddress] = useState({});
    const [message, setMessage] = useState('')
    const mainHeading = "Cart";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        axiosInstance.get('/user/addresses')
            .then(response => {
                if (response.data.status) {
                    setAddresses(response.data.addresses)
                    const primaryAddress = response.data.addresses.find(address => address.isPrimary);
                    const initial = primaryAddress || response.data.addresses[0] || {};
                    setSelectedAddress(initial);
                    setInitialAddress(initial);
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            })

        axiosInstance.get('/user/get-cart-products')
            .then(response => {
                if (response.data.status) {
                    setCartItems(response.data.products ? response.data.products : [])
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, [])

    const handleShowAddressModal = () => setShowAddressModal(true);

    const handleCloseAddressModal = () => {
        setSelectedAddress(initialAddress);
        setShowAddressModal(false)
    };

    const handleAddressChange = (selectedAdd) => {
        setSelectedAddress(selectedAdd);
    };


    const handleAddressSelection = async () => {
        selectedAddress.isPrimary = true
        setInitialAddress(selectedAddress)
        setShowAddressModal(false)
        await axiosInstance.put(`/user/update-address/${selectedAddress._id}`)
            .then(response => {
                if (response.data.status) {
                    setAddresses(prevAddresses =>
                        prevAddresses.map(preAddress =>
                            preAddress._id === selectedAddress._id
                                ? { ...preAddress, isPrimary: true }
                                : { ...preAddress, isPrimary: false }
                        )
                    );
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    };

    const handleRemoveFromCart = async (item_id) => {
        axiosInstance.delete(`/user/delete-cart-items/${item_id}`)
            .then(response => {
                if (response.data.status) {
                    toast.success("Removed from cart", {
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setCartItems(cartItems.filter(items => items._id !== item_id));
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }

    const handleQuantityChange = async (item_id, change) => {
        let newQuantity
        setCartItems(cartItems.map(item => {
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

    const { itemCount, totalPrice, totalDiscount, totalAmount, deliveryCharge } = calculatePriceDetails(cartItems);

    return (
        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <ToastContainer/>
            <div className="container text-white p-3 mb-4 ">
                <h5 className="mb-3">Primary Address</h5>
                {selectedAddress ? (
                    <div>
                        <div key={selectedAddress._id} className={`address-card p-3 mb-3 border rounded position-relative ${selectedAddress.isPrimary ? 'border-success' : ''}`}>
                            <div className="dropdown position-absolute top-0 end-0 p-2">
                                <button className="btn btn-secondary" type="button" onClick={handleShowAddressModal}>
                                    Change Address
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
                    </div>
                ) : (
                    <p>No primary address available</p>
                )}
                {cartItems.length > 0 ? (
                    <div className="row">
                        <div className='col-md-8'>

                            <div>
                                {cartItems.map(item => (
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
                                            <Button variant="danger" onClick={() => handleRemoveFromCart(item._id)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {message && <p className='text-success'>{message}</p>}
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className="total-price p-3 border rounded">
                                <h5>Price Details</h5>
                                <p>Price ({itemCount} items) ₹{totalPrice}</p>
                                <p>Discount -₹{totalDiscount}</p>
                                <p>Delivery Charge -₹{deliveryCharge}</p>
                                <p>Total Amount ₹{totalAmount}</p>
                                <div className='d-flex justify-content-end'>
                                    <Link to='/checkout/null'>
                                        <button className='btn btn-success '>Proceed to Checkout</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        No Products in cart
                        <Link to="/shop">
                            <button className='btn btn-success m-3'>Shop</button>
                        </Link>
                    </div>
                )}
                <Modal show={showAddressModal} onHide={handleCloseAddressModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Address</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {addresses.map(address => (
                            <div key={address._id} className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="address"
                                    id={`address-${address._id}`}
                                    onChange={() => handleAddressChange(address)}
                                    checked={selectedAddress._id === address._id}
                                />
                                <label className="form-check-label" htmlFor={`address-${address._id}`}>
                                    {address.name} - {address.address}, {address.city}, {address.state}, {address.pincode}
                                </label>
                            </div>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseAddressModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleAddressSelection}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    )
}

export default Cart
