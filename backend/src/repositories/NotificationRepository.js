const BaseRepository = require('./BaseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor(db) { super(db, 'notifications', Notification); }
  async findByUser(userId) {
    const list = await this.findWhere((n) => n.userId === userId);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
  }
  countUnread(userId) { return this.count((n) => n.userId === userId && !n.isRead); }
}
module.exports = NotificationRepository;
