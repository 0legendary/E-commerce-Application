import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../config/axiosConfig'
import './ShowUser.css'
import { handleApiResponse } from '../../../utils/utilsHelper';
import { Card } from 'react-bootstrap';

function ShowUser() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const defaultImg = 'https://e7.pngegg.com/pngimages/507/702/png-clipart-profile-icon-simple-user-icon-icons-logos-emojis-users-thumbnail.png'
  useEffect(() => {
    const fetchUsers = async () => {
      const apiCall = axiosInstance.get('/admin/getAllUsers');

      const { success, data, message } = await handleApiResponse(apiCall);

      if (success) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error(message);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);


  const handleBlockToggle = async (id, isBlocked) => {
    const apiCall = axiosInstance.post('/admin/toggleBlockUser', { id, isBlocked: !isBlocked });

    const { success, message } = await handleApiResponse(apiCall);

    if (success) {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, isBlocked: !isBlocked } : user
        )
      );
    } else {
      console.error(message);
    }
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = pageNumber => setCurrentPage(pageNumber);


  return (
    <div className="users-list m-5">
      <h2 className="mb-5 text-uppercase">User List</h2>

      <Card className='p-3'>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <table className="table table-striped table-hover table-bordered mt-3">
          <thead >
            <tr>
              <th>Img</th>
              <th>Name</th>
              <th>Email</th>
              <th>Google User</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <img src={user.profileImg || defaultImg} alt="User" className="user-img rounded" style={{ width: '50px', height: '50px' }} />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isGoogleUser ? 'Yes' : 'No'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn ${user.isBlocked ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredUsers.length > itemsPerPage && (
          <nav className='d-flex justify-content-end'>
            <ul className="pagination">
              {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Card>

    </div>
  )
}

export default ShowUser
