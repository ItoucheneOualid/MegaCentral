/**
 * API Configuration
 * Centralized API URL configuration for all frontend services
 */

const rawApiUrl = (
  process.env.REACT_APP_API_URL ||
  'http://localhost:3000/api'
).trim();

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');

// Accepte les deux formats :
// - http://localhost:3000
// - http://localhost:3000/api
const API_BASE_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,

  endpoints: {
    auth: {
      login: `${API_BASE_URL}/auth/login`,
      logout: `${API_BASE_URL}/auth/logout`,

      // Correspond à router.get('/verify') dans le backend
      verifyToken: `${API_BASE_URL}/auth/verify`,

      resetPassword: `${API_BASE_URL}/auth/reset-password`,
      forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
      profile: `${API_BASE_URL}/auth/profile`,
    },

    articles: `${API_BASE_URL}/articles`,
    familles: `${API_BASE_URL}/familles`,
    fournisseurs: `${API_BASE_URL}/fournisseurs`,
    magasins: `${API_BASE_URL}/magasins`,
    tickets: `${API_BASE_URL}/tickets`,
    factures: `${API_BASE_URL}/factures`,
    commandes: `${API_BASE_URL}/commandes`,
    rapportsZ: `${API_BASE_URL}/rapportsZ`,
    tva: `${API_BASE_URL}/tva`,
    email: `${API_BASE_URL}/send-email`,
    mouvementsStock: `${API_BASE_URL}/mouvements-stock`,
    stockMagasin: `${API_BASE_URL}/stock-magasin`,
  },
};

export default apiConfig;