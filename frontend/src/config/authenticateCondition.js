const validateEmail = (email) => {
    const condition = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return condition.test(email);
};

const validatePassword = (password) => {
    const condition = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return condition.test(password);
};

const loginAuthenticate = (email, password) => {
    let newErrors = {};
    if (!email) {
        newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format.';
    }
    if (!password) {
        newErrors.password = 'Password is required.';
    }
    return newErrors
}


const signUpAuthenticate = (username, email, password, confirmPassword) => {
    let newErrors = {};
    if (!username) {
        newErrors.username = 'Username is required.';
    } else if (username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters long.';
    }

    if (!email) {
        newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format.';
    }

    if (!password) {
        newErrors.password = 'Password is required.';
    } else if (!validatePassword(password)) {
        newErrors.password = 'Password must be at least 8 characters long and contain at least one letter and one number.';
    }

    if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
    }
    return newErrors

}

const updateUserAuthenticate = async (username, email, password, confirmPassword, changes) => {
    let newErrors = {};
    if (changes.username === username &&
        changes.email === email &&
        changes.newPassword === password &&
        changes.confirmPassword === confirmPassword
    ) {
        newErrors.changes = 'Need to change something to save'
    }
    if (!username) {
        newErrors.username = 'Username is required.';
    } else if (username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters long.';
    }

    if (!email) {
        newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format.';
    }

    if (password !== '') {
        if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters long and contain at least one letter and one number.';
        }
        else if (password !== confirmPassword) {
            newErrors.notMatching = 'Passwords do not match'
        }
    }

    if(confirmPassword !== ''){
        if (password === '') {
            newErrors.notFilledPassword = 'New password is required'
        }
    }
    return newErrors
}


const signUpGoogleAuthenticate = (password, confirmPassword) => {
    
    let newErrors = {};

    if (!password) {
        newErrors.password = 'Password is required.';
    } else if (!validatePassword(password)) {
        newErrors.password = 'Password must be at least 8 characters long and contain at least one letter and one number.';
    }

    if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors
}



const otpVerification = (otp) => {
    let newErrors = {};

    if (!otp) {
        newErrors.otp = 'OTP is required.';
    }
    if (otp.length < 6) {
        newErrors.otp = 'OTP must be at least 6 number long';
    }

    return newErrors
}


const formatDate = (dateString) => {
    const date = new Date(dateString);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${hours}:${minutes} ${ampm}`;
    return `${month} - ${day} ⏱️${formattedTime}`;
  }

export { loginAuthenticate, signUpAuthenticate, updateUserAuthenticate, formatDate, signUpGoogleAuthenticate, otpVerification }