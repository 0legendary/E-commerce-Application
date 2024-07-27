import React from 'react'
import './header.css'
import { Link } from 'react-router-dom'

function Header() {
    return (
        <div>
            <div class="home-header-nav">
                <div class="home-container04">
                    <div class="home-link01">
                        <span class="home-text012"><span>O'legendary</span></span>
                    </div>
                    <div class="home-list">
                        <Link to="/"> <a><span class="home-text014"><span>HOME</span></span></a></Link>
                        <Link to="/login">
                            <a><span class="home-text016"><span>LOGIN</span></span></a>
                        </Link>
                        <Link to="/shop">
                            <a><span class="home-text018"><span>SHOP</span></span></a>
                        </Link>
                        <Link to="/orders"><a><span class="home-text020"><span>ORDERS</span></span></a></Link>
                        <Link to="/wallet">
                            <a><span class="home-text022"><span>WALLTE</span></span></a>
                        </Link>
                    </div>
                    <div class="home-list1">
                        <div class="home-item05">
                            <i class="bi bi-cart2 home-icon01"></i>
                        </div>
                        <div class="home-item06">
                            <i class="bi bi-heart home-icon02"></i>
                        </div>
                        <div class="home-item07">
                            <Link to='/account'>
                                <i class="bi bi-person home-icon03"></i>
                            </Link>
                        </div>
                    </div>
                    <div class="home-searchbar">
                        <div class="home-statelayer">
                            <div class="home-content">
                                <span class="home-text024 M3bodylarge">
                                    <span>search products</span>
                                </span>
                            </div>
                            <div class="home-trailing-elements">
                                <div class="home-frame1sttrailingicon">
                                    <div class="home-container05">
                                        <div class="home-statelayer1">
                                            <i class="bi bi-search home-icon03" ></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Header
