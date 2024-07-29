
const addressValidate = (address) => {
    let Errors = {};

    if (!address.name) {
        Errors.name = 'Name is required';
    }
    if (address.mobile.length > 0) {
        if (address.mobile.length < 10) Errors.mobile = 'Must contain 10 Digits'
        if (address.mobile.length > 10) Errors.mobile = '10 digits are allowed'
    }
    if (address.mobile.length === 0) {
        Errors.mobile = 'Mobile is required'
    }

    if(address.altPhone.length > 0){
        if (address.altPhone.length < 10) Errors.altPhone = 'Must contain 10 Digits'
        if (address.altPhone.length > 10) Errors.altPhone = '10 digits are allowed'
    }

    if (address.pincode.length > 6) Errors.pincode = 'Pincode not be greater than 6 digits'
    if (address.pincode.length < 6) Errors.pincode = 'Pincode not be less than 6 digits'

    if (!address.locality) Errors.locality = 'Locality is required'
    if (!address.address) Errors.address = 'Address is required'
    if (!address.city) Errors.city = 'City is required'
    if (!address.state) Errors.state = 'State is required'
    if (!address.addressType) Errors.addressType = 'Address Type is required'
    if (!address.landmark) Errors.landmark = 'Landmark is required'

    return Errors
}

export { addressValidate }