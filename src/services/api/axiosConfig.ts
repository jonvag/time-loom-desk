import axios from 'axios';

// Configuración base de axios
const apiClient = axios.create({
    baseURL: 'https://n8n.nex-gen.digital',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptores para manejar requests y responses
apiClient.interceptors.request.use(
    (config) => {
        // Puedes agregar headers aquí (como tokens de auth)
        console.log('Enviando request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Error en respuesta:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export default apiClient;