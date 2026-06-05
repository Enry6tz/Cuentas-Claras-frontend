import axios from 'axios';

/**
 * Cliente HTTP del frontend. Apunta al **BFF de Next** (`/api`), no al backend
 * NestJS directo.
 *
 * La autenticación viaja por la cookie de sesión de Clerk (same-origin): el
 * route handler la resuelve server-side con `auth()` y reenvía el JWT al
 * backend. Por eso el cliente ya **no** maneja ni adjunta el token.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el BFF responde 401 es porque Clerk ya no tiene sesión válida.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  },
);

export default api;
