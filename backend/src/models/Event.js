const BaseModel = require('./BaseModel');
const { EVENT_STATUS } = require('./constants');
const { combine } = require('../utils/time');

class Event extends BaseModel {
  constructor({
    id = null, title, description = '', type, society = '', date, startTime, endTime, venue, capacity,
    organizerId, status = EVENT_STATUS.SCHEDULED, reminderSent = false, createdAt = new Date().toISOString(),
  }) {
    super();
    Object.assign(this, {
      id, title, description, type, society, date, startTime, endTime, venue,
      capacity: Number(capacity), organizerId, status, reminderSent, createdAt,
    });
  }
  startsAt() { return combine(this.date, this.startTime); }
  endsAt() { return combine(this.date, this.endTime); }
  isCancelled() { return this.status === EVENT_STATUS.CANCELLED; }
}
module.exports = Event;
