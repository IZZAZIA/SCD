// Demo data so every role can be tried immediately. Run `npm run seed` to reset it.
const UserFactory = require('../factories/UserFactory');
const Event = require('../models/Event');
const Resource = require('../models/Resource');
const { ROLES } = require('../models/constants');
const { hashPassword } = require('../utils/security');

const pad = (n) => String(n).padStart(2, '0');
const dayFromNow = (n) => {
  const d = new Date(Date.now() + n * 864e5);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Built-in administrator. Created on every start if missing; stored only as a hash.
// Change this password from the Profile screen before any real deployment.
const ADMIN_USERNAME = 'admin123';
const ADMIN_PASSWORD = '12345678';
const DEMO_PASSWORD = 'Password@123';
const DEMO_USERS = [
  ['Olivia Organizer', 'organizer@campus.edu', ROLES.ORGANIZER],
  ['Rami Resource Manager', 'manager@campus.edu', ROLES.RESOURCE_MANAGER],
  ['Sana Student', 'student@campus.edu', ROLES.STUDENT],
];

async function ensureDefaultAdmin({ repositories: r }) {
  if (await r.userRepository.findByUsername(ADMIN_USERNAME)) return false;
  await r.userRepository.create(UserFactory.create(ROLES.ADMIN, {
    name: 'System Admin', email: 'admin123@campus.edu', username: ADMIN_USERNAME, passwordHash: hashPassword(ADMIN_PASSWORD),
  }));
  return true;
}

async function seedIfEmpty(container) {
  const { db, repositories: r } = container;
  if (!db.isEmpty()) return false;
  await ensureDefaultAdmin(container);
  const users = [];
  for (const [name, email, role] of DEMO_USERS) {
    users.push(await r.userRepository.create(UserFactory.create(role, { name, email, passwordHash: hashPassword(DEMO_PASSWORD) })));
  }
  const organizer = users[0];

  const resources = [
    ['Main Auditorium', 'Hall', 'Block A, Ground floor', 400],
    ['Seminar Room 2', 'Classroom', 'Block B, Floor 2', 60],
    ['Computer Lab 1', 'Lab', 'Block C, Floor 1', 40],
    ['Portable Projector', 'Equipment', 'IT store', 0],
    ['Sound System', 'Equipment', 'IT store', 0],
  ];
  for (const [name, type, location, capacity] of resources) {
    await r.resourceRepository.create(new Resource({ name, type, location, capacity }));
  }

  const events = [
    ['AI in Healthcare Seminar', 'Seminar', 'Computing Society', 3, '10:00', '12:00', 'Main Auditorium', 200],
    ['Hackathon Kickoff', 'Workshop', 'Computing Society', 5, '09:00', '13:00', 'Computer Lab 1', 40],
    ['Inter-Department Cricket', 'Sports', 'Sports Society', 7, '14:00', '18:00', 'University Ground', 120],
  ];
  for (const [title, type, society, days, startTime, endTime, venue, capacity] of events) {
    await r.eventRepository.create(new Event({
      title, type, society, date: dayFromNow(days), startTime, endTime, venue, capacity,
      description: `${title} organized by ${society}.`, organizerId: organizer.id,
    }));
  }
  return true;
}

module.exports = { seedIfEmpty, ensureDefaultAdmin, DEMO_PASSWORD, ADMIN_USERNAME, ADMIN_PASSWORD };

if (require.main === module) {
  const fs = require('fs');
  const { loadConfig } = require('../config');
  const { Database } = require('./Database');
  const { createContainer } = require('../container');
  const config = loadConfig();
  if (process.argv.includes('--reset') && fs.existsSync(config.dbFile)) fs.unlinkSync(config.dbFile);
  const container = createContainer({ db: Database.getInstance({ file: config.dbFile }), config });
  seedIfEmpty(container).then(async (seeded) => {
    await ensureDefaultAdmin(container);
    console.log(seeded ? `Seeded demo data. Admin: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}. Others: ${DEMO_PASSWORD}` : 'Database already has data; use --reset to start over.');
  });
}
