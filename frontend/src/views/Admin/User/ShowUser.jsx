import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../config/axiosConfig'
import './ShowUser.css'

function ShowUser() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const defaultImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACUCAMAAAAEVFNMAAAAP1BMVEX///+ZmZmVlZWSkpKcnJz8/Py1tbX5+fn29vbz8/O9vb2vr6+kpKTExMSPj4+fn5/h4eHq6urQ0NDX19fKysr/NFKOAAAGTklEQVR4nO1c2XKrOhC0NlYBEvD/33rBOU7AFtAaBvCtoisPeUikrmE0u/R43Lhx48aNGzdufA9y77q2bfsRbds5n1/NaBmp65PSNlrIF4TQjS2TyqVXc3tHmruiqWslXtDiD1LVdVO4/GtYG98mYkI2CFWLpPXmaq4D0jax48ffhpQ2aUcxmwt555XG2L4462o4hVcRNj5RG5oQ4KySqzTDFyKa7gglCncB3azQEbowF7LUxdlCTltBpfvDWQzH70TSviQpwxR16U+ja1qyNkyFrFtzjpCzkoHuk3KZncHXyd3q8MtYHm7hjGm52P7gcLUomNThBVkcStckbOrwgkoOlHFeKr1NIZZxmR/FmM08zHGcsbCH8B0Y20PoHiTfEao8IBtJC/bz9gdZ8DOuYuT7+lv4iMqKl615tDW8txTa2rK0dsyf0f+qW17GHt1ZibJy+dNMmdxVpUYVSbEG9TloIKQq3MxGZa5Q4L9avpKLMaBDVuVnMGP8YF22dXlQH7YsBFXgIcANLwBmJ3XHRPiRQ3ooG7fkYl2DfSEupUiQ7Ua+izEBxlixRG7m0UHiaVZPuWuQNQSLUmAWYssqOUStZMmhFC2y1fbXhDy7ZHAfGeRem03R5FCmrfdHmhVi0rYlM9hGSLN2xxQZsIsQiO6B3nKvFveQSYPkUiB894ZtuUV20VDg4pClxM6QooM2aaDw20C2eDgOO2KKFHJyosRWg3IsmdANhQHDYLQYAiYt9KqmeVRQ2KNAj9pBQd8uy4blZGhciBEWDZ2vx3aowezGgcvRdQLM7JklvKM+iMWEQoEhCxRGDSAXgjy2PiwStFSrqTqBeQ0B22HIa4odQSZcvNaQO81BDSMrcUT1Dzp18AcTxPqrRz8hWFLAuw2WpsRYdPVEA+zgI4r3tLIVli0/AYjYFHi7QdKy5z6iICw3RewiyrWqp4SYJqaCvV31j+k3KFKZLY1qEWztUdQRKiyTlMA4g43ED/qVPUyPVDD/YCl2DStITBkv1daGFD9yKVJ5Io/cZIi8l2Qc38+hZKJYkXXGuAzaT8I0iDqHsJBN9bHTOCgWvZCiuDoC4dG8FbO9fAXWsq8iPFCudTEOtebed4Wuad3TbT/ER3gwX0qNnSOpwP5RAGdKmAVnHTrxNzosJ0PEZxGO2UqPKiDG6eYPlNaKaOWgEM7QjGbEcNSSvvOhoeYs965NdBTnhuSasVhCP+na7sU17O3SvLURFoMUS4CVy3HWIIEOdZ6g85pDtEYgbLBK4JBtQAnNKHkHyoAWD4P9Lt1FSCPtID9NyzignC66/AzVDog5HZI199FTcqbfXhXrmXxguy6BVrLn6DZVjViX2DQTNL6jrq0vLKlTYdWGIMi992593orcq+vk6rKLOdw21tuVxDM39rNXVlUJcdUnVrUNK4aGsHbqsGbiElZTcvoo5lqxateYmVmzmYPboCJf7KLsntlamSyrd3SbF3WCaNonWJ4C2jOcuxROcEyuL4kY7UkFsVSEJqUwb1jSN3IPacSCpkmwbbSOcAGWFgv/ItxIQXu1G2uHRbxvdi0rA99MiIxjrjM4TkSOI14IzUIxzaGakLvbPblmQlJgmqYO2qDdsghpGtMwdcDb7R7JNY/003kQ4+sPBDIES2luvOEjteMZ6XyMN4U+luYYb/1IPHZaypWVBc/K76rGd6Ps3S3tj1B+8D4vehTh/ZOi/2Dm6x4mYcl2S20+b8dJePasA+O94VnSeBBhSU80PjErMB1EmPeK2jRQOYawzngvWs7GHQKdDBKmS7I/iMB8n/kdzLfT8ElXGuRiX30PjmPM5jEmGB9i4b41/sv3qNvjB91jJXY0EKAXAaPAd/EvBOi6SwQ0r4MLMeZ4vGPKmN2evcPR3soJQ3JFwMswj4zvir605zxEU/G82SD1Ie4iAOMsg1rUduUSKTdS9Hr1snjV+H7AqU8T7XtK6cRnif4h7eh6oWx3xYNgeavhJxGmqJv2spcP+yZWMaRoDncVq+iipnmkTi5RhilS15fYY1BKlb0z1z3AN+Hsq6Zel7Os66byX/OQ5ICsK2wzSPF9smDMNXVji5hBm7NgvGur8W3RgaV6/jwn76rWPZ/JuF4Tgkiz3HvvfjD89j3viYbxpWK8cePGjRs3/jf4D/wKSKbK2IjTAAAAAElFTkSuQmCC'
  useEffect(() => {
    axiosInstance.get('/admin/getAllUsers')
      .then(response => {
        if (response.data.status) {
          //console.log(response.data.users);
          setUsers(response.data.users)
          setFilteredUsers(response.data.users);
        }
      })
      .catch(error => {
        console.error('Error sending data:', error);
      });
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to the first page when searching
  }, [searchTerm, users]);


  const handleBlockToggle = (id, isBlocked) => {
    axiosInstance.post('/admin/toggleBlockUser', { id, isBlocked: !isBlocked })
      .then(response => {
        if (response.data.status) {
          setUsers(prevUsers => prevUsers.map(user =>
            user._id === id ? { ...user, isBlocked: !isBlocked } : user
          ));
        }
      })
      .catch(error => {
        console.error('Error updating user status:', error);
      });
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = pageNumber => setCurrentPage(pageNumber);


  return (
    <div className="container text-white">
      <h2 className="mt-5">User List</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <table className="table table-striped mt-3">
        <thead>
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
      <nav>
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
    </div>
  )
}

export default ShowUser
