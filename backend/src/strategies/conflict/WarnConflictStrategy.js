const ConflictStrategy = require('./ConflictStrategy');

// FR-11 (warn): the request goes through but the organizer and reviewer see a warning.
class WarnConflictStrategy extends ConflictStrategy {
  evaluate(conflicts, resource) {
    const warnings = conflicts.length
      ? [`${resource.name} overlaps ${conflicts.length} other booking${conflicts.length > 1 ? 's' : ''}; the reviewer will decide.`]
      : [];
    return { allowed: true, warnings };
  }
}
module.exports = WarnConflictStrategy;
