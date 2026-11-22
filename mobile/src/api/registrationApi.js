import ApiClient from './ApiClient';
const api = ApiClient.getInstance();

export const register = (eventId) => api.post('/registrations', { eventId });
export const unregister = (eventId) => api.del(`/registrations/${eventId}`);
export const mine = () => api.get('/registrations/mine');
export const attendees = (eventId) => api.get(`/registrations/event/${eventId}`);
export const setAttendance = (eventId, studentId, attended) =>
  api.patch(`/registrations/event/${eventId}/student/${studentId}/attendance`, { attended });
