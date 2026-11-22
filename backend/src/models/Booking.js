const BaseModel = require('./BaseModel');
const { BOOKING_STATUS: S } = require('./constants');
const { rangesOverlap, hoursBetween } = require('../utils/time');

// FR-13: the only legal status changes of a booking request.
const TRANSITIONS = {
  [S.PENDING]: [S.APPROVED, S.REJECTED, S.CANCELLED],
  [S.APPROVED]: [S.CANCELLED],
  [S.REJECTED]: [],
  [S.CANCELLED]: [],
};

class Booking extends BaseModel {
  constructor({
    id = null, eventId, resourceId, startTime, endTime, status = S.PENDING, remarks = '',
    requestedBy, reviewedBy = null, createdAt = new Date().toISOString(),
  }) {
    super();
    Object.assign(this, { id, eventId, resourceId, startTime, endTime, status, remarks, requestedBy, reviewedBy, createdAt });
  }
  canTransitionTo(next) { return (TRANSITIONS[this.status] || []).includes(next); }
  isBlocking() { return this.status === S.PENDING || this.status === S.APPROVED; }
  overlaps(start, end) { return rangesOverlap(this.startTime, this.endTime, start, end); }
  durationHours() { return hoursBetween(this.startTime, this.endTime); }
}
module.exports = Booking;
