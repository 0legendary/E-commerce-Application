import React, { useEffect, useState } from 'react'
import './Address.css'
import NewAddress from './NewAddress'
import EditAddress from './EditAddress'
import axiosInstance from '../../../../config/axiosConfig'

function Address() {
    const [newAddress, setNewAddress] = useState(false)
    const [showEditAddress, setShowEditAddress] = useState(false)
    const [editAddress, setEditAddress] = useState({})
    const [addresses, setAddresses] = useState([])
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    useEffect(() => {
        axiosInstance.get('/user/addresses')
            .then(response => {
                if (response.data.status) {
                    console.log(response.data.addresses);
                    setAddresses(response.data.addresses)
                }
            })
            .catch(error => {
                console.error('Error getting data:', error);
            });
    }, [])


    const handelNewAddress = () => {
        setNewAddress(true)
        setShowEditAddress(false)
    }
    const handelEditAddress = (addressId) => {
        const addressToEdit = addresses.find(address => address._id === addressId);
        setEditAddress(addressToEdit);
        setNewAddress(false)
        setShowEditAddress(true)
    }

    const handelCancleAddress = (address) => {
        setNewAddress(false)
        setShowEditAddress(false)
        if (address && address._id) {
            setAddresses([...addresses, address]);
            address.isPrimary && updatePrimaryAddress(address._id)
        }
    }

    const updatePrimaryAddress = (address_id) => {
        setAddresses(prevAddresses =>
            prevAddresses.map(preAddress =>
                preAddress._id === address_id
                    ? { ...preAddress, isPrimary: true }
                    : { ...preAddress, isPrimary: false }
            )
        );  
    };

    const handelCancleEditAddress = (address) => {
        setNewAddress(false)
        setShowEditAddress(false)
        if (address && address._id) {
            setAddresses(prevAddresses =>
                prevAddresses.map(preAddress =>
                    address._id === preAddress._id ? address : preAddress
                )
            );
            address.isPrimary && updatePrimaryAddress(address._id);
        }
    }

    const handleDelete = async (add_id) => {
        try {
            const response = await axiosInstance.delete(`/user/delete-address/${add_id}`);
            if (response.data.status) {
                setAddresses(prevAddresses => prevAddresses.filter(address => address._id !== add_id));
            }
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const showDeleteConfirmation = (addressId) => {
        setAddressToDelete(addressId);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = () => {
        if (addressToDelete) {
            handleDelete(addressToDelete);
        }
        setShowConfirmModal(false);
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
    };

    return (
        <div className='container text-white'>
            <h2>Address Management</h2>
            {!newAddress && (
                <button className="btn btn-primary my-3 address-card p-3 mb-3 border rounded position-relative" onClick={handelNewAddress}>
                    Add New Address
                </button>
            )}
            {newAddress && (<NewAddress handleCancel={handelCancleAddress} />)}
            {showEditAddress && (<EditAddress address={editAddress} handleCancel={handelCancleEditAddress} />)}
            <div className="address-list mt-4">
                {addresses.map((address) => (
                    address._id ? (
                        <div key={address._id} className={`address-card p-3 mb-3 border rounded position-relative ${address.isPrimary ? 'border-success' : ''
                            }`}>
                            <div className="dropdown position-absolute top-0 end-0 p-2">
                                <button className="btn btn-secondary dropdown-toggle" type="button" id={`dropdownMenuButton-${address._id}`} data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="bi bi-three-dots"></i>
                                </button>
                                <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton-${address._id}`}>
                                    <li className="dropdown-item" onClick={() => handelEditAddress(address._id)}>Edit</li>
                                    <li className="dropdown-item" onClick={() => showDeleteConfirmation(address._id)}>Delete</li>
                                </ul>
                            </div>
                            <div className="address-type mb-2">
                                <strong>{address.addressType}</strong>
                            </div>
                            <div className="address-details">
                                <div className="mb-2">
                                    <strong>{address.name}</strong> - {address.mobile}
                                </div>
                                <div>
                                    {address.address}, {address.city}, {address.state}, {address.pincode}
                                </div>
                            </div>
                        </div>
                    ) : null
                ))}
            </div>
            <div className={`modal text-black fade ${showConfirmModal ? 'show' : ''}`} style={{ display: showConfirmModal ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Confirm Deletion</h5>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this address?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Address
