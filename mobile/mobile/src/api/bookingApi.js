import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

export const request = (body) => api.post('/bookings', body);
export const mine = () => api.get('/bookings/mine');
export const all = (status) => api.get('/bookings', { status });
export const review = (id, decision, remarks) => api.patch(`/bookings/${id}/review`, { decision, remarks });
export const cancel = (id) => api.post(`/bookings/${id}/cancel`);
