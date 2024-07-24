import React, { useEffect, useState } from 'react';
import './SingleProduct.css';
import axiosInstance from '../../../config/axiosConfig';
import { useParams } from 'react-router-dom';
import ReactImageMagnify from 'react-image-magnify';

function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);


  useEffect(() => {
    axiosInstance.get(`/user/shop/${id}`)
      .then(response => {
        if (response.data.status) {
          console.log(response.data.product);
          setProduct(response.data.product);
          setSelectedVariation(response.data.product.variations[0]);
          setMainImage(response.data.product.mainImage);
          setAdditionalImages(response.data.product.additionalImages);
        }
      })
      .catch(error => {
        console.error('Error getting data:', error);
      });
  }, [id]);

  const handleSizeClick = (variation) => {
    setSelectedVariation(variation);
  };

  const handleImageClick = (clickedImage) => {
    setMainImage(clickedImage);
    const index = additionalImages.findIndex(img => img._id === clickedImage._id);
    const updatedImages = [...additionalImages];
    updatedImages[index] = mainImage;
    setAdditionalImages(updatedImages);
  };

  return (
    <div className="container" style={{ marginTop: '15rem', color: 'white' }}>
      <div className="container">
        {product.name ? (
          <div className="product-details">
            <div className="product-image">
              <div className='main-image'>
              {mainImage && (
                  <ReactImageMagnify
                    {...{
                      smallImage: {
                        alt: product.name,
                        isFluidWidth: true,
                        src: mainImage.image
                      },
                      largeImage: {
                        src: mainImage.image,
                        width: 1200,
                        height: 1800
                      },
                      shouldHideHintAfterFirstActivation: false
                    }}
                  />
                )}
              </div>
              <div className="additional-images">
                {additionalImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.image}
                    alt={`Additional ${index + 1}`}
                    onClick={() => handleImageClick(image)}
                    className="thumbnail"
                  />
                ))}
              </div>
            </div>
            <div className="product-info">
              <h1>{product.name}</h1>
              <p>{product.description}</p>
              <div className="category">Category: {product.categoryId.name}</div>
              <div className="brand">Brand: {product.brand}</div>
              {product.gender && <div className="gender">Gender: {product.gender}</div>}
              {product.season && <div className="season">Season: {product.season}</div>}

              {selectedVariation && (
                <>
                  <div className="price">Price: ₹{selectedVariation.discountPrice}</div>
                  {selectedVariation.price !== selectedVariation.discountPrice && (
                    <div className="discount-price">Original Price: ₹{selectedVariation.price}</div>
                  )}
                  <div className="variation-details">
                    <div>Colors: {selectedVariation.color.join(', ')}</div>
                    <div>Weight: {selectedVariation.weight}g</div>
                    <div>Stock: {selectedVariation.stock}</div>
                  </div>
                </>
              )}

              <div className="sizes mt-3">
                <h3>Available Sizes</h3>
                <div className="btn-group" role="group" aria-label="Sizes">
                  {product.variations.map((variation, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`btn btn-outline-primary ${selectedVariation === variation ? 'active' : ''}`}
                      onClick={() => handleSizeClick(variation)}
                    >
                      Size {variation.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="add-to-cart-btn mt-3">
                <button className="btn btn-primary">Add to Cart</button>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

export default SingleProduct;
