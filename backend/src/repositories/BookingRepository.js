const BaseRepository = require('./BaseRepository');
const Booking = require('../models/Booking');

class BookingRepository extends BaseRepository {
  constructor(db) { super(db, 'bookings', Booking); }
  findByResource(resourceId) { return this.findWhere((b) => b.resourceId === Number(resourceId)); }
  findByEvent(eventId) { return this.findWhere((b) => b.eventId === Number(eventId)); }
  findByRequester(userId) { return this.findWhere((b) => b.requestedBy === userId); }
  findByStatus(status) { return this.findWhere((b) => b.status === status); }
}
module.exports = BookingRepository;
