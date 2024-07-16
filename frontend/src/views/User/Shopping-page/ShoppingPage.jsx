import React from 'react'
import Layout from '../Header/Layout'
import './shoppingPage.css'
function ShoppingPage() {
    const mainHeading = "Shop Category";
    const breadcrumbs = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
    ];

    const catergories = [
        { name: 'Adidas', stock: 20 },
        { name: 'Nike', stock: 30 },
        { name: 'Puma', stock: 25 },
        { name: 'Sanders', stock: 10 },
        { name: 'Calcin Klein', stock: 40 },
        { name: 'Fila', stock: 23 },
    ]

    const colors = ['Black','Red','Blue','Green','Violet','Purple','Yellow']

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


    return (
        <div>
            <Layout mainHeading={mainHeading} breadcrumbs={breadcrumbs} />
            <div className='d-flex container'>
                <div className="container mt-5">
                    <div className="row mt-5">
                        <div className="sidebar-categories">
                            <div className="head">Browse Categories</div>
                            <ul className="main-categories">
                                <li className="main-nav-list">
                                    {catergories && catergories.map((brand, index) => (
                                        <a key={index} data-toggle="collapse" href="#fruitsVegetable" aria-expanded="false" aria-controls="fruitsVegetable">
                                            <span className="lnr lnr-arrow-right"></span>{brand.name}<span className="number">({brand.stock})</span>
                                        </a>
                                    ))}
                                </li>
                            </ul>
                        </div>
                        <div className="sidebar-categories">
                            <div className="head">Browse Categories</div>
                            <ul className="main-categories">
                                <li className="main-nav-list">
                                    {colors && colors.map((color, index) => (
                                        <a key={index} data-toggle="collapse" href="#fruitsVegetable" aria-expanded="false" aria-controls="fruitsVegetable" style={{justifyContent:'start'}}>
                                            <span className="lnr lnr-arrow-right"></span>{color}
                                        </a>
                                    ))}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="container products-container mt-4 shopping-products">
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
                    <div className="products-grid mt-4" style={{'grid-template-columns':'repeat(3, 1fr)'}}>
                        {products.map((product, index) => (
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShoppingPage
