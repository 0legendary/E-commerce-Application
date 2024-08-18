import axiosInstance from "./axiosConfig";


const UploadPendingOrder = async (order,checkoutId) => {
    try {
        console.log('Pending route', order, checkoutId);
        const response = await axiosInstance.post('/user/pendingOrder', { order, checkoutId });
        console.log(response.data);
        return response.data.status
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export { UploadPendingOrder }
