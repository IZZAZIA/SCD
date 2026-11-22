const BaseModel = require('./BaseModel');

class Notification extends BaseModel {
  constructor({ id = null, userId, message, type, isRead = false, createdAt = new Date().toISOString() }) {
    super();
    Object.assign(this, { id, userId, message, type, isRead, createdAt });
  }
}
module.exports = Notification;
