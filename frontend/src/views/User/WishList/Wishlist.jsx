import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../../config/axiosConfig'
import Layout from '../Header/Layout'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartWishlist } from '../Header/CartWishlistContext';
import { handleApiResponse } from '../../../utils/utilsHelper';


function Wishlist() {
    const { updateWishlistLength, updateCartLength } = useCartWishlist();
    const [wishlistItems, setWishlistItems] = useState([])
    const mainHeading = "Wishlist";
    const breadcrumbs = [
        { name: "Home", path: "/" },
    ];
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/user/get-wishlist-products');
                const { success, data } = await handleApiResponse(response);
                if (success) {
                    setWishlistItems(data.products ? data.products : []);
                }
            } catch (error) {
                console.error('Error getting data:', error);
            }
        };

        fetchData();
    }, []);

    const handleRemove = async (product_id) => {
        try {
            const response = await axiosInstance.delete(`/user/delete-wishlist-item/${product_id}`);
            const { success } = await handleApiResponse(response);
    
            if (success) {
                updateWishlistLength(-1);
                toast.error("Removed from wishlist", {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setWishlistItems(wishlistItems.filter(item => item.productId !== product_id));
            }
        } catch (error) {
            console.error('Error sending data:', error);
        }
    }
    
    const handleAddToCart = async (productId) => {
        try {
            const result = await handleApiResponse(axiosInstance.post('/user/add-to-cart', { productId }));

            if (result.success) {
                updateCartLength(1);
                updateWishlistLength(-1)
                toast.success('Added to Cart', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                });
                setWishlistItems(wishlistItems.filter(items => items.productId !== productId));
            } else {
                toast.error('Failed to add to cart', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                });
            }
        } catch (error) {
            toast.error('Something went wrong', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
            console.error('Error adding to cart:', error);
        }
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
                                                    <i className="bi bi-trash-fill" onClick={() => handleRemove(item.productId)}></i>
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
                                                        <i className="bi bi-cart4">Add to cart</i>
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
