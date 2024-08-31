import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../../config/axiosConfig'
import Layout from '../Header/Layout'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([])
    const mainHeading = "Wishlist";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];
    useEffect(() => {
        axiosInstance.get('/user/get-wishlist-products')
            .then(response => {
                if (response.data.status) {
                    setWishlistItems(response.data.products ? response.data.products : [])
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, [])

    const handleRemove = (product_id) => {
        axiosInstance.delete(`/user/delete-wishlist-item/${product_id}`)
            .then(response => {
                if (response.data.status) {
                    toast.error("Removed from wishlist", {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setWishlistItems(wishlistItems.filter(items => items.productId !== product_id));
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }

    const handleAddToCart = async (productId) => {
        axiosInstance.post('/user/add-to-cart', { productId })
            .then(response => {
                if (response.data.status) {
                    toast.success("Added to Cart", {
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setWishlistItems(wishlistItems.filter(items => items.productId !== productId));
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);

            });
    };

    return (
        <div>
            <ToastContainer />
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <div className="container text-white p-3 mb-4 ">
                {wishlistItems.length > 0 ? (
                    <div className="row">
                        <div className='col-md-12'>
                            <div>
                                {wishlistItems.map(item => {
                                    let mainImage = item.images.filter((img) => img.mainImage)
                                    return (
                                        <div key={item._id} className="cart-item d-flex align-items-center mb-3 border rounded p-3">
                                            <div className="cart-item-image me-3">
                                                <img src={mainImage[0].cdnUrl} alt={item.name} className="img-thumbnail" />
                                            </div>
                                            <div className="cart-item-details d-flex flex-column">
                                                <div className='d-flex justify-content-end'>
                                                    <i class="bi bi-trash-fill" onClick={() => handleRemove(item.productId)}></i>
                                                </div>
                                                <div className=" align-items-center mb-2">
                                                    <h5 className="me-3">{item.name}</h5>
                                                    <span className="text-white">{item.brand}</span>
                                                </div>

                                                <div className="mb-2">
                                                    <span className="me-2">${item.discountPrice}</span>
                                                    {item.discountPrice !== item.price && (
                                                        <span className="text-danger"><del>${item.price}</del></span>
                                                    )}
                                                </div>
                                                <div className='d-flex justify-content-end'>
                                                    <button className='btn btn-success' onClick={() => handleAddToCart(item.productId)}>
                                                        <i class="bi bi-cart4">Add to cart</i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {/* {message && <p className='text-success'>{message}</p>} */}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        No Products in wishlist
                        <Link to="/shop">
                            <button className='btn btn-success m-3'>Shop</button>
                        </Link>
                    </div>
                )}
            </div>

        </div>
    )
}

export default Wishlist
