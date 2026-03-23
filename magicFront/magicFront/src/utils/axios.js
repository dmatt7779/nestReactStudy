import axios from 'axios';
import toast from 'react-hot-toast';
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
          toast.error('Tu sesión ha expirado o las credenciales son inválidas.');
        } else if (!error.response) {
          toast.error("Error intermitente o de red. Verifica tu conexión.");
          return Promise.reject("Error contact administrator.");
        } else {
          const status = error.response.status;
          const method = error.config?.method?.toLowerCase();
          
          if (status === 404 && method === 'get') {
              // Silently ignore 404s for GET requests as they logically indicate empty/new forms in this app
              console.warn("404 GET ignorado en toast global:", error.config?.url);
          } else {
              const apiErrorMsg = error.response?.data?.message || "Ocurrió un error en el servidor.";
              toast.error(apiErrorMsg);
          }
        }
        return Promise.reject(error.response?.data || error);
    };

    this.axiosInstance.interceptors.response.use(responseSuccess, responseError);
    this.pythonInstance.interceptors.response.use(responseSuccess, responseError);
  }

  async register(userData) { return await this.axiosInstance.post('api/v1/auth/register', userData); }
  async login(userData) { return await this.axiosInstance.post('api/v1/auth/login', userData); }
  async forgotPassword(data) { return await this.axiosInstance.post('api/v1/auth/forgot-password', data); }
  async resetPassword(data) { return await this.axiosInstance.post('api/v1/auth/reset-password', data); }
  async get(url, config = {}) { return await this.axiosInstance.get(url, config); }
  async getProfessors() { return await this.axiosInstance.get('api/v1/users/professors'); }
  async getProfessorProjects() { return await this.axiosInstance.get('api/v1/project-info/professor/dashboard'); }
  async getProfessorVerifiedProjects() { return await this.axiosInstance.get('api/v1/project-info/professor/dashboard?verified=true'); }
  async toggleVerification(projectInfoId) { return await this.axiosInstance.patch(`api/v1/save-results/verify/project/${projectInfoId}`); }
  async saveComment(projectInfoId, screenKey, comment) { return await this.axiosInstance.patch(`api/v1/save-results/comments/project/${projectInfoId}`, { screenKey, comment }); }
  async deleteProject(url) { return await this.axiosInstance.delete(url); }
  async postProjectInfo(url, body) { return await this.axiosInstance.post(url, body); }
  async patchProjectInfo(url, body) { return await this.axiosInstance.patch(url, body); }
  async postProyeccionMacro(url, body) { return await this.axiosInstance.post(url, body); }
  async postCostosGastos(url, body) { return await this.axiosInstance.post(url, body); }
  async postActivosFijos(url, body) { return await this.axiosInstance.post(url, body); } 
  async postSalarioAdmins(url, body) { return await this.axiosInstance.post(url, body); } 
  async postPlanFinanciero(url, body) { return await this.axiosInstance.post(url, body); } 
  async getProjectSummary(url) { return await this.axiosInstance.get(url); } 

  async calculateExcel(body) {
    try {
      const response = await this.pythonInstance.post('api/v1/calculate/excel', body);
      return response;
    } catch (error) {
      throw error;
    }
  }

    async saveResults(projectInfoId, body) {
    try {
      const response = await this.axiosInstance.post(`api/v1/save-results/${projectInfoId}`, body);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getResults(projectId) {
    try {
      const response = await this.axiosInstance.get(`api/v1/save-results/project/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async downloadReport(projectInfoId) {
    const response = await this.axiosInstance.get(
      `api/v1/reports/project/${projectInfoId}`,
      { responseType: 'blob' }
    );
    const blob = response instanceof Blob ? response : new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_proyecto_${projectInfoId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}

const axiosClient = new AxiosClient();
export default axiosClient;