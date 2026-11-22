const { Database } = require('../src/database/Database');
const { createContainer } = require('../src/container');
const { loadConfig } = require('../src/config');
const UserFactory = require('../src/factories/UserFactory');
const { hashPassword } = require('../src/utils/security');
const { ROLES } = require('../src/models/constants');

const pad = (n) => String(n).padStart(2, '0');
function dayFromNow(n) {
  const d = new Date(Date.now() + n * 864e5);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Fresh in-memory app for every test (no files written).
function buildApp(overrides = {}) {
  const db = Database.getInstance({ file: null });
  db.reset();
  return createContainer({ db, config: { ...loadConfig({}), emailEnabled: false, conflictStrategy: 'reject', ...overrides } });
}

let counter = 0;
async function makeUser(app, role = ROLES.STUDENT, name = role) {
  counter += 1;
  return app.repositories.userRepository.create(
    UserFactory.create(role, { name, email: `${name}${counter}@test.edu`.toLowerCase(), passwordHash: hashPassword('Password1') })
  );
}

const eventData = (over = {}) => ({
  title: 'Robotics Workshop', type: 'Workshop', society: 'Computing Society', date: dayFromNow(10),
  startTime: '10:00', endTime: '12:00', venue: 'Lab 1', capacity: 2, ...over,
});

async function makeResource(app, name = 'Main Hall') {
  return app.services.resources.create({ name, type: 'Hall', location: 'Block A', capacity: 100 });
}

module.exports = { buildApp, makeUser, makeResource, eventData, dayFromNow, ROLES };
