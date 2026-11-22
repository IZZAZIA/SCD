const RejectConflictStrategy = require('./RejectConflictStrategy');
const WarnConflictStrategy = require('./WarnConflictStrategy');
const ConflictDetector = require('./ConflictDetector');

const STRATEGIES = { reject: RejectConflictStrategy, warn: WarnConflictStrategy };

function createConflictStrategy(name = 'reject') {
  const Strategy = STRATEGIES[name] || RejectConflictStrategy;
  return new Strategy();
}

module.exports = { createConflictStrategy, ConflictDetector, RejectConflictStrategy, WarnConflictStrategy };
