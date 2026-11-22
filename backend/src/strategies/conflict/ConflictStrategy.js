// DESIGN PATTERN: STRATEGY (interface)
// A conflict strategy decides what to do when a requested slot overlaps existing bookings.
// evaluate(conflicts, resource) -> { allowed: boolean, warnings: string[], reason?: string }
class ConflictStrategy {
  evaluate() { throw new Error('ConflictStrategy.evaluate() must be implemented'); }
}
module.exports = ConflictStrategy;
