import React, { useEffect, useState } from 'react';
import Layout from '../Header/Layout';
import './shoppingPage.css';
import axiosInstance from '../../../config/axiosConfig';
import { Link } from 'react-router-dom';

function ShoppingPage() {
    const [products, setProducts] = useState([]);
    const [cartProducts, setCartProducts] = useState([])
    const mainHeading = "Shop Category";
    const breadcrumbs = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
    ];


    useEffect(() => {
        axiosInstance.get('/user/getProducts')
            .then(response => {
                if (response.data.status) {
                    console.log(response.data.cartProducts);
                    setCartProducts(response.data.cartProducts ? response.data.cartProducts : [])
                    setProducts(response.data.products);
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }, []);

    const uniqueCategories = Array.from(new Set(products.map(product => product.categoryId._id)))
        .map(categoryId => {
            return products.find(product => product.categoryId._id === categoryId).categoryId;
        });

    const addToCart = async (productId) => {
        axiosInstance.post('/user/add-to-cart', { productId })
            .then(response => {
                if (response.data.status) {
                    setCartProducts([...cartProducts, productId])
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }

    return (
        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <div className='d-flex container w-100'>
                <div className="container mt-5 w-30">
                    <div className="row mt-5">
                        <div className="sidebar-categories">
                            <div className="head">Browse Categories</div>
                            <ul className="main-categories">
                                <li className="main-nav-list">
                                    {uniqueCategories && uniqueCategories.map((category, index) => (
                                        <a key={index} data-toggle="collapse" href="#fruitsVegetable" aria-expanded="false" aria-controls="fruitsVegetable">
                                            <span className="lnr lnr-arrow-right"></span>{category.name}<span className="number">({products.filter(product => product.categoryId._id === category._id).length})</span>
                                        </a>
                                    ))}
                                </li>
                            </ul>
                        </div>
                        <div className="sidebar-categories">
                            <div className="head">Browse Categories</div>
                            <ul className="main-categories">
                                <li className="main-nav-list">
                                    {products && (() => {
                                        const displayedColors = new Set();
                                        return products.map((product, prodIndex) => (
                                            <React.Fragment key={prodIndex}>
                                                {product.variations.map((variation) => variation.color).flat().map((color, colorIndex) => {
                                                    if (!displayedColors.has(color)) {
                                                        displayedColors.add(color);
                                                        return (
                                                            <a key={colorIndex} style={{ justifyContent: 'start' }}>
                                                                <span className="lnr lnr-arrow-right"></span>{color}
                                                            </a>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </React.Fragment>
                                        ));
                                    })()}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="container products-container mt-4 shopping-products w-70">
                    <div className="d-flex justify-content-end align-items-center gap-3">
                        <div className="sorting">
                            <select className="form-select" aria-label="Default sorting">
                                <option value="1">Default sorting</option>
                                <option value="2">Sort by popularity</option>
                                <option value="3">Sort by rating</option>
                                <option value="4">Sort by latest</option>
                            </select>
                        </div>
                        <div className="search d-flex align-items-center">
                            <input type="text" className="form-control" placeholder="Search..." />
                            <i className="bi bi-search search-icon"></i>
                        </div>
                    </div>
                    <div className="products-grid mt-4" style={{ 'grid-template-columns': 'repeat(3, 1fr)' }}>
                        {products.map((product, index) => {
                            const isInCart = Array.isArray(cartProducts) && cartProducts.includes(product._id);
                            return (
                                <div key={index} className="product-card">
                                    <img src={product.mainImage.image} alt={product.name} className="product-image" />
                                    <div className="product-details">
                                        <span className="product-name"><span>{product.name}</span></span>
                                    </div>
                                    <div className='d-flex gap-3'>
                                        <span className="product-current-price"><span>{product.variations[0].price}</span></span>
                                        <span className="product-original-price"><span>{product.variations[0].discountPrice}</span></span>
                                    </div>
                                    <div className="product-actions w-100 justify-content-between">
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
                                            <div className="product-background">
                                                <i className="bi bi-heart"></i>
                                            </div>
                                            <Link to={`/shop/${product._id}`}>
                                                <div className="product-background">
                                                    <i className="bi bi-search"></i>
                                                </div>
                                            </Link>
                                        </div>
                                        <div>
                                            <button className='btn border border-success text-black'>Buy</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShoppingPage;
