import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import '../Admin/adminDesign.css'
function AdminHomePage() {
  const [users, setUsers] = useState([])

    useEffect(() => {
      axiosInstance.get('/admin/get-users')
        .then(response => setUsers(response.data))
        .catch(error => console.error('Error fetching users:', error));
    }, []);

  return (
    <div className="container mt-5">
      <div className="row">
        {users.map(user => (
          <div key={user._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div className="card user-card">
              <div className="card-body">
                <h5 className="card-title">{user.username}</h5>
                <p className="card-text">{user.email}</p>
                <button className="btn btn-primary">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminHomePage
