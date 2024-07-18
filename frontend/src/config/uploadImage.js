import axiosInstance from "./axiosConfig";

const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};



const uploadImage = async (image) => {
    try {
        const response = await axiosInstance.post('/admin/uploadImage', { base64: image.base64 });
        return response.data.imageId;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export { uploadImage, convertFileToBase64 }
