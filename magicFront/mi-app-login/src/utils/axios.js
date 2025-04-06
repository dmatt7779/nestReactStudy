
import axios from 'axios';

class AxiosClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptores
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (response.config.method?.toUpperCase() === 'OPTIONS') {
          return null;
        }
        return response.data;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login' // o usa react-router para la redirección
        }
        if (!error.response) {
          return Promise.reject("Error contact administrator.");
        }
        return Promise.reject(error.response?.data || error)
      }
    )
  }

  async register(userData) {
    try {
      const response = await this.axiosInstance.post('api/v1/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(userData) {
    try {
      const response = await this.axiosInstance.post('api/v1/auth/login', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(url, config = {}) {
    try {
      const response = await this.axiosInstance.get(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  }


  async postProjectInfo(url, body) {
    try {
      const response = await this.axiosInstance.post(url, body);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Método genérico para cualquier verbo HTTP
  async request(method, url, data = null, config = {}) {
    try {
      const response = await this.axiosInstance.request({
        method,
        url,
        data,
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const axiosClient = new AxiosClient();
export default axiosClient;