const couponValidate = (formData, existingCoupons) => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    // Validate Coupon Code
    if (!formData.code.trim()) {
        errors.code = 'Coupon code is required.';
    } else if (/\s/.test(formData.code)) {
        errors.code = 'Coupon code cannot contain whitespace.';
    }else if(existingCoupons.some(coupon => coupon.code === formData.code)){
        errors.code = 'Coupon code already exists';
    }
    
    // Validate Description
    if (!formData.description) {
        errors.description = 'Description is required.';
    } else if (formData.description.length > 150) {
        errors.description = 'Description is too long';
    }

    // Validate Discount Value
    if (!formData.discountValue) {
        errors.discountValue = 'Discount value is required.';
    } else if (formData.discountValue <= 1) {
        errors.discountValue = 'Discount value must be greater than 1.';
    }

    // Validate Minimum Order Amount
    if (!formData.minOrderAmount) {
        errors.minOrderAmount = 'Minimum order amount is required.';
    } else if (formData.minOrderAmount <= 0) {
        errors.minOrderAmount = 'Minimum order amount must be a positive integer.';
    }

    // Validate Maximum Discount
    if (!formData.maxDiscount) {
        errors.maxDiscount = 'Maximum discount is required.';
    } else if (formData.maxDiscount <= 0) {
        errors.maxDiscount = 'Maximum discount must be a positive integer.';
    }

    // Validate Valid From Date
    if (!formData.validFrom) {
        errors.validFrom = 'Valid from date is required.';
    } else if (formData.validFrom < today) {
        errors.validFrom = 'Valid from date cannot be before today.';
    }

    // Validate Valid Until Date
    if (!formData.validUntil) {
        errors.validUntil = 'Valid until date is required.';
    } else if (formData.validUntil <= formData.validFrom) {
        errors.validUntil = 'Valid until date must be after valid from date.';
    }

    // Validate Usage Limit
    if (!formData.usageLimit) {
        errors.usageLimit = 'Usage limit is required.';
    } else if (formData.usageLimit <= 0 || !Number.isInteger(Number(formData.usageLimit))) {
        errors.usageLimit = 'Usage limit must be a positive integer.';
    }

    return errors;
};

export { couponValidate };
