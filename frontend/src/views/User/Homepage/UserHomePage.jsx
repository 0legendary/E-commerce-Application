import React from 'react';
import './userdesign.css';
import bgImage from '../../../Assests/bgimage12046-5l2i-2000w.png';
import productBanner from '../../../Assests/tq_rnlvg4glbc-mj8-1500h.png';
import Products from './Products/Products';

function UserHomePage() {
  return (
    <div>
      <div className="user-home-page" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="container home-content">
          <div className="home-heading">
            <h1>Nike New Collection!</h1>
            <p>The Nike Reax 8 TR combines lightweight containment with responsive cushioning for premium performance while training.</p>
          </div>
          <div className="home-banner">
            <img src={productBanner} alt="Product Banner" className="img-fluid" />
          </div>
        </div>
      </div>
      <Products />
    </div>
  );
}

export default UserHomePage;
