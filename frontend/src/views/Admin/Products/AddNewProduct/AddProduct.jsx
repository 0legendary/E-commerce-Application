import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import './addProduct.css';
import { addProductformValidation } from '../../../../config/productValidation';
import axiosInstance from '../../../../config/axiosConfig';
import { convertFileToBase64, uploadImage } from '../../../../config/uploadImage';
import { Link, useNavigate } from 'react-router-dom';
import { getCroppedImg } from '../../../../config/cropImage'; // Custom function to crop the image

function AddProduct() {
  const colors = ['Red', 'Grey', 'White', 'Black'];
  const [newErrors, setNewErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [product, setProduct] = useState({
    name: 'Adidas ULTRA 4DFWD SHOES',
    description: 'RUNNING SHOES DESIGNED TO MOVE YOU FORWARD, MADE IN PART WITH PARLEY OCEAN PLASTIC.',
    categoryId: '669789676290d67ae6e8adf0',
    brand: 'Adidas',
    variations: [{ size: 3, stock: 23, color: ['Red', 'Grey', 'White', 'Black'], price: 1000, discountPrice: 354, weight: 345 }],
    material: 'Rubber outsole',
    mainImage: null,
    additionalImages: [],
    gender: 'unisex',
    season: 'all-seasons',
  });

 

  const [croppedArea, setCroppedArea] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isMainImage, setIsMainImage] = useState(true);

  const navigate = useNavigate();

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


  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImageSrc(reader.result);
      setIsMainImage(name === 'mainImage');
      setShowCropper(true);
    };
  };

  const handleCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedArea);
    if (isMainImage) {
      setProduct({ ...product, mainImage: { file: croppedImage, url: URL.createObjectURL(croppedImage) } });
    } else {
      setProduct({ ...product, additionalImages: [...product.additionalImages, { file: croppedImage, url: URL.createObjectURL(croppedImage) }] });
    }
    setShowCropper(false);
  };

  const handleRemoveImage = (index) => {
    const newImages = product.additionalImages.filter((_, i) => i !== index);
    setProduct({ ...product, additionalImages: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let Errors = {};
    console.log(product);
    Errors = addProductformValidation(product);
    console.log(Errors);
    setNewErrors(Errors);
    if (Object.keys(Errors).length === 0) {
      const mainImageBase64 = await convertFileToBase64(product.mainImage.file);
      const mainImageId = await uploadImage({ base64: mainImageBase64 });

      const additionalImagesBase64 = await Promise.all(
        product.additionalImages.map(async (image) => {
          const base64 = await convertFileToBase64(image.file);
          return { ...image, base64 };
        })
      );


      const additionalImageIds = await Promise.all(
        additionalImagesBase64.map(async (image) => {
          return await uploadImage(image);
        })
      );
      const updatedProduct = {
        ...product,
        mainImage: mainImageId,
        additionalImages: additionalImageIds,
      };
      console.log(updatedProduct);
      
      axiosInstance.post('/admin/addProduct', updatedProduct)
        .then(response => {
          if (response.data.status) {
            setSuccessMsg('Product created Successfully');
            setTimeout(() => {
              setSuccessMsg('');
              navigate('/admin/products');
            }, 1000);
          } else {
            // Handle error
          }
        })
        .catch(error => {
          console.error('Error sending data:', error);
        });
    }
  };

  return (
    <div className="add-product">
      <h1>Add New Product</h1>
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
              {product.variations.map((variation, index) => (
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
                <option value="669df419adbef3e0af203776">Formal</option>
                <option value="669df419adbef3e0af203776">Running</option>
                <option value="669df419adbef3e0af203776">Sports</option>
                <option value="669df419adbef3e0af203776">Sneakers</option>
                <option value="669df419adbef3e0af203776">Boots</option>
                <option value="669df419adbef3e0af203776">Sandals</option>
                <option value="669df419adbef3e0af203776">Flats</option>
                <option value="669df419adbef3e0af203776">Heels</option>
                <option value="669df419adbef3e0af203776">Loafers</option>
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
          <input
            type="file"
            className="form-control-file"
            id="mainImage"
            name="mainImage"
            onChange={handleImageChange}
          />
          {newErrors.mainImage && <div className="error">{newErrors.mainImage}</div>}
          {product.mainImage && (
            <div className="image-preview">
              <img src={product.mainImage.url} alt="Main" className="img-thumbnail" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="additionalImages">Additional Images</label>
          <input
            type="file"
            className="form-control-file"
            id="additionalImages"
            name="additionalImages"
            multiple
            onChange={handleImageChange}
          />
          {newErrors.additionalImages && <div className="error">{newErrors.additionalImages}</div>}
          <div className="additional-images-preview">
            {product.additionalImages.map((image, index) => (
              <div key={index} className="image-container">
                <img src={image.url} alt={`Additional ${index}`} className="img-thumbnail" />
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveImage(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default AddProduct;
