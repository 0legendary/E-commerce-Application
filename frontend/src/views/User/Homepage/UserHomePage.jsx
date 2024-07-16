import React, { useEffect, useState } from 'react'
import './userdesign.css'
import axiosInstance from '../../../config/axiosConfig'
import { useNavigate } from 'react-router-dom'
import bgImage from '../../../Assests/bgimage12046-5l2i-2000w.png'
import productBanner from '../../../Assests/tq_rnlvg4glbc-mj8-1500h.png'
import StaticPage from './StaticPage'
import Products from './Products/Products'

function UserHomePage() {
  const [user, setUser] = useState({})

  const navigate = useNavigate()

  useEffect(() => {

    axiosInstance.post('/user/get-user')
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data)
        } else {
          setUser(user)
          navigate('/authentication')
        }

      }).catch(() => navigate('/authentication'))

  }, [navigate])

  return (
    <div className='user-home-page'>
      <div class="home-section">
        <img src={bgImage} alt="bgimage12046" class="home-bgimage1" />
        <div class="home-container01">
          <div class="home-heading1">
            <span class="home-text">
              <span>Nike New</span>
              <br />
              <span>Collection!</span>
            </span>
          </div>
          <span class="home-text004">
            <span>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
              do
            </span>
            <br />
            <span>
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim
            </span>
            <br />
            <span>ad minim veniam, quis nostrud exercitation.</span>
          </span>
          {/* <div class="home-link">
            <img src={bgImage} alt="Icon2046" class="home-icon" />
          </div>
          <span class="home-text010"><span>Add to Bag</span></span>
          */}
          <div className="home-bannerimgpng" style={{ backgroundImage: `url(${productBanner})` }}></div>
        </div>
        <div class="home-container02">
          <div class="home-prevpng"></div>
        </div>
        <div class="home-container03">
          <div class="home-nextpng"></div>
        </div>
      </div>
      <StaticPage/>
      <Products/>
    </div>
  )
}


export default UserHomePage
