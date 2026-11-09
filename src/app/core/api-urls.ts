// Same domain as the page. In development, proxy.conf.json forwards /api to the server on port 3000.
export const API_BASE_URL = '/api';

export const API_URLS = {
  login: `${API_BASE_URL}/login`,
  googleLogin: `${API_BASE_URL}/login/google`,
  googleConfig: `${API_BASE_URL}/login/google/config`,
  me: `${API_BASE_URL}/me`,
};
