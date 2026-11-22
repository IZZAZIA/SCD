// FR-17: reminders to students, sent automatically before an event and manually by the admin.
const TOPICS = require('../events/topics');
const { EVENT_STATUS, ROLES } = require('../models/constants');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class ReminderService {
  constructor({ eventRepository, registrationRepository, userRepository, eventBus, hoursBefore = 24 }) {
    this.events = eventRepository;
    this.registrations = registrationRepository;
    this.users = userRepository;
    this.bus = eventBus;
    this.hoursBefore = hoursBefore;
    this.timer = null;
  }

  // Automatic: events starting within the next `hoursBefore` hours.
  async runOnce(now = new Date()) {
    const windowMs = this.hoursBefore * 36e5;
    const due = await this.events.findWhere((e) => {
      const until = e.startsAt() - now;
      return e.status === EVENT_STATUS.SCHEDULED && !e.reminderSent && until > 0 && until <= windowMs;
    });
    for (const event of due) {
      const updated = await this.events.update(event.id, { reminderSent: true });
      await this.bus.publish(TOPICS.EVENT_REMINDER, { event: updated });
    }
    return { reminded: due.length };
  }

  // Manual: the admin picks an event and an audience and sends an in-app reminder right away.
  async sendManual(_admin, { eventId, audience = 'registered', message = '' } = {}) {
    if (!eventId) throw new ValidationError('Choose an event to remind students about.');
    if (!['registered', 'all'].includes(audience)) throw new ValidationError('Audience must be "registered" or "all".');
    const text = String(message).trim();
    if (text.length > 300) throw new ValidationError('Keep the message under 300 characters.');
    const event = await this.events.findById(eventId);
    if (!event) throw new NotFoundError('Event not found.');
    if (event.isCancelled()) throw new ConflictError('This event has been cancelled.');

    const ids = audience === 'all'
      ? (await this.users.findByRoles([ROLES.STUDENT])).map((u) => u.id)
      : (await this.registrations.findByEvent(eventId)).map((r) => r.studentId);
    const recipientIds = [...new Set(ids)];
    if (!recipientIds.length) throw new ConflictError('No students have registered for this event yet. Send it to all students instead.');

    await this.bus.publish(TOPICS.EVENT_REMINDER, { event, message: text, recipientIds });
    return { sent: recipientIds.length };
  }

  start(intervalMs = 60000) {
    this.stop();
    this.timer = setInterval(() => this.runOnce().catch((e) => console.error('[reminders]', e.message)), intervalMs);
    this.timer.unref?.();
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
}
module.exports = ReminderService;
