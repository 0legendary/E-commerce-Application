import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../../config/axiosConfig'
import Layout from '../Header/Layout'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartWishlist } from '../Header/CartWishlistContext';
import { handleApiResponse } from '../../../utils/utilsHelper';
import Skeleton from 'react-loading-skeleton';
import LoadingSpinner from '../../Loading/LoadingSpinner';


function Wishlist() {
    const { updateWishlistLength, updateCartLength } = useCartWishlist();
    const [wishlistItems, setWishlistItems] = useState([])
    const [loading, setLoading] = useState(true);
    const [isLoadingAction, setIsLoadingAction] = useState(false)

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
                setLoading(false);
            } catch (error) {
                console.error('Error getting data:', error);
            }
        };

        fetchData();
    }, []);

    const handleRemove = async (product_id) => {
        try {
            setIsLoadingAction(true);
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
            setIsLoadingAction(false);
            console.error('Error sending data:', error);
        } finally {
            setIsLoadingAction(false);
        }

    }

    const handleAddToCart = async (productId) => {
        try {
            setIsLoadingAction(true);
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
            setIsLoadingAction(false);
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
        } finally {
            setIsLoadingAction(false);
        }
    };

    return (
        <div>
            <ToastContainer />
            <LoadingSpinner isLoadingAction={isLoadingAction} />
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <div className="container text-white p-3 mb-4 ">
                {loading ? (
                    <div className="row">
                        <div className='col-md-12'>
                            {Array(3).fill().map((_, index) => (
                                <div key={index} className="cart-item d-flex align-items-center mb-3 border rounded p-3">
                                    <div className="cart-item-image me-3">
                                        <Skeleton variant="rectangular" width={100} height={100} />
                                    </div>
                                    <div className="cart-item-details d-flex flex-column">
                                        <div className="d-flex justify-content-between">
                                            <Skeleton containerClassName='flex-grow-1 pt-4' borderRadius={3} height={35} width={'60%'} />
                                            <Skeleton containerClassName='d-flex flex-grow-1 justify-content-end' borderRadius={3} height={30} width={'5%'} />
                                        </div>
                                        <Skeleton containerClassName='pt-3' borderRadius={3} height={25} width={'35%'} />
                                        <Skeleton containerClassName='pt-2' borderRadius={3} height={25} width={'10%'} />
                                        <Skeleton containerClassName='pt-2 d-flex justify-content-end' borderRadius={3} height={33} width={'8%'} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : (
                    wishlistItems.length > 0 ? (
                        <div className="row">
                            <div className='col-md-12'>
                                <div>
                                    {wishlistItems.map(item => {
                                        let mainImage = item.images.filter((img) => img.mainImage)
                                        return (
                                            <Link to={`/shop/${item.productId}`} key={item._id} className="cart-item text-decoration-none d-flex align-items-center mb-3 rounded p-3">
                                                <div className="cart-item-image me-3">
                                                    <img src={mainImage[0].cdnUrl} alt={item.name} className="img-thumbnail" />
                                                </div>
                                                <div className="cart-item-details d-flex flex-column">
                                                    <div className='d-flex justify-content-end'>
                                                        <i className="bi bi-trash-fill" onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation(); handleRemove(item.productId);
                                                        }}></i>
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
                                                        <button className='btn btn-success' onClick={(e) => {e.preventDefault(); e.stopPropagation(); handleAddToCart(item.productId) }}>
                                                            <i className="bi bi-cart4">Add to cart</i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-cart-items text-center border border-success font-monospace">
                            <h4 className="mb-4">Your Wishlist is Empty</h4>
                            <p className="mb-4">Looks like you haven't added anything to your wishlist yet.</p>
                            <Link to="/shop">
                                <button className="btn btn-success btn-lg shop-button">
                                    Continue Shopping
                                </button>
                            </Link>
                        </div>
                    )
                )}

            </div>

        </div>
    )
}

export default Wishlist
