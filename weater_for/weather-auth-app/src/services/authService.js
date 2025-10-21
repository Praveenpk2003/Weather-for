import axios from 'axios';
import { mockAuthService } from './mockAuthService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const USE_MOCK_SERVICE = process.env.REACT_APP_USE_MOCK_SERVICE !== 'false';

// Debug base URL selection
if (!USE_MOCK_SERVICE) {
  // eslint-disable-next-line no-console
  console.log('[authService] Using real backend:', API_BASE_URL);
} else {
  // eslint-disable-next-line no-console
  console.log('[authService] Using mock auth service');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const parseSpringBootMessage = (data) => {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.join(', ');
  if (data?.message) return data.message;
  try { return JSON.stringify(data); } catch { return 'Unknown error'; }
};

const synthesizeUserFromLoginSuccess = (identifier, message) => {
  let username = identifier?.includes('@') ? identifier.split('@')[0] : identifier;
  const match = typeof message === 'string' && message.includes('Welcome')
    ? message.split('Welcome').pop().trim()
    : null;
  if (match) username = match;
  return {
    id: 'local-session',
    name: username || 'User',
    email: identifier && identifier.includes('@') ? identifier : `${username || 'user'}@local`,
  };
};

const attemptLogin = async (identifier, password) => {
  const isEmail = typeof identifier === 'string' && identifier.includes('@');

  const relativeAttempts = [
    { url: '/login', body: isEmail ? { email: identifier, password } : { username: identifier, password } },
    { url: '/login', body: { identifier, password } },
    { url: '/auth/login', body: isEmail ? { email: identifier, password } : { username: identifier, password } },
    { url: '/auth/login', body: { identifier, password } },
  ];

  const absoluteAttempts = [
    { url: 'http://localhost:8080/api/login', body: isEmail ? { email: identifier, password } : { username: identifier, password } },
  ];

  let lastError;
  for (const attempt of [...relativeAttempts, ...absoluteAttempts]) {
    try {
      // eslint-disable-next-line no-console
      console.log('[authService] login attempt', attempt.url, attempt.body);
      const res = await api.post(attempt.url, attempt.body);
      const data = res.data;
      // eslint-disable-next-line no-console
      console.log('[authService] login response', data);
      if (typeof data === 'string') {
        return { token: 'local-session', user: synthesizeUserFromLoginSuccess(identifier, data) };
      }
      if (data?.token && data?.user) return data;
      if (data?.username || data?.email) {
        return { token: 'local-session', user: {
          id: data.id || 'local-session',
          name: data.username || data.name || identifier,
          email: data.email || (isEmail ? identifier : `${identifier}@local`),
        }};
      }
      return { token: 'local-session', user: synthesizeUserFromLoginSuccess(identifier, 'Login successful') };
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-console
      console.warn('[authService] login failed attempt', attempt.url, err?.response?.data || err?.message);
      continue;
    }
  }

  const message = parseSpringBootMessage(lastError?.response?.data) || lastError?.message || 'Login failed';
  throw new Error(message);
};

const authService = USE_MOCK_SERVICE ? mockAuthService : {
  async login(identifier, password) {
    return attemptLogin(identifier, password);
  },

  async register(name, email, password) {
    try {
      const res = await api.post('/register', { username: name, email, password, confirmPassword: password });
      const message = parseSpringBootMessage(res.data);
      return { message };
    } catch (error) {
      const msg = parseSpringBootMessage(error?.response?.data) || error?.message || 'Registration failed';
      throw new Error(msg);
    }
  },

  async verifyToken(token) {
    throw new Error('Invalid token');
  },

  async forgotPassword(email) {
    throw new Error('Not implemented');
  },

  async resetPassword(token, password) {
    throw new Error('Not implemented');
  },

  async getCurrentUser() {
    throw new Error('Not implemented');
  }
};

export { authService, attemptLogin };
