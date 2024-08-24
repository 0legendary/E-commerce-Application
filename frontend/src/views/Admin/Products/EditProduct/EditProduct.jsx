import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../../config/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addProductformValidation } from '../../../../config/productValidation';
import { getCroppedImg } from '../../../../config/cropImage'; // Custom function to crop the image
import Cropper from 'react-easy-crop';
import UploadFIles from '../../../UploadFiles/UploadFIles';


function EditProduct() {
  const { id } = useParams();
  const colors = ['Red', 'Grey', 'White', 'Black'];
  const [product, setProduct] = useState({ variations: []})
  const [newErrors, setNewErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')


  const [croppedArea, setCroppedArea] = useState(null);
  const [files, setFiles] = useState([]);
  const [filesID, setFilesID] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isMainImage, setIsMainImage] = useState(true);
  const [deleteImagesId, setDeleteImagesId] = useState('')
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate()

  useEffect(() => {
    axiosInstance.get(`/admin/edit/getProduct/${id}`)
      .then(response => {
        if (response.data.status) {
          setProduct(response.data.product)
          console.log(response.data.product);
          setFiles(response.data.product?.images?.images)
          setFilesID(response.data.product?.images?._id)
        }
      })
      .catch(error => {
        // Handle error
        console.error('Error sending data:', error);
      });
  }, [])

  useEffect(() => {
    axiosInstance.get('/admin/getAllCategories')
      .then(response => {
        if (response.data.status) {
          setCategories(response.data.categories);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    setNewErrors({ ...newErrors, [name]: '' });
    console.log(product);
  };


  const handleVariationChange = (index, e) => {
    const { name, value } = e.target;
    const newVariations = [...product.variations];
    newVariations[index][name] = value;
    setProduct({ ...product, variations: newVariations });


    const variationErrorKey = `variations[${index}].${name}`;
    const updatedErrors = { ...newErrors };
    delete updatedErrors[variationErrorKey];
    setNewErrors(updatedErrors);
  };

  const handleColorChange = (index, e) => {
    console.log(index);
    const { value, checked } = e.target;
    const newVariations = [...product.variations];
    if (checked) {
      newVariations[index].color.push(value);
    } else {
      newVariations[index].color = newVariations[index].color.filter(color => color !== value);
    }
    setProduct({ ...product, variations: newVariations });

    const variationErrorKey = `variations[${index}].color`;
    const updatedErrors = { ...newErrors };
    delete updatedErrors[variationErrorKey];
    setNewErrors(updatedErrors);
  };


  const addVariation = () => {
    setProduct({
      ...product,
      variations: [...product.variations, { size: 0, stock: 0, color: [], price: 0, discountPrice: 0, weight: 0 }]
    });
  };

  const removeVariation = (index) => {
    const newVariations = product.variations.filter((_, i) => i !== index);
    setProduct({ ...product, variations: newVariations });
  };

  const handleImageChange = (e, imageId) => {
    console.log(imageId);
    imageId && setDeleteImagesId(imageId)
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      const fileURL = URL.createObjectURL(file);
      setImageSrc(fileURL);
      setShowCropper(true);

      if (name === 'mainImage') {
        setIsMainImage(true);
      } else if (name === 'additionalImages') {
        setIsMainImage(false);
      }
    }
  };


  const handleCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };


  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedArea);
    if (isMainImage) {

      setProduct({ ...product, mainImage: [{ file: croppedImage, url: URL.createObjectURL(croppedImage) }] });
    } else {
      setProduct({ ...product, additionalImages: [...product.additionalImages, { file: croppedImage, url: URL.createObjectURL(croppedImage) }] });
    }
    setShowCropper(false);
  };


  const handleRemoveImage = async (index) => {
    const newImages = product.additionalImages.filter((_, i) => i !== index);
    setProduct({ ...product, additionalImages: newImages });
    try {
      const response = await axiosInstance.post('/admin/deleteImage', { _id: product.additionalImages[index]._id, product_id: product._id, isMain: false });
      if (response.data.status) {
        console.log('image deleted');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    let Errors = {};
    console.log(product);
    Errors = addProductformValidation(product, files)
    setNewErrors(Errors)
    if (Object.keys(Errors).length === 0) {

      
      const updatedProduct = {
        ...product,
        images: files,
      };
      console.log(updatedProduct);

      axiosInstance.put('/admin/updateProduct', {updatedProductData: updatedProduct,filesID})
        .then(response => {
          if (response.data.status) {
            setSuccessMsg('Product Updated')
            navigate('/admin/products')
            // setTimeout(() => {
            //   setSuccessMsg('')
            //   navigate('/admin/products')
            // }, 2000);
          }
        })
        .catch(error => {
          // Handle error
          console.error('Error sending data:', error);
        });
    }
  };



  return (

    <div className="add-product">
      <h1>Edit Product</h1>
      {successMsg && <h3 className='text-success m-4'>{successMsg}</h3>}
      <form onSubmit={handleSubmit} className="form">
        <div className='d-flex w-100 gap-3'>
          <div className='w-50'>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={product.name}
                onChange={handleInputChange}
              />
              {newErrors.name && <div className="error">{newErrors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                className="form-control"
                id="brand"
                name="brand"
                value={product.brand}
                onChange={handleInputChange}
              />
              {newErrors.brand && <div className="error">{newErrors.brand}</div>}
            </div>
          </div>
          <div className='w-50'>
            <div className="form-group">
              <label htmlFor="variations">Variations</label>
              {product && product.variations.map((variation, index) => (
                <div key={index} className="variation w-100 d-flex border gap-3 border-secondary">
                  <div className='w-50 m-2'>
                    <div className='form-group '>
                      <label htmlFor="size">Size</label>
                      <input
                        type="number"
                        name="size"
                        className="form-control"
                        value={variation.size}
                        onChange={(e) => handleVariationChange(index, e)}
                        placeholder="Size"
                      />
                      {newErrors[`variations[${index}].size`] && <div className="error">{newErrors[`variations[${index}].size`]}</div>}
                    </div>
                    <div className='form-group'>
                      <label htmlFor="size">Color</label>
                      <div>
                        {colors.map(color => (
                          <div key={color}>
                            <input
                              type="checkbox"
                              name="color"
                              value={color}
                              checked={variation.color.includes(color)}
                              onChange={(e) => handleColorChange(index, e)}
                            />
                            <label>{color}</label>
                          </div>
                        ))}
                      </div>
                      {newErrors[`variations[${index}].color`] && <div className="error">{newErrors[`variations[${index}].color`]}</div>}
                    </div>
                    <div className='form-group'>
                      <label htmlFor="price">Price</label>
                      <input
                        className="form-control"
                        type="number"
                        name="price"
                        value={variation.price}
                        onChange={(e) => handleVariationChange(index, e)}
                        placeholder="Price"
                      />
                      {newErrors[`variations[${index}].price`] && <div className="error">{newErrors[`variations[${index}].price`]}</div>}
                    </div>
                  </div>
                  <div className='w-50  m-2'>
                    <div className='form-group'>
                      <label htmlFor="stock">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        className="form-control"
                        value={variation.stock}
                        onChange={(e) => handleVariationChange(index, e)}
                        placeholder="Stock"
                      />
                      {newErrors[`variations[${index}].stock`] && <div className="error">{newErrors[`variations[${index}].stock`]}</div>}
                    </div>
                    <div className='form-group'>
                      <label htmlFor="weight">Weight</label>
                      <input
                        className="form-control"
                        type="number"
                        name="weight"
                        value={variation.weight}
                        onChange={(e) => handleVariationChange(index, e)}
                        placeholder="Weight"
                      />
                      {newErrors[`variations[${index}].weight`] && <div className="error">{newErrors[`variations[${index}].weight`]}</div>}
                    </div>
                    <div className='form-group'>
                      <label htmlFor="discountePrice">Discount Price</label>
                      <input
                        className="form-control"
                        type="number"
                        name="discountPrice"
                        value={variation.discountPrice}
                        onChange={(e) => handleVariationChange(index, e)}
                        placeholder="Discount Price"
                      />
                      {newErrors[`variations[${index}].discountPrice`] && <div className="error">{newErrors[`variations[${index}].discountPrice`]}</div>}
                    </div>
                    <button type="button" className='btn btn-danger btn-remove' onClick={() => removeVariation(index)}>Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" className='btn btn-success mt-2' onClick={addVariation}>Add Variation</button>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                className="form-control"
                id="categoryId"
                name="categoryId"
                value={product.categoryId}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                {categories.length > 0 && categories.map((category, index) => (
                  !category.isBlocked && <option key={index} value={category._id}>{category.name}</option>
                ))}
              </select>
              {newErrors.category && <div className="error">{newErrors.category}</div>}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={product.description}
            onChange={handleInputChange}
          ></textarea>
          {newErrors.description && <div className="error">{newErrors.description}</div>}
        </div>
        <div className='d-flex w-100 gap-3'>
          <div className='w-50'>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                className="form-control"
                id="gender"
                name="gender"
                value={product.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
              {newErrors.gender && <div className="error">{newErrors.gender}</div>}
            </div>
          </div>
          <div className='w-50'>
            <div className="form-group">
              <label htmlFor="season">Season</label>
              <select
                className="form-control"
                id="season"
                name="season"
                value={product.season}
                onChange={handleInputChange}
              >
                <option value="">Select Season</option>
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
                <option value="all-seasons">All Seasons</option>
              </select>
              {newErrors.season && <div className="error">{newErrors.season}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="material">Material</label>
              <input
                type="text"
                className="form-control"
                id="material"
                name="material"
                value={product.material}
                onChange={handleInputChange}
              />
              {newErrors.material && <div className="error">{newErrors.material}</div>}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="mainImage">Main Image</label>
          <div className="form-group mb-4">
            <UploadFIles setFiles={setFiles} files={files} mainImage={true}/>
          </div>
          {newErrors.files && <div className="error">{newErrors.files}</div>}
        </div>

        <div className="form-group mb-4">
            <label>Alternative images</label>
            <UploadFIles setFiles={setFiles} files={files}/>
          </div>
          {newErrors.files && <div className="error">{newErrors.files}</div>}
        <button type="submit" className="btn btn-primary">Add Product</button>
        <Link to='/admin/products'>
          <button className="btn btn-danger m-3">Cancel</button>
        </Link>
      </form>

      {showCropper && (
        <div
          className="cropper-modal"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCropSave();
            } else if (e.key === 'Backspace') {
              setShowCropper(false);
            }
          }}
          tabIndex={0}
        >
          <div className="cropper-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
            <button className="btn btn-success" onClick={handleCropSave}>Save</button>
            <button className="btn btn-danger" onClick={() => setShowCropper(false)}>Cancel</button>
          </div>{successMsg && <h3 className='text-success m-4'>{successMsg}</h3>}

        </div>
      )}
    </div>
  )
}
export default EditProduct
