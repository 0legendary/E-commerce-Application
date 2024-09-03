import React, { useEffect, useState } from 'react';
import './SingleProduct.css';
import axiosInstance from '../../../config/axiosConfig';
import { Link, useParams } from 'react-router-dom';
import ReactImageMagnify from 'react-image-magnify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Reviews from './Reviews';


function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [cartProducts, setCartProducts] = useState([])
  const [isProductInWishlist, setIsProductInWishlist] = useState(false)
  const [reviews, setReviews] = useState([])
  const [relatedProdcts, setRelatedProdcts] = useState([])

  const [offers, setOffers] = useState([])
  useEffect(() => {
    axiosInstance.get(`/user/shop/${id}`)
      .then(response => {
        if (response.data.status) {
          const product = response.data.product;
          const images = product.images.images;
          const mainImage = images.find(image => image.mainImage);
          const additionalImages = images.filter(image => !image.mainImage);
          setMainImage(mainImage);
          setAdditionalImages(additionalImages);
          setReviews(response.data.reviews)
          setRelatedProdcts(response.data.relatedProducts)
          setIsProductInWishlist(response.data.isProductInWishlist)
          setOffers(response.data.offers ? response.data.offers : []);
          setProduct(product);
          setSelectedVariation(product.variations[0]);
          setSelectedColor(product.variations[0].color[0]);
          setCartProducts(response.data.cartProducts ? response.data.cartProducts : [])
        }
      })
      .catch(error => {
        console.error('Error getting data:', error);
      });
  }, [id]);


  const handleSizeClick = (variation) => {
    setSelectedVariation(variation);
    setSelectedColor(variation.color[0]);
  };
  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleImageClick = (clickedImage) => {
    setMainImage(clickedImage);
    const index = additionalImages.findIndex(img => img._id === clickedImage._id);
    const updatedImages = [...additionalImages];
    updatedImages[index] = mainImage;
    setAdditionalImages(updatedImages);
  };




  const handleAddToCart = () => {
    console.log(selectedVariation);
    axiosInstance.post('/user/shop/add-to-cart', {
      productId: product._id,
      price: selectedVariation.price,
      discountedPrice: selectedVariation.discountPrice,
      selectedStock: selectedVariation.stock,
      selectedColor,
      selectedSize: selectedVariation.size,
      categoryId: product.categoryId._id
    })
      .then(response => {
        if (response.data.status) {
          response.data.product && setCartProducts([...cartProducts, response.data.product])
        }
      })
      .catch(error => {
        console.error('Error adding product to cart:', error);
      });
  };


  const isProductInCart = cartProducts.some(cartProduct =>
    cartProduct.selectedColor === selectedColor &&
    cartProduct.selectedSize == selectedVariation?.size
  );


  const addToWishlist = async (productId) => {
    console.log(productId);
    axiosInstance.post('/user/add-to-wishlist', { productId })
      .then(response => {
        if (response.data.status) {
          setIsProductInWishlist(true)
          toast.success("Added to Wishlist", {
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
      .catch(error => {
        console.error('Error sending data:', error);
      });
  };


  return (
    <div className="single-product-container container text-white" style={{ marginTop: '15rem', color: 'white' }}>
      <ToastContainer />
      <div className="product-details">
        {product.name ? (
          <>
            <div className="additional-images">
              {additionalImages.map((image, index) => (
                <img
                  key={index}
                  src={image.cdnUrl}
                  alt={`Additional ${index + 1}`}
                  onClick={() => handleImageClick(image)}
                  className="thumbnail"
                />
              ))}
            </div>

            <div className="product-image">
              {mainImage && (
                <ReactImageMagnify
                  {...{
                    smallImage: {
                      alt: product.name,
                      isFluidWidth: true,
                      src: mainImage.cdnUrl,
                    },
                    largeImage: {
                      src: mainImage.cdnUrl,
                      width: 1200,
                      height: 1200,
                    },
                    enlargedImageContainerDimensions: {
                      width: '100%',
                      height: '100%',
                    },
                  }}
                />
              )}
              <div className='wishlist-icon-container'>
                {isProductInWishlist ? (
                  <Link to='/wishlist'>
                    <i className="bi bi-heart-fill text-danger"></i>
                  </Link>
                ) : (
                  <i className="bi bi-heart text-danger" onClick={() => addToWishlist(product._id)}></i>
                )}
              </div>
              <div className="add-to-cart-btn mt-3 justify-content-end w-100">
                {selectedColor && selectedVariation ? (
                  isProductInCart ? (
                    <Link to='/cart' className='w-100'>
                      <button className="btn btn-secondary me-2 w-100"><i class="bi bi-cart-check"></i> Go to Cart</button>
                    </Link>
                  ) : (
                    <button className="btn border border-success text-white me-2 w-100" onClick={handleAddToCart}><i class="bi bi-cart"></i> Add to Cart</button>
                  )
                ) : (
                  <button className="btn btn-primary w-100" disabled><i class="bi bi-cart"></i> Add to Cart</button>
                )}
                <Link to={`/checkout/${product._id}`} className='w-100'>
                  <button className='btn border border-success text-white me-2 w-100'><i class="bi bi-lightning"></i> Buy Now</button>
                </Link>

              </div>
            </div>

            <div className="product-info">
              <h1>{product.name}</h1>
              <div className="brand">Brand: {product.brand}</div>
              <div className="category">Category: {product.categoryId.name}</div>
              <div className="price">
                ₹{selectedVariation.discountPrice}
                {selectedVariation.price !== selectedVariation.discountPrice && (
                  <span className="discount-price">₹{selectedVariation.price}</span>
                )}
              </div>

              <div className="offer-badges">
                {offers.map((offer) => (
                  <div key={offer._id} className="offer-badge">
                    {offer.discountPercentage
                      ? `${offer.discountPercentage}% OFF`
                      : `Discount: ₹${offer.discountAmount}`}
                    <p>{offer.description}</p>
                  </div>
                ))}
              </div>

              <div className="variation-details">

                <div>Weight: {selectedVariation.weight}g</div>
              </div>

              <div className="sizes mt-5 d-grid justify-content-center">
                <div className="color-options border mb-3 rounded colors-container text-white">
                  {selectedVariation.color.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`btn color-btn m-3 ${selectedColor === color ? 'active text-bg-info' : 'active'}`}
                      style={{ border: `2px ${color} groove` }}
                      onClick={() => handleColorClick(color)}
                    >
                      {color}
                      {selectedColor === color && <i className="bi bi-check"></i>}
                    </button>
                  ))}
                </div>
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
            </div>

          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className='review-information mt-lg-5'>
        {reviews && reviews.length > 0 ? (
          <Reviews reviews={reviews} />
        ) : (
          <div className='m-5'>
            <h3>No reviews or Rating</h3>
          </div>
        )}
      </div>
      <div className='h-50 mt-4'>
        {relatedProdcts && relatedProdcts.length > 0 && <h3 className='font-monospace m-2'>Related Products</h3>}
        <div className="products-grid mt-4" style={{ 'grid-template-columns': 'repeat(4, 1fr)', height: '5px' }}>
          {relatedProdcts.map((product, index) => {
            const inStock = product.variations[0].stock > 0;
            const mainImage = product.images.images.find(img => img.mainImage === true);

            return (
              <div key={index} className="product-card shopping-page-card border border-success">
                <img src={mainImage.cdnUrl} alt={product.name} className="product-image" style={{flex: '0 0 300px'}} />
                <div className="product-details">
                  <span className="product-name text-white"><span>{product.name}</span></span>
                </div>
                <div className='d-flex gap-3 text-white'>
                  <span className="product-current-price text-white"><span>{product.variations[0].price}</span></span>
                  <span className="product-original-price text-white"><span>{product.variations[0].discountPrice}</span></span>
                </div>

                {inStock ? (
                  <div className="product-actions w-100 text-white justify-content-between">
                    <div className='d-flex gap-1'>
                      <Link to={`/shop/${product._id}`}>
                        <div className="product-background">
                          <i className="bi bi-search"></i>
                        </div>
                      </Link>
                    </div>
                    <div>
                      <Link to={`/checkout/${product._id}`}>
                        <button className='btn border border-success text-white'>Buy</button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <h5 className='text-danger'>Out of Stock</h5>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>


  );
}

export default SingleProduct;
