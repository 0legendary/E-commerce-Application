
const offerValidate = (offer) => {
    console.log(offer);
    let errors = {}
    if (!offer.type) errors.type = 'Offer type is required';
    if (!offer.description) errors.description = 'Description is required';
    if (!offer.imageID) errors.imageID = 'Image is required';
    if (!offer.discountPercentage && !offer.discountAmount) {
        errors.discountPercentage = 'Required'
        errors.discountAmount = 'Required'
    }
    if(offer.type !== 'referral' && offer.applicableTo.length === 0) errors.applicableTo = 'Select atleast one'
    if (offer.discountPercentage && (isNaN(offer.discountPercentage) || offer.discountPercentage <= 0 || offer.discountPercentage > 100))
        errors.discountPercentage = 'Discount percentage must be a number between 0 and 100';
    if (offer.discountAmount && (isNaN(offer.discountAmount) || offer.discountAmount < 0))
        errors.discountAmount = 'Discount amount must be a positive number';
    if (!offer.startDate) errors.startDate = 'Start date is required';
    if (!offer.endDate) errors.endDate = 'End date is required';
    if (offer.endDate < offer.startDate) errors.endDate = 'End date cannot be before start date';
    if (offer.type === 'referral' && !offer.referralCode) errors.referralCode = 'Referral code is required';
    if (offer.type === 'referral' && (isNaN(offer.rewardPerReferral) || offer.rewardPerReferral <= 0))
        errors.rewardPerReferral = 'Reward per referral must be a positive number';

    return errors
}

export { offerValidate }