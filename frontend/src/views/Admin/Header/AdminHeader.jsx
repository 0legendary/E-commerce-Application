import React from 'react'
import { useNavigate } from 'react-router-dom'

function AdminHeader() {
  const navigate = useNavigate()
  const deleteAcessToken = () => {
    sessionStorage.removeItem('accessToken')
    navigate('/admin/auth')
  }
  return (
    <div>
      <div class="home-header-nav" style={{"left": "0", "top":"0", "width":"100%"}}>
                <div class="home-container04">
                    <div class="home-link01" >
                        <span class="home-text012"><span>Admin Panel</span></span>
                    </div>
                    <div class="home-list1">
                        <div class="home-item05" onClick={deleteAcessToken}>
                            <i class="bi bi-power home-icon01" style={{"left": "45rem", "font-size":"x-large", "top":"9px"}}></i>
                        </div>
                    </div>
                    <div class="home-searchbar" style={{"left": "82rem"}}>
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

export default AdminHeader
