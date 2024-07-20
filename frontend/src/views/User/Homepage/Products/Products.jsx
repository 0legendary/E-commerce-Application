import React from 'react';
import './products.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';

const products = [
    {
        name: "ULTRA 4DFWD SHOES",
        currentPrice: "$150.00",
        originalPrice: "$210.00",
        image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/3043cb0d50914898aae5d828a9d27e58_9366/POMAZOR_SHOES_Black_IQ9813_01_standard.jpg"
    },
    {
        name: "CLOUD TEC SHOES",
        currentPrice: "$150.00",
        originalPrice: "$210.00",
        image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/e80881461dfe4b439b39af8a009cab3d_9366/clinch-x-shoes.jpg"
    },
    {
        name: "ULTRABOUNCE SHOES",
        currentPrice: "$300.00",
        originalPrice: "$210.00",
        image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/0dff0765cd1242faa364f580eeb6c668_9366/zapcore-shoes.jpg"
    },
    {
        name: "SWITCH RUN RUNNING SHOES",
        currentPrice: "$150.00",
        originalPrice: "$210.00",
        image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/d9b954ec0f3e47c28597aebd00c876e7_9366/vertago-shoes.jpg"
    },
    {
        name: "Adi ChiC shoes",
        currentPrice: "$150.00",
        originalPrice: "$210.00",
        image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/d0ac66c1956a4c5daaa2af3701791b03_9366/ultrabounce-shoes.jpg"
    },
    {
        name: "DURAMO SPEED SHOES",
        currentPrice: "$150.00",
        originalPrice: "$210.00",
        image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/6a3fe6b04ad14b098b66efed63fd18f1_9366/cyberrun-shoes.jpg"
    },
    {
        name: "adimove shoes",
        currentPrice: "$150.00",
        originalPrice: "$210.00",
        image: "https://assets.adidas.com/images/w_766,h_766,f_auto,q_auto,fl_lossy,c_fill,g_auto/b29b675df6d24c1e8b319698667c348c_9366/switch-fwd-running-shoes.jpg"
    }
];

function Products() {
    return (
        <div className="container products-container">
            <div className="products-header">
                <span className="products-title"><span>Latest Products</span></span>
            </div>
            <div className="products-grid">
                {products.map((product, index) => (
                    <Link to={`/singleProduct/${product._id}`}>
                        <div key={index} className="product-card">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <div className="product-details">
                                <span className="product-name"><span>{product.name}</span></span>
                            </div>
                            <div className='d-flex gap-3'>
                                <span className="product-current-price"><span>{product.currentPrice}</span></span>
                                <span className="product-original-price"><span>{product.originalPrice}</span></span>
                            </div>

                            <div className="product-actions w-100 justify-content-between">
                                <div className='d-flex gap-1'>
                                    <div className="product-background">
                                        <i class="bi bi-cart3"></i>
                                    </div>
                                    <div className="product-background">
                                        <i class="bi bi-heart"></i>
                                    </div>
                                    <div className="product-background">
                                        <i class="bi bi-search"></i>
                                    </div>

                                </div>
                                <div>
                                    <button className='btn border border-success text-black'>Buy</button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}


export default Products;
