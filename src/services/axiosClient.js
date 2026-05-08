import axios from 'axios'

const axiosClient = axios.create({
    baseURL: 'http://localhost:5266/api/v1',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosClient.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message =
            error?.response?.data?.message || error?.message || 'Network Error'

        return Promise.reject(new Error(message))
    },
)

export default axiosClient
