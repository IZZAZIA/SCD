const express = require('express');
const h = require('../middleware/asyncHandler');
const { PERMISSIONS: P } = require('../models/constants');

// Every route file below is the "wiring" between URLs, permissions and controller methods.
function buildRoutes({ controllers: c, auth }) {
  const { authenticate: authn, authorize: can } = auth;
  const api = express.Router();

  // --- Auth (FR-1)
  api.post('/auth/register', h(c.auth.register));
  api.post('/auth/login', h(c.auth.login));
  api.get('/auth/me', authn, h(c.auth.me));
  api.put('/auth/me', authn, h(c.auth.updateMe));
  api.post('/auth/change-password', authn, h(c.auth.changePassword));

  // --- Users (FR-3)
  const users = express.Router();
  users.use(authn, can(P.USER_MANAGE));
  users.get('/', h(c.users.list));
  users.post('/', h(c.users.create));
  users.put('/:id', h(c.users.update));
  users.post('/:id/deactivate', h(c.users.deactivate));
  users.delete('/:id', h(c.users.remove));
  api.use('/users', users);

  // --- Events (FR-4, FR-5, FR-6)
  const events = express.Router();
  events.use(authn);
  events.get('/', can(P.EVENT_VIEW), h(c.events.list));
  events.get('/mine', can(P.EVENT_CREATE), h(c.events.mine));
  events.get('/:id', can(P.EVENT_VIEW), h(c.events.get));
  events.post('/', can(P.EVENT_CREATE), h(c.events.create));
  events.put('/:id', can(P.EVENT_MANAGE, P.EVENT_MANAGE_ANY), h(c.events.update));
  events.post('/:id/cancel', can(P.EVENT_MANAGE, P.EVENT_MANAGE_ANY), h(c.events.cancel));
  api.use('/events', events);

  // --- Registrations (FR-7)
  const regs = express.Router();
  regs.use(authn);
  regs.post('/', can(P.EVENT_REGISTER), h(c.registrations.register));
  regs.get('/mine', can(P.EVENT_REGISTER), h(c.registrations.mine));
  regs.delete('/:eventId', can(P.EVENT_REGISTER), h(c.registrations.unregister));
  regs.get('/event/:eventId', can(P.EVENT_MANAGE, P.EVENT_MANAGE_ANY), h(c.registrations.attendees));
  regs.patch('/event/:eventId/student/:studentId/attendance', can(P.EVENT_MANAGE, P.EVENT_MANAGE_ANY), h(c.registrations.attendance));
  api.use('/registrations', regs);

  // --- Resources (FR-8, FR-9)
  const resources = express.Router();
  resources.use(authn, can(P.RESOURCE_VIEW));
  resources.get('/', h(c.resources.list));
  resources.get('/:id/availability', h(c.resources.availability));
  resources.post('/', can(P.RESOURCE_MANAGE), h(c.resources.create));
  resources.put('/:id', can(P.RESOURCE_MANAGE), h(c.resources.update));
  resources.delete('/:id', can(P.RESOURCE_MANAGE), h(c.resources.remove));
  api.use('/resources', resources);

  // --- Bookings (FR-10 to FR-15)
  const bookings = express.Router();
  bookings.use(authn);
  bookings.post('/', can(P.BOOKING_REQUEST), h(c.bookings.request));
  bookings.get('/mine', can(P.BOOKING_REQUEST), h(c.bookings.mine));
  bookings.get('/', can(P.BOOKING_VIEW_ALL), h(c.bookings.all));
  bookings.get('/:id', can(P.BOOKING_REQUEST, P.BOOKING_VIEW_ALL), h(c.bookings.get));
  bookings.patch('/:id/review', can(P.BOOKING_REVIEW), h(c.bookings.review));
  bookings.post('/:id/cancel', can(P.BOOKING_REQUEST, P.BOOKING_REVIEW), h(c.bookings.cancel));
  api.use('/bookings', bookings);

  // --- Notifications (FR-16 to FR-18)
  const notes = express.Router();
  notes.use(authn);
  notes.get('/', can(P.NOTIFICATION_VIEW), h(c.notifications.list));
  notes.patch('/read-all', can(P.NOTIFICATION_VIEW), h(c.notifications.markAllRead));
  notes.patch('/:id/read', can(P.NOTIFICATION_VIEW), h(c.notifications.markRead));
  notes.post('/reminders/run', can(P.REMINDER_SEND), h(c.notifications.runReminders));
  notes.post('/reminders/send', can(P.REMINDER_SEND), h(c.notifications.sendReminder));
  api.use('/notifications', notes);

  // --- Reports & dashboard
  const reports = express.Router();
  reports.use(authn);
  reports.get('/dashboard', h(c.reports.dashboard));
  reports.get('/resource-utilization', can(P.REPORT_VIEW), h(c.reports.utilization));
  reports.get('/event-participation', can(P.REPORT_VIEW), h(c.reports.participation));
  api.use('/reports', reports);

  return api;
}
module.exports = buildRoutes;
