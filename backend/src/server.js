const { loadConfig } = require('./config');
const { Database } = require('./database/Database');
const { createContainer } = require('./container');
const { seedIfEmpty, ensureDefaultAdmin } = require('./database/seed');
const createApp = require('./app');

async function main() {
  const config = loadConfig();
  const db = Database.getInstance({ file: config.dbFile }); // Singleton
  const container = createContainer({ db, config });
  await seedIfEmpty(container);
  await ensureDefaultAdmin(container);
  container.services.reminders.start(config.reminderIntervalMs);

  createApp(container).listen(config.port, '0.0.0.0', () => {
    console.log(`BOOKT API running on http://localhost:${config.port}  (conflict strategy: ${config.conflictStrategy})`);
  });
}
main().catch((err) => { console.error(err); process.exit(1); });
