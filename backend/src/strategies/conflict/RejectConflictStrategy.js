const ConflictStrategy = require('./ConflictStrategy');

// FR-11 (reject): overlapping bookings are refused outright.
class RejectConflictStrategy extends ConflictStrategy {
  evaluate(conflicts, resource) {
    if (!conflicts.length) return { allowed: true, warnings: [] };
    return {
      allowed: false,
      warnings: [],
      reason: `${resource.name} is already booked during that time (${conflicts.length} overlapping booking${conflicts.length > 1 ? 's' : ''}).`,
    };
  }
}
module.exports = RejectConflictStrategy;
