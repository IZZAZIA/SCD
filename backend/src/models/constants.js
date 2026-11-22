const ROLES = Object.freeze({
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  RESOURCE_MANAGER: 'resource_manager',
  STUDENT: 'student',
});

const PERMISSIONS = Object.freeze({
  USER_MANAGE: 'user.manage',
  EVENT_VIEW: 'event.view',
  EVENT_CREATE: 'event.create',
  EVENT_MANAGE: 'event.manage',         // edit/cancel own events
  EVENT_MANAGE_ANY: 'event.manage.any', // edit/cancel anyone's events
  EVENT_REGISTER: 'event.register',
  RESOURCE_VIEW: 'resource.view',
  RESOURCE_MANAGE: 'resource.manage',
  BOOKING_REQUEST: 'booking.request',
  BOOKING_REVIEW: 'booking.review',
  BOOKING_VIEW_ALL: 'booking.view.all',
  REPORT_VIEW: 'report.view',
  NOTIFICATION_VIEW: 'notification.view',
  REMINDER_SEND: 'reminder.send',
});

const BOOKING_STATUS = Object.freeze({
  PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled',
});
const RESOURCE_STATUS = Object.freeze({ AVAILABLE: 'available', MAINTENANCE: 'maintenance', UNAVAILABLE: 'unavailable' });
const EVENT_STATUS = Object.freeze({ SCHEDULED: 'Scheduled', CANCELLED: 'Cancelled' });
const USER_STATUS = Object.freeze({ ACTIVE: 'active', INACTIVE: 'inactive' });

const NOTIFICATION_TYPES = Object.freeze({
  BOOKING_REQUESTED: 'BOOKING_REQUESTED',
  BOOKING_APPROVED: 'BOOKING_APPROVED',
  BOOKING_REJECTED: 'BOOKING_REJECTED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  EVENT_RESCHEDULED: 'EVENT_RESCHEDULED',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  EVENT_REMINDER: 'EVENT_REMINDER',
});

const SOCIETIES = Object.freeze([
  'Computing Society', 'Sports Society', 'Baking Society', 'English Lit Society',
  'Board Games Society', 'Medical Sciences Society', 'Astronomy Society', 'Shakespeare Reading Society',
]);

module.exports = { SOCIETIES, ROLES, PERMISSIONS, BOOKING_STATUS, RESOURCE_STATUS, EVENT_STATUS, USER_STATUS, NOTIFICATION_TYPES };
