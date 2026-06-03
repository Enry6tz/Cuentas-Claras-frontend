import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable a nivel de módulo: siempre apunta al getter más reciente.
// El interceptor de abajo la lee en cada request — sin closures stale.
let _getToken: (() => Promise<string | null>) | null = null;

export function setAuthToken(getToken: () => Promise<string | null>) {
  _getToken = getToken;
}

// Un único interceptor de request, registrado una sola vez.
api.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Solo redirige si Clerk ya no tiene sesión activa.
      // Si hay token válido, el 401 es un error del backend (user no en BD, etc.)
      // y TanStack Query va a reintentar con el token correcto.
      const token = _getToken ? await _getToken() : null;
      if (!token) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
