import React from 'react'

function UserHeader() {
  
  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href='/'>Navbar</a>
        <form className="d-flex" role="search">
          <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"></input>
            <button className="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </nav>
  )
}

export default UserHeader
