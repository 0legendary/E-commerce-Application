import React, { useEffect, useState } from 'react';
import './products.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Products() {
    const [cartProducts, setCartProducts] = useState([])
    const [products, setProducts] = useState([])
    const [wishlistProducts, setWishlistProducts] = useState([])
    const [offers, setOffers] = useState([])

    useEffect(() => {
        axiosInstance.get('/user/home/getProducts')
            .then(response => {
                if (response.data.status) {
                    setOffers(response.data.offers ? response.data.offers : []);
                    setCartProducts(response.data.cartProducts ? response.data.cartProducts : []);
                    setWishlistProducts(response.data.wishlistProducts ? response.data.wishlistProducts : []);
                    const sortedProducts = response.data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    const latestProducts = sortedProducts.slice(0, 10);
                    setProducts(latestProducts);
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }, []);

    const addToCart = async (productId) => {
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
                    setCartProducts([...cartProducts, productId]);
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    };

    const addToWishlist = async (productId) => {
        axiosInstance.post('/user/add-to-wishlist', { productId })
            .then(response => {
                if (response.data.status) {
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

            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
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
        <div className="container products-container" style={{ 'margin-top': '202rem' }}>
            <ToastContainer />
            <div className="offers-section mb-4 text-success">
                {offers && offers.length > 0 ? (
                    offers.map((offer) => (
                        <div key={offer._id} className="offer-card">
                            <img src={offer.imageID.image} alt={offer.description} className="offer-image" />
                            <div className="offer-details">
                                <p className="offer-description">{offer.description}</p>
                                <span className="offer-discount">Save {offer.discountPercentage}%</span>
                            </div>
                        </div>
                    ))
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
                    return (
                        <div key={index} className="product-card bg-white">
                            <img src={product.mainImage.image} alt={product.name} className="product-image" />
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
                                                    <i class="bi bi-cart-check"></i>
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
                                                    <i class="bi bi-heart-half"></i>
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
