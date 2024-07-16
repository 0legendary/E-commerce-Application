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
      <nav className="navbar bg-dark p-3">
        <div className="container-fluid">
          <a className="navbar-brand text-white" href='/admin'>Admin PANEL </a>
          <div className="d-flex" role="search">
            <a href='/authentication'>
              <button className="btn btn-outline-success text-white" onClick={deleteAcessToken}>Log out</button>
            </a>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default AdminHeader
