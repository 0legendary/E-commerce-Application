import React, { useState } from 'react'
import './Address.css'
import NewAddress from './NewAddress'
import EditAddress from './EditAddress'

function Address() {
    const [newAddress, setNewAddress] = useState(false)
    const [showEditAddress, setShowEditAddress] = useState(false)

    const handelNewAddress = () => {
        setNewAddress(true)
        setShowEditAddress(false)
    }
    const handelEditAddress = () => {
        setNewAddress(false)
        setShowEditAddress(true)
    }

    const handelCancleAddress = () => {
        setNewAddress(false)
        setShowEditAddress(false)
    }


    return (
        <div className='container text-white'>
            <h2>Address Management</h2>
            <button className="btn btn-primary my-3" onClick={handelNewAddress}>
                Add New Address
            </button>
            <button className="btn btn-primary my-3" onClick={handelEditAddress}>
                Edit
            </button>

            {newAddress && (<NewAddress handleCancel={handelCancleAddress}/>)}
            {showEditAddress && (<EditAddress handleCancel={handelCancleAddress}/>)}
            Address managment
        </div>
    )
}

export default Address
