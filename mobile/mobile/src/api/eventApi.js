import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

export const list = (filters) => api.get('/events', filters);
export const mine = () => api.get('/events/mine');
export const get = (id) => api.get(`/events/${id}`);
export const create = (body) => api.post('/events', body);
export const update = (id, body) => api.put(`/events/${id}`, body);
export const cancel = (id) => api.post(`/events/${id}/cancel`);
