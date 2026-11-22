// DESIGN PATTERN: OBSERVER (concrete observer)
// Turns business events into in-system notifications (FR-16, FR-17, FR-18) using NotificationFactory.
const TOPICS = require('../topics');
const NotificationFactory = require('../../factories/NotificationFactory');
const { NOTIFICATION_TYPES: T, ROLES } = require('../../models/constants');

class NotificationObserver {
  constructor({ notificationService, userRepository, registrationRepository }) {
    this.notifications = notificationService;
    this.users = userRepository;
    this.registrations = registrationRepository;
    this.handlers = {
      [TOPICS.BOOKING_REQUESTED]: (p) => this.onBookingRequested(p),
      [TOPICS.BOOKING_APPROVED]: (p) => this.onBookingDecision(T.BOOKING_APPROVED, p),
      [TOPICS.BOOKING_REJECTED]: (p) => this.onBookingDecision(T.BOOKING_REJECTED, p),
      [TOPICS.BOOKING_CANCELLED]: (p) => this.onBookingCancelled(p),
      [TOPICS.EVENT_RESCHEDULED]: (p) => this.notifyRegistered(T.EVENT_RESCHEDULED, p),
      [TOPICS.EVENT_CANCELLED]: (p) => this.notifyRegistered(T.EVENT_CANCELLED, p),
      [TOPICS.EVENT_REMINDER]: (p) => this.notifyRegistered(T.EVENT_REMINDER, p),
    };
  }

  topics() { return Object.keys(this.handlers); }

  async update(topic, payload) {
    const handler = this.handlers[topic];
    if (handler) await handler(payload);
  }

  async onBookingRequested({ event, resources, requester }) {
    const reviewers = await this.users.findByRoles([ROLES.RESOURCE_MANAGER]);
    const context = { event, requesterName: requester.name, resourceNames: resources.map((r) => r.name).join(', ') };
    await this.notifications.sendMany(NotificationFactory.createMany(T.BOOKING_REQUESTED, reviewers.map((u) => u.id), context));
  }

  async onBookingDecision(type, { booking, event, resource, remarks }) {
    await this.notifications.send(
      NotificationFactory.create(type, booking.requestedBy, { event, resourceName: resource.name, remarks })
    );
  }

  async onBookingCancelled({ booking, event, resource, cancelledBy }) {
    if (cancelledBy.id === booking.requestedBy) return; // people don't need an alert for their own action
    await this.notifications.send(
      NotificationFactory.create(T.BOOKING_CANCELLED, booking.requestedBy, { event, resourceName: resource.name })
    );
  }

  async notifyRegistered(type, payload) {
    // A manual reminder from the admin names its own recipients; otherwise everyone registered is notified.
    const ids = payload.recipientIds ?? (await this.registrations.findByEvent(payload.event.id)).map((r) => r.studentId);
    await this.notifications.sendMany(NotificationFactory.createMany(type, ids, payload));
  }
}
module.exports = NotificationObserver;
