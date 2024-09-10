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
      <div className="home-header-nav" style={{"left": "0", "top":"0", "width":"100%"}}>
                <div className="home-container04">
                    <div className="home-link01" >
                        <span className="home-text012"><span>Admin Panel</span></span>
                    </div>
                    <div className="home-list1">
                        <div className="home-item05" onClick={deleteAcessToken}>
                            <i className="bi bi-power home-icon01" style={{"left": "45rem", "font-size":"x-large", "top":"9px"}}></i>
                        </div>
                    </div>
                    <div className="home-searchbar" style={{"left": "82rem"}}>
                        <div className="home-statelayer">
                            <div className="home-content">
                                <span className="home-text024 M3bodylarge">
                                    <span>search products</span>
                                </span>
                            </div>
                            <div className="home-trailing-elements">
                                <div className="home-frame1sttrailingicon">
                                    <div className="home-container05">
                                        <div className="home-statelayer1">
                                            <i className="bi bi-search home-icon03" ></i>
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
