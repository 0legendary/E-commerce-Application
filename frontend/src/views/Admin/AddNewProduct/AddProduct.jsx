import React, { useState } from 'react';
import './addProduct.css';
import { addProductformValidation } from '../../../config/productValidation';
import axiosInstance from '../../../config/axiosConfig'
import { convertFileToBase64, uploadImage } from '../../../config/uploadImage';
import { Link } from 'react-router-dom';

function AddProduct() {
  const [newErrors, setNewErrors] = useState({})
  const [product, setProduct] = useState({
    name: 'Adidas ULTRA 4DFWD SHOES',
    description: 'RUNNING SHOES DESIGNED TO MOVE YOU FORWARD, MADE IN PART WITH PARLEY OCEAN PLASTIC.',
    category: 'Sports',
    brand: 'Adidas',
    price: 22999.00,
    discountPrice: 13799.00,
    stock: 40,
    sizeOptions: ['3.5,4.5,7.7,8.5,9,10'],
    colorOptions: ['Red,Grey,White,Black'],
    material: 'Rubber outsole',
    mainImage: null,
    additionalImages: [],
    weight: '394',
    gender: 'Unisex',
    season: 'All Seasons',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    setNewErrors({ ...newErrors, [name]: '' });
    console.log(product);
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    console.log(files);
    if (name === 'mainImage') {
      setProduct({ ...product, mainImage: { file: files[0], url: URL.createObjectURL(files[0]) } });
    } else if (name === 'additionalImages') {
      const additionalImages = Array.from(files).map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      setProduct({ ...product, additionalImages: [...product.additionalImages, ...additionalImages] });
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = product.additionalImages.filter((_, i) => i !== index);
    setProduct({ ...product, additionalImages: newImages });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    let Errors = {};
    console.log(product);
    Errors = addProductformValidation(product)
    setNewErrors(Errors)
    if (Object.keys(Errors).length === 0) {
      const mainImageBase64 = await convertFileToBase64(product.mainImage.file);
      const mainImageId = await uploadImage({ base64: mainImageBase64 });

      // Convert additionalImages to Base64 and upload
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
      const sizeOptionsArray = product.sizeOptions[0].split(',');
      const colorOptionsArray = product.colorOptions[0].split(',');

      const updatedProduct = {
        ...product,
        sizeOptions: sizeOptionsArray,
        colorOptions: colorOptionsArray,
        mainImage: mainImageId,
        additionalImages: additionalImageIds,
      };

      console.log(updatedProduct);

      axiosInstance.post('/admin/addProduct', updatedProduct)
        .then(response => {
          if (response.data.status) {
            // Handle success
          } else {
            // Handle error
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
      <h1>Add New Product</h1>
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
              <label htmlFor="price">Price</label>
              <input
                type="number"
                className="form-control"
                id="price"
                name="price"
                value={product.price}
                onChange={handleInputChange}
              />
              {newErrors.price && <div className="error">{newErrors.price}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="discountPrice">Discount Price</label>
              <input
                type="number"
                className="form-control"
                id="discountPrice"
                name="discountPrice"
                value={product.discountPrice}
                onChange={handleInputChange}

              />
              {newErrors.discountPrice && <div className="error">{erronewErrorsrs.discountPrice}</div>}
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
              <label htmlFor="stock">Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                id="stock"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
              />
              {newErrors.stock && <div className="error">{newErrors.stock}</div>}

            </div>
            <div className="form-group">
              <label htmlFor="sizeOptions">Size Options (comma separated)</label>
              <input
                type="text"
                className="form-control"
                id="sizeOptions"
                name="sizeOptions"
                value={product.sizeOptions}
                onChange={handleInputChange}
              />
              {newErrors.sizeOptions && <div className="error">{newErrors.sizeOptions}</div>}

            </div>
            <div className="form-group">
              <label htmlFor="colorOptions">Color Options (comma separated)</label>
              <input
                type="text"
                className="form-control"
                id="colorOptions"
                name="colorOptions"
                value={product.colorOptions}
                onChange={handleInputChange}
              />
              {newErrors.colorOptions && <div className="error">{newErrors.colorOptions}</div>}

            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                className="form-control"
                id="category"
                name="category"
                value={product.category}
                onChange={handleInputChange}
              >
                <option value="">Select Catergory</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sports">Sports</option>
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
              <label htmlFor="weight">Weight</label>
              <input
                type="number"
                className="form-control"
                id="weight"
                name="weight"
                value={product.weight}
                onChange={handleInputChange}
              />
              {newErrors.weight && <div className="error">{newErrors.weight}</div>}
            </div>
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
    </div>
  );
}

export default AddProduct;
