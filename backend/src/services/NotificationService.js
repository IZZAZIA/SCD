// In-system notifications (FR-16 to FR-18). Publishes notification.created so extra channels (email) can observe.
const TOPICS = require('../events/topics');
const { NotFoundError } = require('../utils/errors');

class NotificationService {
  constructor({ notificationRepository, eventBus }) {
    this.notifications = notificationRepository;
    this.bus = eventBus;
  }

  async send(notification) {
    const saved = await this.notifications.create(notification);
    await this.bus.publish(TOPICS.NOTIFICATION_CREATED, { notification: saved });
    return saved;
  }
  async sendMany(list) {
    for (const n of list) await this.send(n);
  }

  async listFor(user) {
    const items = await this.notifications.findByUser(user.id);
    return { items, unread: items.filter((n) => !n.isRead).length };
  }

  async markRead(user, id) {
    const n = await this.notifications.findById(id);
    if (!n || n.userId !== user.id) throw new NotFoundError('Notification not found.');
    return this.notifications.update(id, { isRead: true });
  }

  async markAllRead(user) {
    const unread = (await this.notifications.findByUser(user.id)).filter((n) => !n.isRead);
    for (const n of unread) await this.notifications.update(n.id, { isRead: true });
    return { updated: unread.length };
  }
}
module.exports = NotificationService;
