import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

export const list = () => api.get('/notifications');
export const markRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllRead = () => api.patch('/notifications/read-all');
export const runReminders = () => api.post('/notifications/reminders/run');
export const sendReminder = (body) => api.post('/notifications/reminders/send', body);
