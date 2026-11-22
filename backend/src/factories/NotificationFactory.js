// DESIGN PATTERN: FACTORY
// Builds Notification objects with the right wording for each notification type (FR-16, FR-17, FR-18).
const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES: T } = require('../models/constants');
const { ValidationError } = require('../utils/errors');

const when = (e) => `${e.date} ${e.startTime}-${e.endTime}`;

const TEMPLATES = {
  [T.BOOKING_REQUESTED]: ({ event, resourceNames, requesterName }) =>
    `New booking request from ${requesterName}: ${resourceNames} for "${event.title}" (${when(event)}).`,
  [T.BOOKING_APPROVED]: ({ event, resourceName, remarks }) =>
    `Approved: ${resourceName} for "${event.title}".${remarks ? ` Remarks: ${remarks}` : ''}`,
  [T.BOOKING_REJECTED]: ({ event, resourceName, remarks }) =>
    `Rejected: ${resourceName} for "${event.title}".${remarks ? ` Reason: ${remarks}` : ''}`,
  [T.BOOKING_CANCELLED]: ({ event, resourceName }) =>
    `Cancelled: your booking of ${resourceName} for "${event.title}" was cancelled by a reviewer.`,
  [T.EVENT_RESCHEDULED]: ({ event, previous }) =>
    `"${event.title}" was rescheduled from ${previous.date} ${previous.startTime} to ${when(event)}.`,
  [T.EVENT_CANCELLED]: ({ event }) => `"${event.title}" on ${event.date} has been cancelled.`,
  [T.EVENT_REMINDER]: ({ event, message }) => (message
    ? `Reminder about "${event.title}" (${when(event)}): ${message}`
    : `Reminder: "${event.title}" starts ${when(event)} at ${event.venue}.`),
};

class NotificationFactory {
  static create(type, userId, context) {
    const template = TEMPLATES[type];
    if (!template) throw new ValidationError(`Unknown notification type "${type}".`);
    return new Notification({ userId, type, message: template(context) });
  }
  static createMany(type, userIds, context) {
    return [...new Set(userIds)].map((id) => NotificationFactory.create(type, id, context));
  }
}
module.exports = NotificationFactory;
