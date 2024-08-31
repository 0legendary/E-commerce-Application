import React, { useEffect, useState } from 'react'
import Layout from '../Header/Layout'
import axiosInstance from '../../../config/axiosConfig';
import { Button } from 'react-bootstrap';
import './Cart.css'
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Cart() {
    const mainHeading = "Cart";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];
    const [cartItems, setCartItems] = useState([]);
    const [offers, setOffers] = useState([])

    useEffect(() => {

        axiosInstance.get('/user/get-cart-products')
            .then(response => {
                if (response.data.status) {
                    setCartItems(response.data.products ? response.data.products : [])
                    setOffers(response.data.offers)
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, [])



    const handleRemoveFromCart = async (item_id) => {
        axiosInstance.delete(`/user/delete-cart-items/${item_id}`)
            .then(response => {
                if (response.data.status) {
                    toast.error("Removed from cart", {
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
                    toast.error(`Maximum ${newQuantity} can added for ${item.name}`, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
                else if (newQuantity > stockAvailable) {
                    newQuantity = stockAvailable;
                    toast.error(`${item.selectedStock} stock are available for ${item.name}`, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
                else if (newQuantity < 1) {
                    newQuantity = 1;
                    toast.error(`Minimum ${newQuantity} are required`, {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                } else {
                    toast.success(`You've changed ${item.name} QUANTITY to ${newQuantity}`, {
                        autoClose: 1000,
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


        try {
            await axiosInstance.put(`/user/update-cart-item/${item_id}`, { quantity: newQuantity });
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
        }
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

    const calculatePriceDetails = (cartItems) => {
        let totalPrice = 0;
        let totalDiscount = 0;
        let totalOfferDiscount = 0;

        cartItems.forEach(item => {
            const itemTotalPrice = item.quantity * item.price;
            const itemDiscount = item.quantity * (item.price - item.discountedPrice);
            const offerPrice = getApplicableOffer(item.productId, item.categoryId, item.discountedPrice);
            const itemOfferDiscount = offerPrice * item.quantity;

            totalPrice += itemTotalPrice;
            totalDiscount += itemDiscount;
            totalOfferDiscount += itemOfferDiscount;
        });

        const totalAmount = totalPrice - totalDiscount - totalOfferDiscount;
        const deliveryCharge = totalAmount > 500 ? 0 : 50;

        return {
            itemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
            totalPrice,
            totalDiscount,
            totalOfferDiscount,
            totalAmount,
            deliveryCharge
        };
    };

    const { itemCount, totalPrice, totalDiscount, totalOfferDiscount, totalAmount, deliveryCharge } = calculatePriceDetails(cartItems);

 


    return (
        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <ToastContainer />
            <div className="container text-white p-3 mb-4 ">
                {cartItems.length > 0 ? (
                    <div className="row">
                        <div className='col-md-8'>

                            <div>
                                {cartItems.map(item => {
                                    const offerPrice = getApplicableOffer(item.productId, item.categoryId, item.discountedPrice)
                                    const finalPrice = item.discountedPrice - offerPrice
                                    let mainImage = item.images.filter((img) => img.mainImage)
                                    return (
                                        <div key={item._id} className="cart-item d-flex align-items-center mb-3 border rounded p-3">
                                            <div className="cart-item-image me-3">
                                                <img src={mainImage[0].cdnUrl} alt={item.name} className="img-thumbnail" />
                                            </div>
                                            <div className="cart-item-details d-flex flex-column">
                                                <div className="d-flex align-items-center mb-2 justify-content-between">
                                                    <div>
                                                        <h5 className="me-3">{item.name}</h5>
                                                        <span className="text-white">{item.brand}</span>
                                                    </div>
                                                    <Button variant="danger" onClick={() => handleRemoveFromCart(item._id)}>
                                                        <i class="bi bi-trash3-fill"> Remove</i>
                                                    </Button>
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
                                                    <span className="me-2">${offerPrice > 0 ? item.discountedPrice - offerPrice : item.discountedPrice}</span>
                                                    {item.discountedPrice !== item.price && (
                                                        <span className="text-danger"><del>${item.price}</del></span>
                                                    )}
                                                    {offerPrice > 0 && <span className="me-2 mt-1 text-success"> ₹ {offerPrice.toFixed(2)} OFF</span>}
                                                </div>

                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className="total-price p-3 border rounded">
                                <h5>Price Details</h5>
                                <div className='d-flex justify-content-between'>
                                    <p>Price ({itemCount} items) </p>
                                    <p>₹ {totalPrice}</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p>Discount</p>
                                    <p>-₹{totalDiscount}</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p>Delivery Charge</p>
                                    <p>-₹ {deliveryCharge}</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p>Offer discount:</p>
                                    <p>- ₹{totalOfferDiscount.toFixed(2)}</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <p>Total Amount</p>
                                    <p>₹{totalAmount}</p>
                                </div>
                                <div className='d-flex justify-content-end'>
                                    <Link to='/checkout/null'>
                                        <button className='btn btn-success'>Proceed to Checkout</button>
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

            </div>
        </div>
    )
}

export default Cart
