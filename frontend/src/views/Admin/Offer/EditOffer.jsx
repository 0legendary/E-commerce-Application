import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { offerValidate } from '../../../config/offerValidation';
import axiosInstance from '../../../config/axiosConfig';
import UploadFIles from '../../UploadFiles/UploadFIles';

function EditOffer({ completeEditOffer, offer, products, categories }) {
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState(offer);
  const [files, setFiles] = useState(offer.imageID ? offer.imageID.images : []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const editedData = { ...formData, images: files }
    let validate = offerValidate(editedData)
    setErrors(validate)
    if (Object.keys(validate).length === 0) {
      axiosInstance.post('/admin/edit-offer', { editedData, imageID: offer?.imageID?._id })
        .then(response => {
          if (response.data.status) {
            const createdOffer = {
              ...editedData,
              imageID: {
                images: files, // Ensure that 'images' is the array of files
                _id: offer?.imageID?._id // Use the existing imageID._id if available
              }
            }; 
            completeEditOffer(createdOffer)
          } else {
            console.log('something went wrong while editing');
          }
        })
        .catch(error => {
          console.error('Error sending data:', error);
        });
    }
  };



  const handleTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      type: e.target.value,
      applicableTo: []
    }));

  };

  const handleItemClick = (productId) => {
    setFormData(prevState => {
      const isSelected = prevState.applicableTo.includes(productId);
      return {
        ...prevState,
        applicableTo: isSelected
          ? prevState.applicableTo.filter(id => id !== productId)
          : [...prevState.applicableTo, productId]
      };
    });
    setErrors(prev => ({
      ...prev,
      'applicableTo': ''
    }))
  };


  return (
    <div className="container mt-4">
      <h2>Create New Offer</h2>
      <Form onSubmit={handleSubmit}>
        <div className='w-100 d-flex gap-2'>
          <div className='w-50'>
            <Form.Group controlId="formType">
              <Form.Label>Offer Type</Form.Label>
              <Form.Control as="select" name="type" value={formData.type} onChange={handleTypeChange}>
                <option value="">Select Type</option>
                <option value="product">Product</option>
                <option value="category">Category</option>
                <option value="referral">Referral</option>
              </Form.Control>
              {errors.type && <p className='text-danger pt-2'>{errors.type}</p>}
            </Form.Group>
            <Form.Group className='w-100 mt-3' controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} />
              {errors.description && <p className='text-danger pt-2'>{errors.description}</p>}
            </Form.Group>
            <Form.Group className='mt-4' controlId="formImage">
              <UploadFIles setFiles={setFiles} files={files} />
              {errors.images && <p className='text-danger pt-2'>{errors.images}</p>}
            </Form.Group>
            {formData.type === 'referral' && (
              <>
                <Form.Group controlId="formReferralCode" className='mt-3'>
                  <Form.Label>Referral Code</Form.Label>
                  <Form.Control type="text" name="referralCode" value={formData.referralCode} onChange={handleChange} />
                  {errors.referralCode && <p className='text-danger pt-2'>{errors.referralCode}</p>}
                </Form.Group>
              </>
            )}
          </div>

          <div className='w-50'>
            <div className='w-100 d-flex gap-2'>
              <Form.Group className='w-50' controlId="formStartDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                {errors.startDate && <p className='text-danger pt-2'>{errors.startDate}</p>}
              </Form.Group>

              <Form.Group className='w-50' controlId="formEndDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                {errors.endDate && <p className='text-danger pt-2'>{errors.endDate}</p>}
              </Form.Group>
            </div>
            <div className='w-100 d-flex gap-2 mt-3'>
              <Form.Group className='w-50' controlId="formDiscountPercentage">
                <Form.Label>Discount Percentage</Form.Label>
                <Form.Control type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} />
                {errors.discountPercentage && <p className='text-danger pt-2'>{errors.discountPercentage}</p>}
              </Form.Group>
              <Form.Group className='w-50' controlId="formDiscountAmount">
                <Form.Label>Discount Amount</Form.Label>
                <Form.Control type="number" name="discountAmount" value={formData.discountAmount} onChange={handleChange} />
                {errors.discountAmount && <p className='text-danger pt-2'>{errors.discountAmount}</p>}
              </Form.Group>

            </div>
            {formData.type === 'referral' && (
              <>
                <Form.Group controlId="formRewardPerReferral" className='mt-3'>
                  <Form.Label>Reward Per Referral</Form.Label>
                  <Form.Control type="number" name="rewardPerReferral" value={formData.rewardPerReferral} onChange={handleChange} />
                  {errors.rewardPerReferral && <p className='text-danger pt-2'>{errors.rewardPerReferral}</p>}
                </Form.Group>
              </>
            )}
          </div>
        </div>

        {formData.type === 'product' && (
          <Form.Group controlId="formApplicableTo" className='mt-5 mb-5'>
            <Form.Label>Applicable Products</Form.Label>
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {products.map(product => {
                const mainImage = product.images.images.filter((img) => img.mainImage)
                return (
                  <div
                    key={product._id}
                    style={{
                      width: '200px',
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      margin: '10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: formData.applicableTo.includes(product._id) ? '2px solid green' : '2px solid transparent',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}

                    onClick={() => handleItemClick(product._id)}
                  >
                    <img
                      src={mainImage[0].cdnUrl}
                      alt={product._id}
                      style={{ width: '100px', borderRadius: '8px' }}
                      className='mt-2'
                    />
                    <p style={{
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: '0',
                      padding: '5px 0',
                      width: '90%'
                    }}>
                      {product.name}
                    </p>
                  </div>
                )
              })}
              {errors.applicableTo && <p className='text-danger pt-2'>{errors.applicableTo}</p>}
            </div>
          </Form.Group>
        )}

        {formData.type === 'category' && (
          <Form.Group controlId="formApplicableTo" className='mt-5 mb-5'>
            <Form.Label>Applicable Categories</Form.Label>
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {categories.map(category => (
                <div
                  key={category._id}
                  style={{
                    width: '200px',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    margin: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: formData.applicableTo.includes(category._id) ? '2px solid green' : '2px solid transparent',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}

                  onClick={() => handleItemClick(category._id)}
                >
                  <p style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: '0',
                    padding: '5px 0',
                    width: '90%'
                  }}>
                    {category.name}
                  </p>

                </div>
              ))}
              {errors.applicableTo && <p className='text-danger pt-2'>{errors.applicableTo}</p>}
            </div>
          </Form.Group>
        )}
        <Button variant="primary" type="submit" className='me-3 mt-4'>
          Update
        </Button>
        <Button variant="secondary" onClick={completeEditOffer} className="ml-2 mt-4">
          Cancel
        </Button>
      </Form>
    </div>
  )
}

export default EditOffer
