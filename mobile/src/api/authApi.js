import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

// portal: 'student' or 'admin' (the tab chosen on the login screen)
export const login = (identifier, password, portal) => api.post('/auth/login', { identifier, password, portal });
export const register = (data) => api.post('/auth/register', data);
export const me = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
export const changePassword = (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword });
