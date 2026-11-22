import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

export const list = () => api.get('/users');
export const create = (body) => api.post('/users', body);
export const update = (id, body) => api.put(`/users/${id}`, body);
export const deactivate = (id) => api.post(`/users/${id}/deactivate`);
export const remove = (id) => api.del(`/users/${id}`);
