const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp, makeUser, eventData, ROLES } = require('./helpers');

async function setup(capacity = 2) {
  const app = buildApp();
  const org = await makeUser(app, ROLES.ORGANIZER);
  const event = await app.services.events.create(org, eventData({ capacity }));
  return { app, org, event };
}

test('FR-7: students register within capacity and are refused when the event is full', async () => {
  const { app, event } = await setup(2);
  const [a, b, c] = await Promise.all([ROLES.STUDENT, ROLES.STUDENT, ROLES.STUDENT].map((r) => makeUser(app, r)));
  await app.services.registrations.register(a, event.id);
  await app.services.registrations.register(b, event.id);
  await assert.rejects(app.services.registrations.register(c, event.id), /event is full/);
  assert.equal((await app.services.events.get(event.id)).seatsLeft, 0);
});

test('FR-7: duplicate registration is refused and unregistering frees a seat', async () => {
  const { app, event } = await setup(1);
  const a = await makeUser(app);
  const b = await makeUser(app);
  await app.services.registrations.register(a, event.id);
  await assert.rejects(app.services.registrations.register(a, event.id), /already registered/);
  await app.services.registrations.unregister(a, event.id);
  await app.services.registrations.register(b, event.id);
  assert.equal((await app.services.registrations.listMine(b)).length, 1);
});

test('FR-7: simultaneous sign-ups never exceed capacity (transaction)', async () => {
  const { app, event } = await setup(1);
  const students = await Promise.all([1, 2, 3, 4].map(() => makeUser(app)));
  const results = await Promise.allSettled(students.map((s) => app.services.registrations.register(s, event.id)));
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
});

test('Organizer sees attendees and records attendance; others cannot', async () => {
  const { app, org, event } = await setup();
  const student = await makeUser(app);
  await app.services.registrations.register(student, event.id);
  await assert.rejects(app.services.registrations.listAttendees(student, event.id), /Only the organizer/);
  await app.services.registrations.markAttendance(org, event.id, student.id, true);
  const [row] = await app.services.registrations.listAttendees(org, event.id);
  assert.equal(row.attended, true);
  assert.equal(row.studentName, student.name);
});
