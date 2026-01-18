import axios from 'axios';

class AxiosClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.pythonInstance = axios.create({
      baseURL: process.env.REACT_APP_PY_APP_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const requestInterceptor = (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    };
    const errorInterceptor = (error) => Promise.reject(error);
    this.axiosInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
    this.pythonInstance.interceptors.request.use(requestInterceptor, errorInterceptor);
    const responseSuccess = (response) => {
        if (response.config.method?.toUpperCase() === 'OPTIONS') return null;
        return response.data;
    };

    const responseError = (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        if (!error.response) {
          return Promise.reject("Error contact administrator.");
        }
        return Promise.reject(error.response?.data || error);
    };

    this.axiosInstance.interceptors.response.use(responseSuccess, responseError);
    this.pythonInstance.interceptors.response.use(responseSuccess, responseError);
  }

  async register(userData) { return await this.axiosInstance.post('api/v1/auth/register', userData); }
  async login(userData) { return await this.axiosInstance.post('api/v1/auth/login', userData); }
  async get(url, config = {}) { return await this.axiosInstance.get(url, config); }
  async postProjectInfo(url, body) { return await this.axiosInstance.post(url, body); }
  async postProyeccionMacro(url, body) { return await this.axiosInstance.post(url, body); }
  async postCostosGastos(url, body) { return await this.axiosInstance.post(url, body); }
  async postActivosFijos(url, body) { return await this.axiosInstance.post(url, body); } 
  async postSalarioAdmins(url, body) { return await this.axiosInstance.post(url, body); } 
  async postPlanFinanciero(url, body) { return await this.axiosInstance.post(url, body); } 
  async getProjectSummary(url) { return await this.axiosInstance.get(url); } 

  async calculateExcel(body) {
    try {
      const response = await this.pythonInstance.post('/calculate/excel', body);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const axiosClient = new AxiosClient();
export default axiosClient;