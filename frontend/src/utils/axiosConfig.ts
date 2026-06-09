import axios from 'axios';

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Intercepteur pour ajouter le token JWT à toutes les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token ajouté à la requête:', config.headers.Authorization);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse:', error);
    
    if (error.response?.status === 401) {
      console.log('🚫 Token expiré ou invalide - Redirection vers login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      console.log('🚫 Permission refusée:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
