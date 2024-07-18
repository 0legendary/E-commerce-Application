export const getCroppedImg = (imageSrc, pixelCrop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    const image = new Image();
    image.src = imageSrc;
  
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
  
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
  
        ctx.drawImage(
          image,
          pixelCrop.x * scaleX,
          pixelCrop.y * scaleY,
          pixelCrop.width * scaleX,
          pixelCrop.height * scaleY,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
  
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const file = new File([blob], 'croppedImage.jpeg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg');
      };
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  };
  