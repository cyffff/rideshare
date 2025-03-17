import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will use the proxy configuration in package.json
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Example API methods
export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; phoneNumber: string; role: string }) => 
    api.post('/auth/register', userData),
};

export const ridesAPI = {
  createRide: (rideData: any) => 
    api.post('/rides', rideData),
  getRides: () => 
    api.get('/rides'),
  getRideDetails: (id: string) => 
    api.get(`/rides/${id}`),
  acceptRide: (id: string) => 
    api.post(`/rides/${id}/accept`),
  processPayment: (id: string, paymentData: any) => 
    api.post(`/rides/${id}/payment`, paymentData),
};

export default api; 