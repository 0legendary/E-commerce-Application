
const addProductformValidation = (product, files) => {
  const mainImage = files.filter((file) => file.mainImage)
  const additionalImages = files.filter((file) => !file.mainImage)
  let newErrors = {};

  // Name validation
  if (!product.name) {
    newErrors.name = 'Name is required.';
  } else if (product.name.length < 2) {
    newErrors.name = 'Name must be at least 2 characters long.';
  }

  // Description validation
  if (!product.description) {
    newErrors.description = 'Description is required.';
  } else if (product.description.length < 10) {
    newErrors.description = 'Description must be at least 40 characters long.';
  }

  if (!product.categoryId) {
    newErrors.category = 'Category is required.';
  }

  // Brand validation
  if (!product.brand) {
    newErrors.brand = 'Brand is required.';
  }

  // Material validation
  if (!product.material) {
    newErrors.material = 'Material is required.';
  }

  // Gender validation
  if (!product.gender) {
    newErrors.gender = 'Gender is required.';
  }
  if (!product.season) {
    newErrors.season = 'Season is required.';
  }
  if(mainImage.length === 0) newErrors.mainImage = 'Main image is required'
  if(additionalImages.length < 3) newErrors.files = 'Minimum 3 Addition Images is required'


  if (product.variations.length === 0) {
    newErrors.variations = 'At least one variation is required.';
  } else {
    product.variations.forEach((variation, index) => {
      if (!variation.size) {
        newErrors[`variations[${index}].size`] = 'Size is required.';
      }else if(isNaN(variation.size) ){
        newErrors[`variations[${index}].size`] = 'Only number is allowed'
      }else if(variation.size <= 0){
        newErrors[`variations[${index}].size`] = 'Positive number only'
      }else if(variation.size >= 13){
        newErrors[`variations[${index}].size`] = 'Enter valid shoes size'
      }

      if (!variation.stock || isNaN(variation.stock)) {
        newErrors[`variations[${index}].stock`] = 'Valid stock is required.';
      }else if(variation.stock < 0){
        newErrors[`variations[${index}].stock`] = 'Positive number only'
      }

      if (!variation.price || isNaN(variation.price)) {
        newErrors[`variations[${index}].price`] = 'Valid price is required.';
      }else if(parseFloat(variation.price) <= 0){
        newErrors[`variations[${index}].price`] = 'Positive number only'
      }

      if (!variation.discountPrice || isNaN(variation.discountPrice)) {
        newErrors[`variations[${index}].discountPrice`] = 'Valid discount price is required.';
      }else if(parseFloat(variation.discountPrice) <= 0){
        newErrors[`variations[${index}].discountPrice`] = 'Positive number only'
      }else if(parseFloat(variation.discountPrice) > parseFloat(variation.price)){
        newErrors[`variations[${index}].discountPrice`] = 'Must be less than Regular price'
      }

      

      if (!variation.weight || isNaN(variation.weight)) {
        newErrors[`variations[${index}].weight`] = 'Valid weight is required.';
      }else if(variation.weight < 0){
        newErrors[`variations[${index}].weight`] = 'Positive number only'
      }

      if (!variation.color || variation.color.length === 0) {
        newErrors[`variations[${index}].color`] = 'At least one color is required.';
      }else if(variation.color < 0){
        newErrors[`variations[${index}].color`] = 'Positive number only'
      }

      
      
    });
  }
  return newErrors;
};


export { addProductformValidation }