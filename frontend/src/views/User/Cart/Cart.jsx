import React, { useEffect, useState } from 'react'
import Layout from '../Header/Layout'
import axiosInstance from '../../../config/axiosConfig';
import { Modal, Button } from 'react-bootstrap';
import './Cart.css'
function Cart() {
    const [addresses, setAddresses] = useState([])
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState({});
    const [initialAddress, setInitialAddress] = useState({});

    const mainHeading = "Cart";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];
    const [cartItems, setCartItems] = useState([
        {
            _id: 'product1',
            name: 'Product 1',
            brand: 'Brand A',
            size: 'M',
            color: 'Red',
            price: 100,
            discountedPrice: 80,
            quantity: 1,
            image: 'https://rukminim2.flixcart.com/image/224/224/xif0q/shoe/c/1/3/5-rlo122-5-red-tape-navy-original-imahfguzg2jmbbyp.jpeg?q=90' // Replace with actual image path
        },
        {
            _id: 'product2',
            name: 'Product 2',
            brand: 'Brand B',
            size: 'L',
            color: 'Blue',
            price: 150,
            discountedPrice: 120,
            quantity: 1,
            image: 'https://rukminim2.flixcart.com/image/224/224/xif0q/shoe/c/1/3/5-rlo122-5-red-tape-navy-original-imahfguzg2jmbbyp.jpeg?q=90' // Replace with actual image path
        }
    ]);

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


    const handleAddressSelection = () => {
        setInitialAddress(selectedAddress)
        setShowAddressModal(false)
    };

    const handleRemoveFromCart = async (item_id) => {
        
    }

    return (
        <div >
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
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
                <div className="row">
                    <div className='col-md-8'>
                        {cartItems.map(item => (
                            <div key={item._id} className="cart-item d-flex align-items-center mb-3 border rounded p-3">
                                <div className="cart-item-image me-3">
                                    <img src={item.image} alt={item.name} className="img-thumbnail" />
                                </div>
                                <div className="cart-item-details d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <h5 className="me-3">{item.name}</h5>
                                        <span className="text-white">{item.brand}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="me-3">Size: {item.size}</span>
                                        <span className="me-3">Color: {item.color}</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <i class="bi bi-dash-circle me-2"></i>
                                        <span className="me-2">{item.quantity}</span>
                                        <i class="bi bi-plus-circle"></i>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-danger me-2">${item.discountedPrice}</span>
                                        <span className="">${item.price}</span>
                                    </div>
                                    <Button variant="danger" onClick={() => handleRemoveFromCart(item._id)}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='col-md-4'>
                        <div className="total-price p-3 border rounded">
                            <h5>Total Price</h5>
                            <p>$200</p>
                        </div>
                    </div>
                </div>
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
