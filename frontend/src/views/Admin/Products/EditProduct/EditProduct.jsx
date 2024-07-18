import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../../config/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addProductformValidation } from '../../../../config/productValidation';
import { convertFileToBase64, uploadImage } from '../../../../config/uploadImage';



function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState([])
  const [newErrors, setNewErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    axiosInstance.get(`/admin/edit/getProduct/${id}`)
      .then(response => {
        if (response.data.status) {
          setProduct(response.data.product)
        }
      })
      .catch(error => {
        // Handle error
        console.error('Error sending data:', error);
      });
  }, [])


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

  const handleRemoveImage = async (index) => {
    const newImages = product.additionalImages.filter((_, i) => i !== index);
    setProduct({ ...product, additionalImages: newImages });
    try {
      const response = await axiosInstance.post('/admin/deleteImage', { _id: product.additionalImages[index]._id, product_id: product._id });
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
    Errors = addProductformValidation(product)
    setNewErrors(Errors)
    if (Object.keys(Errors).length === 0) {

      let mainImageId;

      if (product.mainImage.file) {
        mainImageId = await uploadImage(convertFileToBase64(product.mainImage.file));
      } else {
        mainImageId = product.mainImage[0]._id
      }


      // Convert additionalImages to Base64 and upload
      const additionalImagesBase64 = await Promise.all(
        product.additionalImages.map(async (image) => {
          console.log(image);
          if (image.file) {
            const base64 = await convertFileToBase64(image.file);
            return { ...image, base64 };
          } else {
            return { ...image, _id: image._id, url: image.url };
          }
        })
      );

      const additionalImageIds = await Promise.all(
        additionalImagesBase64.map(async (image) => {
          console.log(image);
          if (image.file) {
            return await uploadImage(image);
          } else {
            return image._id
          }
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

      axiosInstance.put('/admin/updateProduct', updatedProduct)
        .then(response => {
          if (response.data.status) {
            setSuccessMsg('Product Updated')
            setTimeout(() => {
              setSuccessMsg('')
              navigate('/admin/products')
            }, 2000);
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
              <img src={product.mainImage[0].url} alt="Main" className="img-thumbnail" />
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
            {product.additionalImages && product.additionalImages.map((image, index) => (
              <div key={index} className="image-container">
                <img src={image.url} alt={`Additional ${index}`} className="img-thumbnail" />
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveImage(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Update Product</button>
        <Link to='/admin/products'>
          <button className="btn btn-danger m-3">Cancel</button>
        </Link>
      </form>
      {successMsg && <h3 className='text-success m-4'>{successMsg}</h3>}
    </div>
  )
}

export default EditProduct
