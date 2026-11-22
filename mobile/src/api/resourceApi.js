import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

export const list = () => api.get('/resources');
export const availability = (id, date) => api.get(`/resources/${id}/availability`, { date });
export const create = (body) => api.post('/resources', body);
export const update = (id, body) => api.put(`/resources/${id}`, body);
export const remove = (id) => api.del(`/resources/${id}`);
