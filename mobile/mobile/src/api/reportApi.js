import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

export const dashboard = () => api.get('/reports/dashboard');
export const utilization = () => api.get('/reports/resource-utilization');
export const participation = () => api.get('/reports/event-participation');
