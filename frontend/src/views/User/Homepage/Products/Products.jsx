import React, { useEffect, useState } from 'react';
import './products.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartWishlist } from '../../Header/CartWishlistContext';
import { handleApiResponse } from '../../../../utils/utilsHelper';

function Products() {
    const { updateWishlistLength, updateCartLength } = useCartWishlist();
    const [cartProducts, setCartProducts] = useState([])
    const [products, setProducts] = useState([])
    const [wishlistProducts, setWishlistProducts] = useState([])
    const [offers, setOffers] = useState([])


    useEffect(() => {
        const fetchHomeProducts = async () => {
            const result = await handleApiResponse(axiosInstance.get('/user/home/getProducts'));

            if (result.success) {
                const { products, offers, cartProducts, wishlistProducts } = result.data;

                // Set the offers, cart products, wishlist products
                setOffers(offers || []);
                setCartProducts(cartProducts || []);
                setWishlistProducts(wishlistProducts || []);

                const sortedProducts = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const latestProducts = sortedProducts.slice(0, 10);
                setProducts(latestProducts);
            } else {
                console.error('Error:', result.message);  // Log error message
            }
        };

        fetchHomeProducts();
    }, []);

    const addToCart = async (productId) => {
        try {
            const result = await handleApiResponse(axiosInstance.post('/user/add-to-cart', { productId }));

            if (result.success) {
                updateCartLength(1);
                toast.success('Added to Cart', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                });
                setCartProducts(prevProducts => [...prevProducts, productId]);
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
        }
    };

    const addToWishlist = async (productId) => {
        axiosInstance.post('/user/add-to-wishlist', { productId })
        try {
            const response = await axiosInstance.post('/user/add-to-wishlist', { productId })
            const { success } = await handleApiResponse(response);

            updateWishlistLength(1)
            if (success) {
                toast.success("Added to Wishlist", {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setWishlistProducts([...wishlistProducts, productId])
            }

        }catch (error) {
            console.error('Error sending data:', error);
        }
    };

    const getApplicableOffer = (productId) => {
        const currentDate = new Date();
        return offers.find(offer =>
            offer.applicableTo.includes(productId) &&
            new Date(offer.startDate) <= currentDate &&
            new Date(offer.endDate) >= currentDate
        );
    };



    return (
        <div className="container products-container">
            <ToastContainer />
            <div className="offers-section mb-4 text-success">
                {offers && offers.length > 0 ? (
                    offers.map((offer) => {
                        return (
                            <div key={offer._id} className="offer-card">
                                <img src={offer.imageID.images[0].cdnUrl} alt={offer.description} className="offer-image" />
                                <div className="offer-details">
                                    <p className="offer-description">{offer.description}</p>
                                    <span className="offer-discount">Save {offer.discountPercentage}%</span>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p>No current offers.</p>
                )}
            </div>
            <div className="products-header">
                <span className="products-title"><span>Latest Products</span></span>
            </div>
            <div className="products-grid mt-4" style={{ 'grid-template-columns': 'repeat(4, 1fr)' }}>
                {products.map((product, index) => {
                    const isInCart = Array.isArray(cartProducts) && cartProducts.includes(product._id);
                    const isWishlist = Array.isArray(wishlistProducts) && wishlistProducts.includes(product._id)
                    const applicableOffer = getApplicableOffer(product._id);
                    const applicableCategoryOffer = getApplicableOffer(product.categoryId._id.toString());
                    const inStock = product.variations[0].stock > 0;
                    const mainImage = product.images.images.find(img => img.mainImage === true);
                    return (
                        <div key={index} className="product-card bg-white">
                            <img src={mainImage.cdnUrl} alt={product.name} className="product-image" />
                            <div className="product-details">
                                <span className="product-name"><span>{product.name}</span></span>
                            </div>
                            <div className='d-flex gap-3'>
                                <span className="product-current-price"><span>{product.variations[0].price}</span></span>
                                <span className="product-original-price"><span>{product.variations[0].discountPrice}</span></span>
                            </div>
                            <div className='d-flex' style={{ fontFamily: 'Saira Stencil One' }}>
                                {applicableOffer && (
                                    <div className="offer-badge">
                                        {applicableOffer.discountPercentage
                                            ? `|| ${applicableOffer.discountPercentage}% OFF ||`
                                            : `|| Discount: ${applicableOffer.discountAmount} ||`}
                                    </div>
                                )}
                                {applicableCategoryOffer && (
                                    <div className="offer-badge">
                                        {applicableCategoryOffer.discountPercentage
                                            ? `|| ${applicableCategoryOffer.discountPercentage}% OFF ||`
                                            : `|| Discount: ${applicableCategoryOffer.discountAmount} ||`}
                                    </div>
                                )}
                            </div>
                            {inStock ? (
                                <div className="product-actions w-100 justify-content-between ">
                                    <div className='d-flex gap-1'>
                                        {!isInCart ? (
                                            <div className="product-background">
                                                <i className="bi bi-cart3" onClick={() => addToCart(product._id)}></i>
                                            </div>
                                        ) : (
                                            <Link to={`/cart`}>
                                                <div className="product-background">
                                                    <i className="bi bi-cart-check"></i>
                                                </div>
                                            </Link>
                                        )}
                                        {!isWishlist ? (
                                            <div className="product-background">
                                                <i className="bi bi-heart" onClick={() => addToWishlist(product._id)}></i>
                                            </div>
                                        ) : (
                                            <Link to={`/wishlist`}>
                                                <div className="product-background">
                                                    <i className="bi bi-heart-half"></i>
                                                </div>
                                            </Link>
                                        )}
                                        <Link to={`/shop/${product._id}`}>
                                            <div className="product-background">
                                                <i className="bi bi-search"></i>
                                            </div>
                                        </Link>
                                    </div>
                                    <div>
                                        <Link to={`/checkout/${product._id}`}>
                                            <button className='btn border border-success text-black'>Buy</button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <h4 className='text-danger'>Out of Stock</h4>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export default Products;
