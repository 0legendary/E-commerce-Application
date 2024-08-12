import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../../config/axiosConfig';
import { addressValidate } from '../../../../config/addressValidation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditAddress({ address, handleCancel }) {
  const [errors, setErrors] = useState({})
  const [addressData, setAddressData] = useState(address)
  const [states, setStates] = useState([]);

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    let Errors = addressValidate(addressData)
    setErrors(Errors)
    if (Object.keys(Errors).length === 0) {
      axiosInstance.post('/user/edit-address', { address: addressData })
        .then(response => {
          if (response.data.status) {
            handleCancel(response.data.address)
            toast.success("Address edited", {
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: "dark",
          });
          }
        })
    }
  }

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axiosInstance.get('https://cdn-api.co-vin.in/api/v2/admin/location/states');
        setStates(response.data.states);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setAddressData({
      ...addressData,
      [id]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div>
      <ToastContainer/>
      Edit Address
      <form className="address-form p-4 border rounded d-flex w-100 gap-3" onSubmit={handleUpdateAddress}>
        <div className='w-50'>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" className="form-control" id="name" value={addressData.name} onChange={handleInputChange} />
            {errors.name && <p className='text-danger'>{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input type="text" className="form-control" id="mobile" value={addressData.mobile} onChange={handleInputChange} maxLength="10" />
            {errors.mobile && <p className='text-danger'>{errors.mobile}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="address">Address (Area and Street)</label>
            <input type="text" className="form-control" id="address" value={addressData.address} onChange={handleInputChange} />
            {errors.address && <p className='text-danger'>{errors.address}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <select className="form-control" id="state" value={addressData.state} onChange={handleInputChange} >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.state_id} value={state.state_name}>
                  {state.state_name}
                </option>
              ))}
            </select>
            {errors.state && <p className='text-danger'>{errors.state}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="altPhone">Alternate Phone Number</label>
            <input type="text" className="form-control" id="altPhone" value={addressData.altPhone} onChange={handleInputChange} />
            {errors.altPhone && <p className='text-danger'>{errors.altPhone}</p>}
          </div>

          <button type="submit" className="btn btn-success mr-2">Save</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleCancel()}>Cancel</button>
        </div>
        <div className='w-50'>
          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input type="text" className="form-control" id="pincode" value={addressData.pincode} onChange={handleInputChange} />
            {errors.pincode && <p className='text-danger'>{errors.pincode}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="locality">Locality</label>
            <input type="text" className="form-control" id="locality" value={addressData.locality} onChange={handleInputChange} />
            {errors.locality && <p className='text-danger'>{errors.locality}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="city">City/District/Town</label>
            <input type="text" className="form-control" id="city" value={addressData.city} onChange={handleInputChange} />
            {errors.city && <p className='text-danger'>{errors.city}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="landmark">Landmark</label>
            <input type="text" className="form-control" id="landmark" value={addressData.landmark} onChange={handleInputChange} />
            {errors.landmark && <p className='text-danger'>{errors.landmark}</p>}
          </div>

          <div className="form-group d-flex">
            <div className="form-check mt-4">
              <input className="form-check-input" type="radio" name="addressType" id="addressType" value="home" checked={addressData.addressType === 'home'} onChange={handleInputChange} />
              <label className="form-check-label" htmlFor="home">
                Home
              </label>
            </div>
            <div className="form-check m-4">
              <input className="form-check-input" type="radio" name="addressType" id="addressType" value="work" checked={addressData.addressType === 'work'} onChange={handleInputChange} />
              <label className="form-check-label" htmlFor="work">
                Work
              </label>
            </div>

            <div className="form-group form-check m-4">
              <input type="checkbox" className="form-check-input" id="isPrimary" checked={addressData.isPrimary} onChange={handleInputChange} />
              <label className="form-check-label" htmlFor="isPrimary">Make this address primary</label>
            </div>

          </div>
        </div>
      </form>
    </div>
  )
}

export default EditAddress
