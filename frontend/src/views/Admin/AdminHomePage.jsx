import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import '../Admin/adminDesign.css'
import { updateUserAuthenticate, signUpAuthenticate, formatDate } from '../../config/authenticateCondition';
import TrashedUsers from './TrashedUsers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import moment from 'moment';

function AdminHomePage() {
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({})
  const [changes, setChanges] = useState({})
  const [createUser, setCreateUser] = useState(false)
  const [deleteUser, setDeleteUser] = useState(false)
  const [deltUserId, setDeltUserId] = useState({})
  const [trasehedUsers, setTrasehedUsers] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    axiosInstance.get('/admin/get-users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);



  const handleEdit = (objID) => {
    const user = users && users.filter((data) => data._id === objID)
    setChanges({ username: user[0].username, email: user[0].email, newPassword: '', confirmPassword: '' })
    setFormData({ _id: user[0]._id, username: user[0].username, email: user[0].email, newPassword: '', confirmPassword: '' })
  }

  const handleNewUser = () => {
    setCreateUser(true)
    setTrasehedUsers(false)
    setChanges({ username: '', email: '', newPassword: '', confirmPassword: '' })
    setFormData({ _id: '', username: '', email: '', newPassword: '', confirmPassword: '' })
  }



  const handleCancelEdit = () => {
    setFormData({})
    setErrors({})
    setSuccess({})
    setCreateUser(false)
    setDeleteUser(false)
    setDeltUserId({})
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = await updateUserAuthenticate(formData.username, formData.email, formData.newPassword, formData.confirmPassword, changes);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      axiosInstance.post('/admin/update-user', formData)
        .then((response) => {
          if (response.status) {
            setSuccess({ update: 'Updated Successfully' })
            setUsers(users.map(user =>
              user._id === formData._id ? { ...user, username: formData.username, email: formData.email } : user
            ));
            setTimeout(() => {
              setSuccess({})
              setFormData({})
            }, 1000)
          } else {
            setErrors({ updateErr: 'Something went wrong' })
          }
        }).catch((err) => {
          console.error("Something went wrong", err)
        })
    }
  };

  const handleCreateNewUser = (e) => {
    e.preventDefault()
    setErrors(signUpAuthenticate(formData.username, formData.email, formData.newPassword, formData.confirmPassword))
    if (Object.keys(errors).length === 0) {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.newPassword,
      };
      axiosInstance.post('/signup', signupData)
        .then(response => {
          const ResData = response.data
          if (ResData.status) {
            setSuccess({ update: 'Account created successfully' })
            setErrors({})
            const newUser = {
              _id: ResData.created._id,
              username: formData.username,
              email: formData.email,
              createdAt: ResData.created.createdAt,
            };
            setUsers(prevUsers => [...prevUsers, newUser]);
            setTimeout(() => {
              setFormData({})
              setCreateUser(false)

            }, 1000)

          } else {
            setErrors({ username: 'Already taken, try another one' })
          }
        })
        .catch(error => {
          console.error('Error sending login data:', error);
        });
    }
  }

  const handleChange = (e) => {
    setErrors({ changes: null })
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteBtn = (objID, username) => {
    setDeleteUser(true)
    setDeltUserId({ _id: objID, username: username })
  }

  const handelDeleteUser = (status) => {
    const reqData = {
      status: status,
      _id: deltUserId._id
    }
    axiosInstance.delete('/admin/delete-user', { data: reqData })
      .then((response) => {
        if (response.data.status) {
          setUsers((prevUsers) => prevUsers.filter(user => user._id !== deltUserId._id));
          setSuccess({ update: status ? 'Deleted successfully' : 'Moved to Trash' })
          setTimeout(() => {
            setDeleteUser(false)
            setErrors({})
            setSuccess({})
          }, 1500)
        } else {
          setErrors({ updateErr: 'Something went wrong' })
        }
      })
      .catch(() => {
        setErrors({ updateErr: 'Something went wrong' })
      })
  }

  const handleTrasedUser = () => {
    setTrasehedUsers(!trasehedUsers)
  }
  const ShowUserBtn = () => {
    setTrasehedUsers(false)
  }

  const RefreshRestoredUser = (data) => {
    setUsers(prevUsers => [...prevUsers, ...data]);
  }

  useEffect(() => {
    let results = users;
    if (searchQuery) {
      results = results.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      results = results.filter(user => moment(user.createdAt).format('YYYY-MM-DD') === formattedDate);
    }
    setFilteredUsers(results);

  }, [searchQuery, users, selectedDate]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };


  return (
    <div className="container mt-5">
      <div className='d-flex align-items-center justify-content-between'>
        <div>
          <button className='create-user-btn btn btn-success' onClick={() => ShowUserBtn()}>Show Users </button>
          <button className='create-user-btn btn btn-success' onClick={() => handleNewUser()}>Create New User ➕</button>
          <button className='create-user-btn btn btn-success' onClick={() => handleTrasedUser()}>Trashed User 🗑️</button>
        </div>
        <div className='d-flex gap-3'>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
            className="form-control create-user-btn"
          />
          <input className="form-control create-user-btn mx-0" type="search" placeholder="Search" aria-label="Search" value={searchQuery}
            onChange={handleSearch}></input>
        </div>
      </div>

      {deleteUser && (
        <div className="update-form bg-dark">
          <h5 className='text-danger d-flex justify-content-center pt-3 pb-3 txt-heading'>Are you sure to delete the user named '{deltUserId.username}' permenantly ?</h5>
          <div className='d-flex gap-2 justify-content-center pb-3'>
            <button className='btn btn-danger w-50' onClick={() => handelDeleteUser(true)}>Delete Permenantly</button>
            <button className='btn btn-warning w-50' onClick={() => handelDeleteUser(false)}>Move to Trash</button>
          </div>
          <button className='btn btn-primary w-100' onClick={() => handleCancelEdit()}>Cancel Deletion</button>
          {errors.updateErr && <div className="error alignText">{errors.updateErr}</div>}
          {success.update && <div className="success alignText">{success.update}</div>}
        </div>
      )}
      {Object.keys(formData).length > 0 && (
        <div className="update-form">
          <h2 className='d-flex justify-content-center txt-heading'>{createUser ? 'Create User' : 'Update User'}</h2>
          <form onSubmit={createUser ? handleCreateNewUser : handleUpdate}>
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
              {errors.notFilledPassword && <div className="error">{errors.notFilledPassword}</div>}
            </div>
            <div className="form-group">
              <label className='form-labels'>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.notMatching && <div className="error">{errors.notMatching}</div>}
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
            </div>
            <div className='d-flex gap-2'>
              <button type="submit" className="btn btn-success mt-3 w-50">{createUser ? 'Create' : 'Update'}</button>
              <button className="btn btn-primary mt-3 w-50" onClick={(() => handleCancelEdit())}>Cancel</button>
            </div>
            {success.update && <div className="success alignText">{success.update}</div>}
            {errors.updateErr && <div className="error alignText">{errors.updateErr}</div>}
            {errors.changes && <div className="error alignText">{errors.changes}</div>}
          </form>
        </div>
      )}
      {!trasehedUsers ? (
        <div className={`row ${Object.keys(formData).length > 0 || deleteUser ? 'blur' : ''}`}>
          {filteredUsers.map(user => (
            <div key={user._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
              <div className="card user-card">
                <div className="card-body">
                  <h5 className="card-title userName">{user.username}</h5>
                  <p className="card-text email">{user.email}</p>
                  <p className="card-text email">{formatDate(user.createdAt)}</p>
                  <div className='d-flex gap-2'>
                    <button className="btn btn-primary w-50 edit-btn" onClick={() => handleEdit(user._id)}>Edit</button>
                    <button className="btn btn-danger w-50 dlt-btn" onClick={() => handleDeleteBtn(user._id, user.username)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TrashedUsers invokeTrash={RefreshRestoredUser} />
      )}

    </div>
  )
}

export default AdminHomePage
