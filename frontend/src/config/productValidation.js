
const addProductformValidation = (product) => {
  console.log(product);
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
  console.log(product);
  if (!product.season) {
    newErrors.season = 'Season is required.';
  }

  if (!product.mainImage) newErrors.mainImage = 'Image is required.'

  if (product.additionalImages.length === 0) {
    newErrors.additionalImages = 'Additional image is needed'
  } else if (product.additionalImages.length < 3) {
    newErrors.additionalImages = 'Minimum 3 images is needed'
  }


  if (product.variations.length === 0) {
    newErrors.variations = 'At least one variation is required.';
  } else {
    product.variations.forEach((variation, index) => {
      if (!variation.size) {
        newErrors[`variations[${index}].size`] = 'Size is required.';
      }
      if (!variation.stock || isNaN(variation.stock)) {
        newErrors[`variations[${index}].stock`] = 'Valid stock is required.';
      }
      if (!variation.price || isNaN(variation.price)) {
        newErrors[`variations[${index}].price`] = 'Valid price is required.';
      }
      if (!variation.discountPrice || isNaN(variation.discountPrice)) {
        newErrors[`variations[${index}].discountPrice`] = 'Valid discount price is required.';
      }
      if (!variation.weight || isNaN(variation.weight)) {
        newErrors[`variations[${index}].weight`] = 'Valid weight is required.';
      }
      if (!variation.color || variation.color.length === 0) {
        newErrors[`variations[${index}].color`] = 'At least one color is required.';
      }
    });
  }
  return newErrors;
};


export { addProductformValidation }