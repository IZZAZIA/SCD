const path = require('path');

function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 4000,
    tokenSecret: env.TOKEN_SECRET || 'dev-only-secret-change-me',
    tokenTtlSeconds: Number(env.TOKEN_TTL_SECONDS) || 8 * 60 * 60,
    dbFile: env.DB_FILE || path.join(__dirname, '..', '..', 'data', 'bookt-db.json'),
    conflictStrategy: env.CONFLICT_STRATEGY || 'reject',
    reminderHoursBefore: Number(env.REMINDER_HOURS_BEFORE) || 24,
    reminderIntervalMs: Number(env.REMINDER_INTERVAL_MS) || 60 * 1000,
    emailEnabled: env.EMAIL_ENABLED === 'true',
  };
}

module.exports = { loadConfig };
