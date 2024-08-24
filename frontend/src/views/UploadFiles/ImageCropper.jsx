import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../../config/cropImage';
import "./imageCropper.css"

function ImageCropper({ croppedImageState, setCroppedImage, ascpectRatio = 1, minWidth = 150, mainImage = false }) {
  const [crop, setCrop] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState([]);
  const [imageSrc, setImageSrc] = useState('');
  const [currentImageSrc, setCurrentImageSrc] = useState('');
  const [showCropper, setShowCropper] = useState(false)
  const imageRef = useRef(null);



  const handleImageChange = (e) => {
    const { files } = e.target;
    const file = files[0];
    if (!file) {
      setImageSrc('');
      setCurrentImageSrc('');
      setShowCropper(false);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setShowCropper(true)
      const imageUrl = reader.result;
      console.log(imageUrl);
      setImageSrc(imageUrl);
      setCurrentImageSrc(imageUrl);
    };
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (minWidth / width) * 100;

    const initialCrop = makeAspectCrop(
      {
        unit: '%',
        width: cropWidthInPercent,
      },
      ascpectRatio,
      width,
      height
    );
    const centeredCrop = centerCrop(initialCrop, width, height);
    setCrop(centeredCrop);
  };

  const handleCropImage = async () => {
    console.log(mainImage);
    if (crop && imageRef.current) {
      try {
        const croppedImage = await getCroppedImg(imageRef.current, crop);
        if (mainImage) {
          const updatedImages = croppedImageState.filter((img) => !img.mainImage);
          setCroppedImage([{ url: croppedImage, mainImage: true }, ...updatedImages]);
        } else {
          const updatedImages = [...croppedImageState, { url: croppedImage, mainImage: false, originalSrc: currentImageSrc }];
          setCroppedImage(updatedImages);
        }
        setShowCropper(false);
      } catch (error) {
        console.error('Error cropping the image:', error);
      }
    }
  };


  const handleRemoveImage = (index) => {
    const updatedImages = croppedImageUrl.filter((_, imgIndex) => imgIndex !== index);
    setCroppedImageUrl(updatedImages);
    setCroppedImage(updatedImages);
  };

  const displayedFiles = croppedImageState.filter((file) => file.mainImage === mainImage);
  return (
    <div className='image-cropper'>
      <div className="form-group">
        <div className='d-flex'>
          <input
            type="file"
            className="form-control d-none"
            id="mainImage"
            name="mainImage"
            onChange={handleImageChange}
          />
        </div>
        <label className="input-group-text btn btn-primary font-monospace mt-2" htmlFor="mainImage">
          <i class="bi bi-patch-plus"></i> Choose Image
        </label>
      </div>
      {showCropper && (
        <div className="overlay">
          <div className="cropper-container">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              keepSelection
              aspect={ascpectRatio}
              minWidth={minWidth}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="upload"
                style={{ maxHeight: '70vh' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <div className="d-flex justify-content-center mt-3">
              <button
                className="btn btn-success me-2"
                type="button"
                onClick={handleCropImage}
              >
                Save
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setShowCropper(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {displayedFiles.length > 0 && (
        <div className="mt-3 d-flex gap-1">
          {displayedFiles.map((image, index) => (
            <div className='d-grid ' key={index}>
              <img
                src={image.url}
                className='rounded rounded-1 shadow-lg'
                alt="Cropped Preview"
                style={{
                  border: '1px solid black',
                  objectFit: 'contain',
                  width: 150,
                  height: 150,
                  marginRight: 2
                }}
              />
              <button onClick={() => handleRemoveImage(index)} className='btn mt-2 btn-danger'>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCropper;
