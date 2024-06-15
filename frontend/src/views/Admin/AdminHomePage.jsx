import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import '../Admin/adminDesign.css'
import { updateUserAuthenticate } from '../../config/authenticateCondition';
function AdminHomePage() {
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axiosInstance.get('/admin/get-users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${hours}:${minutes} ${ampm}`;
    return `${month} - ${day} ⏱️${formattedTime}`;
  }

  const handleEdit = (objID) => {
    const user = users && users.filter((data) => data._id === objID)
    console.log(user[0]);
    setFormData({ username: user[0].username, email: user[0].email, newPassword: '' })
  }

  const handleDelete = (objID) => {
    console.log(Object.keys(formData));
  }

  const handleCancelEdit = () => {
    setFormData({})
    console.log(errors);

  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = await updateUserAuthenticate(formData.username, formData.email, formData.newPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      console.log('Validation passed, proceed with update');
      
    }
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <div className="container mt-5">
      {Object.keys(formData).length > 0 && (
        <div className="update-form">
          <h2 className='d-flex justify-content-center txt-heading'>Update User</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className='form-labels'>Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <div className="error">{errors.username}</div>}
            </div>
            <div className="form-group">
              <label className='form-labels'>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className='form-labels'>New Password</label>
              <input
                type="password"
                className="form-control"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
              {errors.password && <div className="error">{errors.password}</div>}
            </div>
            <div className='d-flex gap-2'>
              <button type="submit" className="btn btn-success mt-3 w-50">Save</button>
              <button className="btn btn-primary mt-3 w-50" onClick={(()=> handleCancelEdit())}>Cancel</button>
            </div>

          </form>
        </div>
      )}
      <div className={`row ${Object.keys(formData).length > 0 ? 'blur' : ''}`}>
        {users.map(user => (
          <div key={user._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div className="card user-card">
              <div className="card-body">
                <h5 className="card-title userName">{user.username}</h5>
                <p className="card-text email">{user.email}</p>
                <p className="card-text email">{formatDate(user.createdAt)}</p>
                <div className='d-flex gap-2'>
                  <button className="btn btn-primary w-50 edit-btn" onClick={() => handleEdit(user._id)}>Edit</button>
                  <button className="btn btn-danger w-50 dlt-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminHomePage
