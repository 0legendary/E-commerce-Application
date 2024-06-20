import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000',
})


axiosInstance.interceptors.request.use(config => {
    const token = sessionStorage.getItem('accessToken')
    if(!token && config.url !== '/login' && config.url !== '/login'){
        window.location.href = '/authentication'
    }
    if(!token && config.url === '/authentication'){
        console.log('hello');
        axiosInstance.post('/verify-login')
        .then((res) => {
            console.log(res);
        })
        .catch((err)=> {
            console.log(err);
        })
    }
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config
}, error => {
    return Promise.reject(error)
})

axiosInstance.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        console.error('Token expired or invalid, redirecting to login');
        sessionStorage.removeItem('accessToken');
        window.location.href = '/authentication';
    }
    return Promise.reject(error);
});

export default axiosInstance;