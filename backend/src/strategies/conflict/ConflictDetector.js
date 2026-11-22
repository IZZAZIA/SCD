// DESIGN PATTERN: STRATEGY (context)
// ConflictDetector finds overlapping bookings and delegates the verdict to the current strategy.
const RejectConflictStrategy = require('./RejectConflictStrategy');
const { BOOKING_STATUS: S } = require('../../models/constants');

const BLOCKING = [S.PENDING, S.APPROVED];

class ConflictDetector {
  constructor(bookingRepository, strategy = new RejectConflictStrategy()) {
    this.bookingRepository = bookingRepository;
    this.strategy = strategy;
  }
  setStrategy(strategy) { this.strategy = strategy; }

  async findConflicts(resourceId, start, end, { excludeBookingId = null, statuses = BLOCKING } = {}) {
    const bookings = await this.bookingRepository.findByResource(resourceId);
    return bookings.filter((b) => b.id !== excludeBookingId && statuses.includes(b.status) && b.overlaps(start, end));
  }

  async check(resource, start, end, options) {
    const conflicts = await this.findConflicts(resource.id, start, end, options);
    return { ...this.strategy.evaluate(conflicts, resource), conflicts };
  }
}
module.exports = ConflictDetector;
