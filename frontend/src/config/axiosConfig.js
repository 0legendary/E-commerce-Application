import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000',
})


axiosInstance.interceptors.request.use(config => {
    const token = sessionStorage.getItem('accessToken')
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
}, error => {
    return Promise.reject(error)
})

axiosInstance.interceptors.response.use(response => {
    //console.log('response',response);
    return response;
}, error => {
    console.log('error',error);
    if (error.response && error.response.status === 401) {
        console.error('Token expired or invalid, redirecting to login');
        sessionStorage.removeItem('accessToken');
        window.location.href = '/authentication';
    }
    return Promise.reject(error);
});

export default axiosInstance;