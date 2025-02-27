import React, { useEffect, useState } from 'react';
import Layout from '../Header/Layout';
import './shoppingPage.css';
import axiosInstance from '../../../config/axiosConfig';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartWishlist } from '../Header/CartWishlistContext';
import { handleApiResponse } from '../../../utils/utilsHelper';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingSpinner from '../../Loading/LoadingSpinner';

function ShoppingPage() {
    const { updateWishlistLength, updateCartLength } = useCartWishlist();
    const [products, setProducts] = useState([]);
    const [cartProducts, setCartProducts] = useState([]);
    const [wishlistProducts, setWishlistProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortOption, setSortOption] = useState('default');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [priceRange, setPriceRange] = useState([0, Infinity]);
    const [searchTerm, setSearchTerm] = useState('');
    const [offers, setOffers] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isLoadingAction, setIsLoadingAction] = useState(false)
    const itemsPerPage = 8;

    const mainHeading = "Shop Category";
    const breadcrumbs = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
    ];

    useEffect(() => {
        const fetchHomeProducts = async () => {
            const result = await handleApiResponse(axiosInstance.get('/user/home/getProducts'));

            if (result.success) {
                const { products, offers, cartProducts, wishlistProducts } = result.data;
                setLoading(false);
                setOffers(offers || []);
                setCartProducts(cartProducts || []);
                setWishlistProducts(wishlistProducts || []);
                setProducts(products || []);
                setFilteredProducts(products || []);

            } else {
                console.error('Error:', result.message);
            }
        };

        fetchHomeProducts();
    }, []);


    useEffect(() => {
        filterAndSortProducts();
        // eslint-disable-next-line
    }, [products, selectedCategory, selectedColor, priceRange, sortOption, searchTerm]);

    const filterAndSortProducts = () => {
        let filtered = products;


        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(product => product.categoryId._id === selectedCategory);
        }

        // Filter by color
        if (selectedColor) {
            filtered = filtered.filter(product =>
                product.variations.some(variation => variation.color.includes(selectedColor))
            );
        }

        // Filter by price range
        filtered = filtered.filter(product =>
            product.variations.some(variation =>
                variation.price >= priceRange[0] && variation.price <= priceRange[1]
            )
        );
        if (priceRange[0] > priceRange[1]) {
            setPriceRange([0, Infinity])
        }

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
            );
        }

        // Sort products
        switch (sortOption) {
            case 'price-low-high':
                filtered.sort((a, b) =>
                    Math.min(...a.variations.map(v => v.price)) - Math.min(...b.variations.map(v => v.price))
                );
                break;
            case 'price-high-low':
                filtered.sort((a, b) =>
                    Math.min(...b.variations.map(v => v.price)) - Math.min(...a.variations.map(v => v.price))
                );
                break;
            case 'rating':
                filtered.sort((a, b) =>
                    (b.rating || 0) - (a.rating || 0)
                );
                break;
            case 'new-arrivals':
                filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'a-z':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'z-a':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handleColorClick = (color) => {
        setSelectedColor(color);
    };

    const handlePriceRangeChange = (event) => {
        const { name, value } = event.target;
        const sanitizedValue = value.replace(/[^0-9]/g, '').replace(/^0+/, '');

        const newValue = Math.max(0, Number(sanitizedValue));

        if (name === 'min') {
            setPriceRange(prev => [newValue, prev[1]]);
        } else if (name === 'max') {
            setPriceRange(prev => [prev[0], newValue]);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

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
        } finally {
            setIsLoadingAction(false);
        }
    };


    const addToWishlist = async (productId) => {
        try {
            setIsLoadingAction(true)
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
            console.error('Error sending data:', error);
        } finally {
            setIsLoadingAction(false);
        }
    };

    const uniqueCategories = Array.from(new Set(products.map(product => product.categoryId._id)))
        .map(categoryId => products.find(product => product.categoryId._id === categoryId).categoryId);

    const uniqueColors = Array.from(new Set(products.flatMap(product =>
        product.variations.flatMap(variation => variation.color)
    )));

    const getApplicableOffer = (productId) => {
        const currentDate = new Date();
        return offers.find(offer =>
            offer.applicableTo.includes(productId) &&
            new Date(offer.startDate) <= currentDate &&
            new Date(offer.endDate) >= currentDate
        );
    };


    // Reset Filters Function
    const resetFilters = () => {
        setSelectedCategory(null);
        setSelectedColor(null);
        setPriceRange([0, Infinity]);
        setSearchTerm('');
        setSortOption('default');
        setCurrentPage(1);
    };


    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const capitalizeFirstLetter = (str) => {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };


    return (
        <div>
            <LoadingSpinner isLoadingAction={isLoadingAction} />
            <SkeletonTheme baseColor='#d6d6d6' highlightColor='#ecebeb'>
                <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
                <ToastContainer />
                <div className='row col-md-12 p-5'>
                    <div className="mt-3 col-md-3 ">
                        <div className="row pe-5">
                            <div className="sidebar-categories">
                                {loading ? (
                                    <>
                                        <div className="head">Filter by Price</div>
                                        <div className='pt-2'>
                                            <Skeleton containerClassName='d-flex gap-2' count={2} borderRadius={10} height={35} width={'50%'} />
                                        </div>
                                        <div className='pt-3'>
                                            <Skeleton containerClassName='d-flex gap-1' count={4} borderRadius={2} height={35} width={'50%'} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="head">Filter by Price</div>
                                        <div className="price-filter">
                                            <div className="price-input">
                                                <label htmlFor="minPrice">Minimum Price</label>
                                                <input
                                                    id="minPrice"
                                                    type="number"
                                                    name="min"
                                                    value={priceRange[0]}
                                                    onChange={handlePriceRangeChange}
                                                    placeholder="0"
                                                    step="1"
                                                    inputMode="numeric"
                                                />
                                            </div>
                                            <div className="price-input">
                                                <label htmlFor="maxPrice">Maximum Price</label>
                                                <input
                                                    id="maxPrice"
                                                    type="number"
                                                    name="max"
                                                    value={priceRange[1]}
                                                    onChange={handlePriceRangeChange}
                                                    placeholder="0"
                                                    step="1"
                                                    inputMode="numeric"
                                                />
                                            </div>
                                        </div>
                                        <div className="price-suggestions">
                                            <div className={`suggestion ${priceRange && priceRange[0] === 0 && priceRange[1] === 500 ? 'selected-filter' : ''}`} onClick={() => setPriceRange([0, 500])}>Under $500</div>
                                            <div className={`suggestion ${priceRange && priceRange[0] === 500 && priceRange[1] === 1000 ? 'selected-filter' : ''}`} onClick={() => setPriceRange([500, 1000])}>$500 - $1000</div>
                                            <div className={`suggestion ${priceRange && priceRange[0] === 1000 && priceRange[1] === 2000 ? 'selected-filter' : ''}`} onClick={() => setPriceRange([1000, 2000])}>$1000 - $2000</div>
                                            <div className={`suggestion ${priceRange && priceRange[0] === 2000 && priceRange[1] === Infinity ? 'selected-filter' : ''}`} onClick={() => setPriceRange([2000, Infinity])}>Above $2000</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="sidebar-categories">
                                <div className="head">Browse Categories</div>
                                <ul className="main-categories">
                                    {loading ? (
                                        Array(5).fill().map((_, index) => (
                                            <li key={index} className="main-nav-list">
                                                <Skeleton borderRadius={10} height={45} width={'100%'} />
                                            </li>
                                        ))
                                    ) : (
                                        uniqueCategories.map((category, index) => {
                                            const applicableOffer = getApplicableOffer(category._id);
                                            const isSelected = selectedCategory === category._id;
                                            return (
                                                <li key={index} className="main-nav-list">
                                                    {/* eslint-disable-next-line */}
                                                    <a
                                                        onClick={() => handleCategoryClick(category._id)}
                                                        className={`link-button d-flex justify-content-between ${isSelected ? 'selected-filter' : ''}`} // Apply selected class
                                                    >
                                                        <div className='d-flex'>
                                                            <span className="lnr lnr-arrow-right"></span>{category.name}
                                                            {applicableOffer && (
                                                                <div className="offer-badge">
                                                                    {applicableOffer.discountPercentage
                                                                        ? `${applicableOffer.discountPercentage}% OFF`
                                                                        : `Discount: ${applicableOffer.discountAmount}`}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="">
                                                            <span className="number">({products.filter(product => product.categoryId._id === category._id).length})</span>
                                                        </div>
                                                    </a>
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                            </div>

                            <div className="sidebar-categories">
                                <div className="head">Browse Colors</div>
                                <ul className="main-categories">
                                    {loading ? (
                                        Array(5).fill().map((_, index) => (
                                            <li key={index} className="main-nav-list">
                                                <Skeleton borderRadius={10} height={45} width={'100%'} />
                                            </li>
                                        ))
                                    ) : (
                                        uniqueColors.map((color, index) => {
                                            const isSelected = selectedColor === color;
                                            return (
                                                <li key={index} className="main-nav-list">
                                                    {/* eslint-disable-next-line */}
                                                    <a
                                                        onClick={() => handleColorClick(color)}
                                                        className={isSelected ? 'selected-filter' : ''}
                                                        style={{ justifyContent: 'start' }}
                                                    >
                                                        <span className="lnr lnr-arrow-right"></span>{capitalizeFirstLetter(color)}
                                                    </a>
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='card col-md-9 mt-4'>
                        <div className="products-container shopping-products">
                            <div className="d-flex justify-content-end align-items-center gap-3">
                                <div className="sorting">
                                    <select
                                        className="form-select"
                                        aria-label="Default sorting"
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                    >
                                        <option value="default">Default sorting</option>
                                        <option value="price-low-high">Price: low to high</option>
                                        <option value="price-high-low">Price: high to low</option>
                                        <option value="rating">Average ratings</option>
                                        <option value="new-arrivals">New arrivals</option>
                                        <option value="a-z">A - Z</option>
                                        <option value="z-a">Z - A</option>
                                    </select>
                                </div>
                                <div className="search d-flex align-items-center">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <i className="bi bi-search search-icon"></i>
                                </div>
                                <button className="btn btn-secondary" onClick={resetFilters}>Reset Filters</button>
                            </div>
                            <div className="products-grid mt-4 shopping-products">
                                {loading ? (
                                    Array(8).fill().map((_, index) => (
                                        <div key={index} className="border rounded p-2">
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
                                    currentProducts.map((product, index) => {
                                        const isInCart = Array.isArray(cartProducts) && cartProducts.includes(product._id);
                                        const isWishlist = Array.isArray(wishlistProducts) && wishlistProducts.includes(product._id);
                                        const applicableOffer = getApplicableOffer(product._id);
                                        const applicableCategoryOffer = getApplicableOffer(product.categoryId._id.toString());
                                        const inStock = product.variations[0].stock > 0;
                                        const mainImage = product.images.images.find(img => img.mainImage === true);

                                        return (
                                            <div key={index} className="product-card shopping-page-card">
                                                <img src={mainImage.cdnUrl} alt={product.name} className="product-image" />
                                                <div className="product-details">
                                                    <span className="product-name text-white"><span>{product.name}</span></span>
                                                </div>
                                                <div className='d-flex gap-3 text-white'>
                                                    <span className="product-current-price text-white"><span>{product.variations[0].price}</span></span>
                                                    <span className="product-original-price text-white"><span>{product.variations[0].discountPrice}</span></span>
                                                </div>
                                                <div className='d-flex'>
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
                                                    <div className="product-actions w-100 text-white justify-content-between">
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
                                                                <button className='btn border border-success text-white'>Buy</button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <h5 className='text-danger'>Out of Stock</h5>
                                                )}
                                            </div>
                                        );
                                    })
                                )}

                            </div>

                            <div className="pagination mt-3 d-flex justify-content-end">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                                    </li>
                                    {[...Array(totalPages).keys()].map(pageNumber => (
                                        <li key={pageNumber} className={`page-item ${currentPage === pageNumber + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(pageNumber + 1)}>
                                                {pageNumber + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </SkeletonTheme>
        </div>
    );
}

export default ShoppingPage;
