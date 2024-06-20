import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import '../Admin/adminDesign.css'


function TrashedUsers({invokeTrash}) {
    const [trashedUsers, setTrashedUsers] = useState([])
    const [errors, setErrors] = useState({})

    useEffect(() => {
        axiosInstance.get('/admin/trashed-users')
            .then((response) => {
                setTrashedUsers(response.data)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [])

    const handleRestore = (userID) => {
        axiosInstance.post('/admin/delete-users-trash', {data: userID} )
            .then((response) => {
                if (response.data.status) {
                    setErrors({})
                    const data = trashedUsers.filter((user) => user._id === userID);
                    invokeTrash(data)
                    setTrashedUsers((prevUsers) => prevUsers.filter(userList => userList._id !== userID));
                } else {
                    setErrors({ [userID]: 'Something went wrong while updating' })
                }
            }).catch(() => setErrors({ [userID]: 'Server Issues, try later...' }))
    }

    const handleDelete = (userID) => {
        axiosInstance.post('/admin/delete-trashed-user', {data: userID} )
            .then((response) => {
                if (response.data.status) {
                    setErrors({})
                    setTrashedUsers((prevUsers) => prevUsers.filter(userList => userList._id !== userID));
                } else {
                    setErrors({ [userID]: 'Something went wrong while deleting' })
                }
            }).catch(() => setErrors({ [userID]: 'Server Issues, try later...' }))
    }


    return (
        <div >
            {trashedUsers.length > 0 ? (
                <table className="table ">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">No.</th>
                            <th scope="col">User Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Created At</th>
                            <th className='text-center' scope="col" colSpan='2'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trashedUsers.map((user, index) => (
                            < >
                                <tr key={user._id}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.createdAt}</td>
                                    <td><button className='btn btn-success' onClick={() => handleRestore(user._id)}>Restore</button></td>
                                    <td className='d-flex justify-content-end'><button className='btn btn-danger ' onClick={() => handleDelete(user._id)}>Delete</button></td>
                                </tr>
                                {errors[user._id] && (
                                    <tr>
                                        
                                        <td colSpan='5'>
                                            {errors[user._id] && <p className='text-danger bg-white d-flex justify-content-center pr-3 text-uppercase'>{errors[user._id]}</p>}
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className='pt-5 text-white'>
                    <h3>No Data</h3>
                </div>
            )}
        </div>
    )
}

export default TrashedUsers
