import React, { useEffect, useState } from 'react';
import './products.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosConfig';


function Products() {
    const [cartProducts, setCartProducts] = useState([])
    const [products, setProducts] = useState([])

    useEffect(() => {
        axiosInstance.get('/user/home/getProducts')
            .then(response => {
                if (response.data.status) {
                    setCartProducts(response.data.cartProducts ? response.data.cartProducts : []);
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
                    setCartProducts([...cartProducts, productId]);
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    };
    return (
        <div className="container products-container" style={{'margin-top':'180rem'}}>
            <div className="products-header">
                <span className="products-title"><span>Latest Products</span></span>
            </div>
            <div className="products-grid mt-4" style={{ 'grid-template-columns': 'repeat(4, 1fr)'}}>
                {products.map((product, index) => {
                    const isInCart = Array.isArray(cartProducts) && cartProducts.includes(product._id);
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
                                    <Link to={`/checkout/${product._id}`}>
                                        <button className='btn border border-success text-black'>Buy</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export default Products;
