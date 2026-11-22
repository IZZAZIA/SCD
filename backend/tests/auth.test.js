const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp, makeUser, ROLES } = require('./helpers');

test('FR-1: a student can register and then log in', async () => {
  const app = buildApp();
  const { user, token } = await app.services.auth.register({ name: 'Ayesha', email: 'Ayesha@Campus.edu', password: 'Password1' });
  assert.equal(user.role, ROLES.STUDENT);
  assert.equal(user.email, 'ayesha@campus.edu');
  assert.ok(token);
  const login = await app.services.auth.login({ email: 'ayesha@campus.edu', password: 'Password1' });
  assert.equal((await app.services.auth.authenticate(login.token)).id, user.id);
});

test('FR-1: bad passwords, duplicate emails and weak passwords are refused', async () => {
  const app = buildApp();
  await app.services.auth.register({ name: 'A', email: 'a@campus.edu', password: 'Password1' });
  await assert.rejects(app.services.auth.login({ email: 'a@campus.edu', password: 'nope' }), /Incorrect login details/);
  await assert.rejects(app.services.auth.register({ name: 'B', email: 'a@campus.edu', password: 'Password1' }), /already exists/);
  await assert.rejects(app.services.auth.register({ name: 'B', email: 'b@campus.edu', password: 'short' }), /at least 8/);
});

test('FR-3: admin can create, deactivate and delete users; deactivated users cannot log in', async () => {
  const app = buildApp();
  const admin = await makeUser(app, ROLES.ADMIN);
  const created = await app.services.users.create({ name: 'Omar', email: 'omar@campus.edu', password: 'Password1', role: ROLES.ORGANIZER });
  assert.equal(created.role, ROLES.ORGANIZER);
  await app.services.users.deactivate(admin, created.id);
  await assert.rejects(app.services.auth.login({ email: 'omar@campus.edu', password: 'Password1' }), /deactivated/);
  await assert.rejects(app.services.users.deactivate(admin, admin.id), /cannot deactivate or demote/);
  assert.deepEqual(await app.services.users.remove(admin, created.id), { deleted: true });
});

test('FR-2: each role only holds the permissions it needs', async () => {
  const app = buildApp();
  const student = await makeUser(app, ROLES.STUDENT);
  const manager = await makeUser(app, ROLES.RESOURCE_MANAGER);
  assert.equal(student.can('booking.request'), true);
  assert.equal(manager.can('booking.review'), true);
  assert.equal(manager.can('user.manage'), false);
});
