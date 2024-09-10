import axiosInstance from "./axiosConfig";
import {handleApiResponse} from "../utils/utilsHelper"

const UploadPendingOrder = async (order, checkoutId) => {
    try {
        const apiCall = axiosInstance.post('/user/pendingOrder', { order, checkoutId });
        const response = await handleApiResponse(apiCall);
        
        if (response.success) {
            return response.data.status;
        } else {
            console.error('Failed to upload pending order:', response.message);
            return false;
        }
    } catch (error) {
        console.error('Error uploading pending order:', error);
        throw error;
    }
};

export { UploadPendingOrder }
