const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp, makeUser, makeResource, eventData, ROLES } = require('./helpers');
const { ensureDefaultAdmin, ADMIN_USERNAME, ADMIN_PASSWORD } = require('../src/database/seed');
const EventFilter = require('../src/strategies/filter/EventFilter');

test('FR-1: the built-in admin signs in with a username on the Admin tab (and the seed is idempotent)', async () => {
  const app = buildApp();
  assert.equal(await ensureDefaultAdmin(app), true);
  assert.equal(await ensureDefaultAdmin(app), false);
  const { user } = await app.services.auth.login({ identifier: ADMIN_USERNAME, password: ADMIN_PASSWORD, portal: 'admin' });
  assert.equal(user.role, ROLES.ADMIN);
  assert.equal(user.username, ADMIN_USERNAME);
});

test('FR-2: students cannot use the Admin tab and admins cannot use the Student tab', async () => {
  const app = buildApp();
  await ensureDefaultAdmin(app);
  await app.services.auth.register({ name: 'Sana', email: 'sana@campus.edu', password: 'Password1' });
  await assert.rejects(app.services.auth.login({ identifier: 'sana@campus.edu', password: 'Password1', portal: 'admin' }), /not an admin account/);
  await assert.rejects(app.services.auth.login({ identifier: ADMIN_USERNAME, password: ADMIN_PASSWORD, portal: 'student' }), /Admin tab/);
  await assert.rejects(app.services.auth.login({ identifier: ADMIN_USERNAME, password: 'wrong', portal: 'admin' }), /Incorrect login details/);
});

test('Profile: users can rename themselves and change their password', async () => {
  const app = buildApp();
  const { user } = await app.services.auth.register({ name: 'Sana', email: 'sana@campus.edu', password: 'Password1' });
  const updated = await app.services.auth.updateProfile(user, { name: 'Sana Khan' });
  assert.equal(updated.name, 'Sana Khan');
  const fresh = await app.repositories.userRepository.findById(user.id);
  await assert.rejects(app.services.auth.changePassword(fresh, { currentPassword: 'bad', newPassword: 'NewPass123' }), /current password is incorrect/);
  await app.services.auth.changePassword(fresh, { currentPassword: 'Password1', newPassword: 'NewPass123' });
  await app.services.auth.login({ identifier: 'sana@campus.edu', password: 'NewPass123' });
  await assert.rejects(app.services.auth.login({ identifier: 'sana@campus.edu', password: 'Password1' }), /Incorrect/);
});

test('FR-3: admin can give users a username and usernames are unique', async () => {
  const app = buildApp();
  const admin = await makeUser(app, ROLES.ADMIN);
  const a = await app.services.users.create({ name: 'A', email: 'a@campus.edu', password: 'Password1', role: ROLES.RESOURCE_MANAGER, username: 'mgr1' });
  assert.equal(a.username, 'mgr1');
  await assert.rejects(app.services.users.create({ name: 'B', email: 'b@campus.edu', password: 'Password1', role: ROLES.STUDENT, username: 'MGR1' }), /already taken/);
  await app.services.users.update(admin, a.id, { username: 'manager-one' });
});

test('FR-6: keyword search filters events by title, venue or society', () => {
  const events = [
    { title: 'AI Seminar', description: '', venue: 'Hall', society: 'Computing', type: 'Seminar', date: 'd' },
    { title: 'Cricket', description: '', venue: 'Ground', society: 'Sports', type: 'Sports', date: 'd' },
  ];
  assert.equal(new EventFilter().apply(events, { search: 'ground' }).length, 1);
  assert.equal(new EventFilter().apply(events, { search: 'ai', category: 'Seminar' }).length, 1);
});

test('FR-11: booking a resource smaller than the event gives a capacity warning', async () => {
  const app = buildApp();
  const org = await makeUser(app, ROLES.ORGANIZER);
  const event = await app.services.events.create(org, eventData({ capacity: 500 }));
  const small = await makeResource(app, 'Small Room'); // seats 100
  const { warnings } = await app.services.bookings.request(org, { eventId: event.id, resourceIds: [small.id] });
  assert.match(warnings[0], /seats 100 but the event expects 500/);
});
