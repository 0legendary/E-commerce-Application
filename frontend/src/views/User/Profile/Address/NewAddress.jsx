import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../../config/axiosConfig';
import { addressValidate } from '../../../../config/addressValidation';

function NewAddress({ handleCancel }) {
    const [states, setStates] = useState([]);
    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        name: 'Alen.m',
        mobile: '9961689333',
        pincode: '673301',
        locality: 'Kinfra Kakancheri',
        address: 'Kinfra industrial park',
        city: 'Chelambra',
        state: 'Kerala',
        landmark: 'Kinfra Industrial park',
        altPhone: '',
        addressType: 'home',
        isPrimary: false
    });


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
        setFormData({
            ...formData,
            [id]: type === 'checkbox' ? checked : value
        });
    };


    const saveAddress = async (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        let Errors = addressValidate(formData)
        setErrors(Errors)
        if (Object.keys(Errors).length == 0) {
            axiosInstance.post('/user/add-address', { address: formData })
                .then(response => {
                    if (response.data.status) {
                        handleCancel('Address Created')
                    }
                })
        }
    };


    return (
        <div>
            <form className="address-form p-4 border rounded d-flex w-100 gap-3" onSubmit={saveAddress}>
                <div className='w-50'>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" className="form-control" id="name" value={formData.name} onChange={handleInputChange} />
                        {errors.name && <p className='text-danger'>{errors.name}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="mobile">Mobile Number</label>
                        <input type="text" className="form-control" id="mobile" value={formData.mobile} onChange={handleInputChange} maxLength="10" />
                        {errors.mobile && <p className='text-danger'>{errors.mobile}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address (Area and Street)</label>
                        <input type="text" className="form-control" id="address" value={formData.address} onChange={handleInputChange} />
                        {errors.address && <p className='text-danger'>{errors.address}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="state">State</label>
                        <select className="form-control" id="state" value={formData.state} onChange={handleInputChange} >
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
                        <input type="text" className="form-control" id="altPhone" value={formData.altPhone} onChange={handleInputChange} />
                        {errors.altPhone && <p className='text-danger'>{errors.altPhone}</p>}
                    </div>

                    <button type="submit" className="btn btn-success mr-2">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                </div>
                <div className='w-50'>
                    <div className="form-group">
                        <label htmlFor="pincode">Pincode</label>
                        <input type="text" className="form-control" id="pincode" value={formData.pincode} onChange={handleInputChange} />
                        {errors.pincode && <p className='text-danger'>{errors.pincode}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="locality">Locality</label>
                        <input type="text" className="form-control" id="locality" value={formData.locality} onChange={handleInputChange} />
                        {errors.locality && <p className='text-danger'>{errors.locality}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City/District/Town</label>
                        <input type="text" className="form-control" id="city" value={formData.city} onChange={handleInputChange} />
                        {errors.city && <p className='text-danger'>{errors.city}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="landmark">Landmark</label>
                        <input type="text" className="form-control" id="landmark" value={formData.landmark} onChange={handleInputChange} />
                        {errors.landmark && <p className='text-danger'>{errors.landmark}</p>}
                    </div>

                    <div className="form-group d-flex">
                        <div className="form-check mt-4">
                            <input className="form-check-input" type="radio" name="addressType" id="addressType" value="home" checked={formData.addressType === 'home'} onChange={handleInputChange} />
                            <label className="form-check-label" htmlFor="home">
                                Home
                            </label>
                        </div>
                        <div className="form-check m-4">
                            <input className="form-check-input" type="radio" name="addressType" id="addressType" value="work" checked={formData.addressType === 'work'} onChange={handleInputChange} />
                            <label className="form-check-label" htmlFor="work">
                                Work
                            </label>
                        </div>

                        <div className="form-group form-check m-4">
                            <input type="checkbox" className="form-check-input" id="isPrimary" checked={formData.isPrimary} onChange={handleInputChange} />
                            <label className="form-check-label" htmlFor="isPrimary">Make this address primary</label>
                        </div>

                    </div>

                </div>
            </form>
        </div>
    )
}

export default NewAddress
