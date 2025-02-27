import axios from 'axios';

const BASE_URL = 'https://react-store.azurewebsites.net'; //  http://localhost:5000 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
axiosInstance.interceptors.response.use(
  (response) => response, // Si la solicitud es exitosa, devuelve la respuesta
  (error) => {
    // Maneja errores aquí (por ejemplo, mostrar un mensaje de error)
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;