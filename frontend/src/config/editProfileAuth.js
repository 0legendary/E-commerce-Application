const editProfileAuth = (name, mobile) => {
    let Errors = {}
    if (name.length === 0) Errors.name = 'Name field not be Empty';
    if (mobile?.length > 0) {
        if (mobile.length < 10) Errors.mobile = 'Must contain 10 Digits'
        if (mobile.length > 10) Errors.mobile = '10 digits are allowed'
    }

    return Errors
}


const validatePassword = (password) => {
    const condition = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return condition.test(password);
};


const editPasswordAuth = (currPass, newPass, confirmNewPass) => {
    let Errors = {}
    if (currPass.length === 0) Errors.currPass = 'Current password required';

    if (!newPass) {
        Errors.newPass = 'Password is required.';
    } else if (!validatePassword(newPass)) {
        Errors.newPass = 'Password must be at least 8 characters long and contain at least one letter and one number.';
    }
    if (!confirmNewPass) {
        Errors.confirmNewPass = 'Confirm Password is required.';
    } else if (newPass !== confirmNewPass) {
        Errors.confirmNewPass = 'Passwords do not match.';
    }
    
    return Errors
}



export { editProfileAuth, editPasswordAuth }