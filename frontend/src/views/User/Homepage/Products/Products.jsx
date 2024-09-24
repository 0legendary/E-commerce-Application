import React, { useEffect, useState } from 'react';
import './products.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartWishlist } from '../../Header/CartWishlistContext';
import { handleApiResponse } from '../../../../utils/utilsHelper';
import { Carousel } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingSpinner from '../../../Loading/LoadingSpinner';


function Products() {
    const { updateWishlistLength, updateCartLength } = useCartWishlist();
    const [cartProducts, setCartProducts] = useState([])
    const [products, setProducts] = useState([])
    const [wishlistProducts, setWishlistProducts] = useState([])
    const [offers, setOffers] = useState([])
    const [loading, setLoading] = useState(true);
    const [isLoadingAction, setIsLoadingAction] = useState(false)

    useEffect(() => {
        const fetchHomeProducts = async () => {
            const result = await handleApiResponse(axiosInstance.get('/user/home/getProducts'));

            if (result.success) {
                const { products, offers, cartProducts, wishlistProducts } = result.data;

                setOffers(offers || []);
                setCartProducts(cartProducts || []);
                setWishlistProducts(wishlistProducts || []);

                const sortedProducts = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const latestProducts = sortedProducts.slice(0, 10);
                setProducts(latestProducts);
            } else {
                console.error('Error:', result.message);
            }
            setLoading(false);
        };

        fetchHomeProducts();
    }, []);

    const addToCart = async (productId) => {
        try {
            setIsLoadingAction(true);
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
            isLoadingAction(false);
            toast.error('Something went wrong', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
        }finally{
            setIsLoadingAction(false);
        }
    };

    const addToWishlist = async (productId) => {
        try {
            setIsLoadingAction(true);
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
            console.error('Error sending data:', error);
        }finally{
            setIsLoadingAction(false);
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
        <div className="container-fluid products-container home-page">
            <ToastContainer />
            <LoadingSpinner isLoadingAction={isLoadingAction} />
            <div className="offers-section mb-4 text-success">

                {loading ? (
                    <div className='carousel'>
                        <Skeleton height={600} width={'100%'} />
                    </div>
                ) : offers && offers.length > 0 ? (
                    <Carousel>
                        {offers.map((offer) => (
                            <Carousel.Item key={offer._id} className='rounded-4'>
                                <img
                                    className="d-block w-100 offer-image"
                                    src={offer.imageID.images[0].cdnUrl}
                                    alt={offer.description}
                                />
                                <Carousel.Caption className="offer-details">
                                    <p className="offer-description">{offer.description}</p>
                                    <span className="offer-discount">
                                        Save {offer.discountPercentage ? `${offer.discountPercentage}%` : `${offer.discountAmount} $`}
                                    </span>
                                </Carousel.Caption>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                ) : (
                    <p>No current offers.</p>
                )}
            </div>

            <div className="products-header">
                <span className="products-title"><span>Latest Products</span></span>
            </div>

            <div className="products-grid mt-4">
                {loading ? (
                    Array(10).fill().map((_, index) => (
                        <div key={index} className="skeleton-card-container border rounded p-2">
                            <Skeleton height={270} width={'100%'} />
                            <div className="product-details">
                                <Skeleton count={2} height={20} width={'80%'} />
                            </div>
                            <div className="product-details pt-1 pb-1">
                                <Skeleton height={20} width={'30%'} />
                                <Skeleton height={20} width={'30%'} />
                            </div>
                            <div className='d-flex justify-content-between'>
                                <div className='me-5'>
                                    <Skeleton containerClassName='d-flex gap-1 pt-2' count={3} circle width={40} height={40} />
                                </div>
                                <div className='d-flex w-100'>
                                    <Skeleton containerClassName='w-100' height={40} width={'100%'} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    products.map((product, index) => {
                        const isInCart = Array.isArray(cartProducts) && cartProducts.includes(product._id);
                        const isWishlist = Array.isArray(wishlistProducts) && wishlistProducts.includes(product._id);
                        const applicableOffer = getApplicableOffer(product._id);
                        const applicableCategoryOffer = getApplicableOffer(product.categoryId._id.toString());
                        const inStock = product.variations[0].stock > 0;
                        const mainImage = product.images.images.find(img => img.mainImage === true);

                        return (
                            <div key={index} className="product-card bg-white">
                                <img src={mainImage.cdnUrl} alt={product.name} className="product-image" />
                                <div className="product-details">
                                    <span className="product-name">
                                        <span className="truncate-text">{product.name}</span>
                                    </span>
                                </div>
                                <div className='d-flex gap-3'>
                                    <span className="product-current-price"><span>{product.variations[0].price}</span></span>
                                    <span className="product-original-price"><span>{product.variations[0].discountPrice}</span></span>
                                </div>
                                <div className='d-flex' style={{ fontFamily: 'Saira Stencil One' }}>
                                    <div className="offer-badge">
                                        {applicableOffer
                                            ? applicableOffer.discountPercentage
                                                ? `|| ${applicableOffer.discountPercentage}% OFF ||`
                                                : `|| Discount: ${applicableOffer.discountAmount} ||`
                                            : ' '}
                                    </div>

                                    {applicableCategoryOffer && (
                                        <div className="offer-badge">
                                            {applicableCategoryOffer ?
                                                applicableCategoryOffer.discountPercentage
                                                    ? `|| ${applicableCategoryOffer.discountPercentage}% OFF ||`
                                                    : `|| Discount: ${applicableCategoryOffer.discountAmount} ||`
                                                : ''}
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
                    })
                )}
            </div>
        </div>
    );
}


export default Products;
