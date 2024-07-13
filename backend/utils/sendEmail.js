import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

const sendOTPEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP for sign up',
        text:`Your OTP for signing up is: ${otp}`,
    };

    return transporter.sendMail(mailOptions);
};


const generateOTP = ()=> {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export {sendOTPEmail, generateOTP};

