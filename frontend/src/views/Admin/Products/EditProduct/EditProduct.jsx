import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../../config/axiosConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addProductformValidation } from '../../../../config/productValidation';
import ImageCropper from '../../../UploadFiles/ImageCropper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deleteFile, UploadcareSimpleAuthSchema } from '@uploadcare/rest-client';
import { uploadDirect } from '@uploadcare/upload-client';
import { handleApiResponse } from '../../../../utils/utilsHelper'
import LoadingSpinner from '../../../Loading/LoadingSpinner';


function EditProduct() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [allColors, setAllColors] = useState([]);
  const [filteredColors, setFilteredColors] = useState([]);
  const [product, setProduct] = useState({ variations: [] })
  const [newErrors, setNewErrors] = useState({})
  const [isLoadingAction, setIsLoadingAction] = useState(false)


  const [filesID, setFilesID] = useState(null)
  const [isMainImage, setIsMainImage] = useState(false);
  const [saveImage, setSaveImage] = useState(false)
  const [deletedImagesId, setDeletedImagesId] = useState([])
  const [croppedImage, setCroppedImage] = useState([])
  const [currentPage, setCurrentPage] = useState(0);

  const [categories, setCategories] = useState([]);

  const navigate = useNavigate()




  useEffect(() => {
    const fetchProduct = async () => {
      const apiCall = axiosInstance.get(`/admin/edit/getProduct/${id}`);
      const { success, data, message } = await handleApiResponse(apiCall);

      if (success) {
        const { product} = data;
        const { images } = product || {};

        setProduct(product);
        setCroppedImage(images?.images);
        setFilesID(images?._id);
      } else {
        console.error('Error fetching product:', message);
      }
    };

    fetchProduct();
  }, [id]);


  const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
    publicKey: process.env.REACT_APP_UPLOADCARE_PUBLIC_KEY,
    secretKey: process.env.REACT_APP_UPLOADCARE_SECRET_KEY,
  });


  useEffect(() => {
    const fetchCategories = async () => {
      const apiCall = axiosInstance.get('/admin/getAllCategories');

      const { success, data, message } = await handleApiResponse(apiCall);
      if (success) {
        setCategories(data.categories);
      } else {
        console.error(message);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const commonColors = [
      'red', 'green', 'blue', 'black', 'white', 'gray', 'yellow', 'purple',
      'pink', 'orange', 'brown', 'teal', 'olive', 'maroon', 'navy', 'lime'
    ];
    setAllColors(commonColors);
    setFilteredColors(commonColors); // Initialize with all colors
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    setNewErrors({ ...newErrors, [name]: '' });
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

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term === '') {
      setFilteredColors(allColors); // Reset to all colors if search term is empty
    } else {
      // Filter colors based on search term
      const filtered = allColors.filter(color => color.toLowerCase().includes(term.toLowerCase()));
      setFilteredColors(filtered);
    }
  };

  const handleColorChange = (index, e) => {
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
    setCurrentPage(product.variations.length)
  };

  const removeVariation = (index) => {
    const newVariations = product.variations.filter((_, i) => i !== index);
    setProduct({ ...product, variations: newVariations });
    if (currentPage >= newVariations.length) {
      setCurrentPage(Math.max(0, newVariations.length - 1));
    }
  };


  const handleRemoveImage = async (index) => {
    const imageToDelete = croppedImage[index];
    const updatedImages = croppedImage.filter((_, imgIndex) => imgIndex !== index);

    if (imageToDelete && imageToDelete.uuid) {
      setDeletedImagesId([...deletedImagesId, imageToDelete]);
    }

    setCroppedImage(updatedImages);
  };

  const deleteImageFromCloud = async (images) => {
    if (images && images.length > 0) {
      try {
        const deletePromises = images.map(image => {
          if (image.uuid) {
            return deleteFile(
              { uuid: image.uuid },
              { authSchema: uploadcareSimpleAuthSchema }
            );
          }
          return null;
        });

        const responses = await Promise.all(deletePromises);

        responses.forEach(response => {
          if (response.datetimeRemoved) {
            toast.error("Image removed", {
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          } else {
            toast.error("Failed to delete image", {
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
        });
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };


  const handleUpdateProduct = async (updatedProductData, filesID) => {
    const apiCall = axiosInstance.put('/admin/updateProduct', { updatedProductData, filesID });

    const { success, message } = await handleApiResponse(apiCall);

    if (success) {
      setIsLoadingAction(false);
      toast.success(message || "Product updated", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } else {
      setIsLoadingAction(false);
      console.error('Error:', message);
      toast.error(message || "Error updating product", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleSubmit = async (e) => {
    setIsLoadingAction(true);
    const uniqueImageUrls = new Set();
    const uniqueCroppedImages = croppedImage.filter((image) => {
      if (!uniqueImageUrls.has(image.url || image.cdnUrl)) {
        uniqueImageUrls.add(image.url || image.cdnUrl);
        return true;
      }
      return false;
    });

    const fetchImageAsBlob = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    };

    const convertImagesToFiles = async () => {
      if (uniqueCroppedImages) {
        const filesPromises = uniqueCroppedImages.map(async (image, index) => {
          if (image.url) {
            const blob = await fetchImageAsBlob(image.url);
            return new File([blob], `image${index}.jpg`, { type: blob.type });
          }
          return undefined;
        });
        return (await Promise.all(filesPromises)).filter(file => file !== undefined);
      }
      return [];
    };

    // Upload images to Uploadcare
    const uploadImagesToUploadcare = async (files) => {
      if (files && files.length > 0) {
        const uploadPromises = files.map((file, index) => {
          if (!file.uuid) {
            return uploadDirect(file, {
              publicKey: process.env.REACT_APP_UPLOADCARE_PUBLIC_KEY,
              store: 'auto',
            }).then(result => ({
              uuid: result.uuid,
              name: file.name,
              size: file.size,
              mimeType: file.type,
              cdnUrl: result.cdnUrl,
              mainImage: uniqueCroppedImages[index].mainImage,
            }));
          }
          return null;
        });
        return Promise.all(uploadPromises).then(results => results.filter(result => result !== null));
      }
      return [];
    };

    e.preventDefault();
    let Errors = {};
    Errors = addProductformValidation(product, uniqueCroppedImages);
    if (Errors.mainImage) setIsMainImage(true);
    if (Errors.files) setSaveImage(true);
    setNewErrors(Errors);

    if (Object.keys(Errors).length === 0) {
      await deleteImageFromCloud(deletedImagesId);
      const files = await convertImagesToFiles();
      if (files.length > 0) {
        const uploadResults = await uploadImagesToUploadcare(files);
        const uploadedNewImages = uploadResults.filter(image => image);

        const allImages = [
          ...uniqueCroppedImages.filter(image => image.uuid),
          ...uploadedNewImages,
        ];

        const updatedProduct = {
          ...product,
          images: allImages,
        };

        handleUpdateProduct(updatedProduct, filesID)
      } else {
        const allImages = [...uniqueCroppedImages.filter(image => image.uuid)];

        const updatedProduct = {
          ...product,
          images: allImages,
        };

        handleUpdateProduct(updatedProduct, filesID)
      }
    }
  };
  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, product.variations.length - 1));
  };
  return (

    <div className="add-product">
      <ToastContainer />
      <LoadingSpinner isLoadingAction={isLoadingAction} />
      <h1>Edit Product</h1>
      <form className="form" onSubmit={handleSubmit}>
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
              <label htmlFor="category">Category</label>
              <select
                className="form-control"
                id="categoryId"
                name="categoryId"
                value={product.categoryId}
                onChange={handleInputChange}
              >

                <option value="">Select Category</option>
                {categories?.length > 0 && categories.map((category, index) => (
                  !category.isBlocked && <option key={index} value={category._id}>{category.name}</option>
                ))}
              </select>
              {newErrors.category && <div className="error">{newErrors.category}</div>}
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
          </div>
        </div>
        <div className="form-group align-items-center justify-content-center">
          <label htmlFor="variations">Variations</label>
          <div className="d-flex">
            {product.variations.length > 0 && (
              <div className="variation w-100 d-flex border gap-3 border-secondary">
                <div className="w-50 m-2">
                  <div className="form-group">
                    <label htmlFor="size">Size</label>
                    <input
                      type="number"
                      name="size"
                      className="form-control"
                      value={product.variations[currentPage].size}
                      onChange={(e) => handleVariationChange(currentPage, e)}
                      placeholder="Size"
                    />
                    {newErrors[`variations[${currentPage}].size`] && (
                      <div className="error">{newErrors[`variations[${currentPage}].size`]}</div>
                    )}
                  </div>
                  <div>
                    <div className="form-group">
                      <label htmlFor="search">Search Color</label>
                      <input
                        type="text"
                        id="search"
                        className="form-control"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search color..."
                      />
                    </div>

                    <div className="form-group">
                      <div className='d-flex  overflow-x-scroll'>
                        {filteredColors.map((color) => (
                          <div key={color} className='d-flex me-2 p-2 border border-4'>
                            <input
                              type="checkbox"
                              name="color"
                              value={color}
                              checked={product.variations[currentPage].color.includes(color)}
                              onChange={(e) => handleColorChange(currentPage, e)}
                            />
                            <label className='mx-2'>{color.charAt(0).toUpperCase() + color.slice(1)}</label>
                          </div>
                        ))}
                      </div>
                      {newErrors[`variations[${currentPage}].color`] && (
                        <div className="error">{newErrors[`variations[${currentPage}].color`]}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                      className="form-control"
                      type="number"
                      name="price"
                      value={product.variations[currentPage].price}
                      onChange={(e) => handleVariationChange(currentPage, e)}
                      placeholder="Price"
                    />
                    {newErrors[`variations[${currentPage}].price`] && (
                      <div className="error">{newErrors[`variations[${currentPage}].price`]}</div>
                    )}
                  </div>
                </div>
                <div className="w-50 m-2">
                  <div className="form-group">
                    <label htmlFor="stock">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      className="form-control"
                      value={product.variations[currentPage].stock}
                      onChange={(e) => handleVariationChange(currentPage, e)}
                      placeholder="Stock"
                    />
                    {newErrors[`variations[${currentPage}].stock`] && (
                      <div className="error">{newErrors[`variations[${currentPage}].stock`]}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight">Weight</label>
                    <input
                      className="form-control"
                      type="number"
                      name="weight"
                      value={product.variations[currentPage].weight}
                      onChange={(e) => handleVariationChange(currentPage, e)}
                      placeholder="Weight"
                    />
                    {newErrors[`variations[${currentPage}].weight`] && (
                      <div className="error">{newErrors[`variations[${currentPage}].weight`]}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="discountPrice">Discount Price</label>
                    <input
                      className="form-control"
                      type="number"
                      name="discountPrice"
                      value={product.variations[currentPage].discountPrice}
                      onChange={(e) => handleVariationChange(currentPage, e)}
                      placeholder="Discount Price"
                    />
                    {newErrors[`variations[${currentPage}].discountPrice`] && (
                      <div className="error">{newErrors[`variations[${currentPage}].discountPrice`]}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-remove"
                    onClick={() => removeVariation(currentPage)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className='d-flex justify-content-between'>
            <button type="button" className="btn btn-success mt-2" onClick={addVariation}>
              Add Variation
            </button>
            <div className="pagination-controls mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
              >
                Previous
              </button>
              <span className="mx-2">
                {currentPage + 1} of {product.variations.length}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={goToNextPage}
                disabled={currentPage >= product.variations.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {isMainImage && (
          <div className="form-group">
            <label htmlFor="additionalImages">Main Image</label>
            <div>
              <ImageCropper croppedImageState={croppedImage} setCroppedImage={setCroppedImage} setNewErrors={setNewErrors} newErrors={newErrors} mainImage={true} />
            </div>
            {croppedImage.some(image => image.mainImage) && (
              <button className='btn btn-success' onClick={() => { setSaveImage(true); setIsMainImage(false) }}>Save</button>
            )}
          </div>
        )}
        {newErrors.mainImage && <div className="error">{newErrors.mainImage}</div>}
        {saveImage && (
          <div className="form-group">
            <label htmlFor="additionalImages">Additional Images</label>
            <div>
              <ImageCropper croppedImageState={croppedImage} setCroppedImage={setCroppedImage} setNewErrors={setNewErrors} newErrors={newErrors} mainImage={false} />
            </div>
            {croppedImage.filter(image => !image.mainImage).length >= 3 && (
              <button className='btn btn-success' onClick={() => { setSaveImage(false); setIsMainImage(false); }}>
                Save
              </button>
            )}
          </div>
        )}
        {newErrors.files && <div className="error">{newErrors.files}</div>}



        {croppedImage.length > 0 && !saveImage && !isMainImage && (
          <div className="mt-3 d-flex gap-1">
            {croppedImage.map((image, index) => (
              <div className="d-grid" key={index}>
                <img
                  src={image.cdnUrl || image.url}
                  className={`rounded rounded-1 shadow-lg border border-2 ${image.mainImage ? 'border-success' : 'border-primary'}`}
                  alt="Cropped Preview"
                  style={{
                    border: '1px solid black',
                    objectFit: 'contain',
                    width: 150,
                    height: 150,
                    marginRight: 2
                  }}
                />
                <div className='d-flex justify-content-between'>
                  <button onClick={() => handleRemoveImage(index)} type='button' className='h-50 btn btn-danger mt-2 d-flex align-items-center justify-content-center'>Remove<pre> </pre> <i className="bi bi-trash3-fill"></i></button>
                  <button onClick={() => { image.mainImage ? setIsMainImage(true) : setSaveImage(true) }} className='h-50 btn-group btn-group-sm mt-2 btn-primary d-flex align-items-center justify-content-center'><i className="bi bi-pencil-square"></i></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn btn-primary">Update Product</button>
        <Link to='/admin/products'>
          <button className="btn btn-danger m-3">Cancel</button>
        </Link>
      </form>
    </div>
  )
}
export default EditProduct
