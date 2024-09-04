import axiosInstance from "./axiosConfig";


const UploadPendingOrder = async (order,checkoutId) => {
    try {
        const response = await axiosInstance.post('/user/pendingOrder', { order, checkoutId });
        return response.data.status
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export { UploadPendingOrder }
