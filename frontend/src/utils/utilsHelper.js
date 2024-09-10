
export const handleApiResponse = async (apiCall) => {
    try {
      const response = await apiCall;
      // Checking the standardized response structure from the backend
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Something went wrong!',
        };
      }
    } catch (error) {
      // Handle any Axios errors or network issues
      return {
        success: false,
        message: error.response?.data?.message || 'Error in fetching data!',
        error,
      };
    }
  };