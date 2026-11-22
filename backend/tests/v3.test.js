const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp, makeUser, makeResource, eventData, ROLES } = require('./helpers');
const { weekBounds } = require('../src/utils/time');
const { WeekFilterStrategy } = require('../src/strategies/filter/EventFilterStrategies');
const { SOCIETIES } = require('../src/models/constants');

test('A student (acting for a society) creates an event and requests a room; the admin cannot request', async () => {
  const app = buildApp();
  const student = await makeUser(app, ROLES.STUDENT);
  const admin = await makeUser(app, ROLES.ADMIN);
  const hall = await makeResource(app);
  const event = await app.services.events.create(student, eventData());
  const { bookings } = await app.services.bookings.request(student, { eventId: event.id, resourceIds: [hall.id] });
  assert.equal(bookings[0].status, 'Pending');
  await assert.rejects(app.services.bookings.request(admin, { eventId: event.id, resourceIds: [hall.id] }), /Only students and organizers/);
  assert.equal(admin.can('booking.request'), false);
});

test('Admin has no Register option and no notifications; admin is not alerted about new requests', async () => {
  const app = buildApp();
  const admin = await makeUser(app, ROLES.ADMIN);
  const manager = await makeUser(app, ROLES.RESOURCE_MANAGER);
  const student = await makeUser(app, ROLES.STUDENT);
  assert.equal(admin.can('event.register'), false);
  assert.equal(admin.can('notification.view'), false);
  assert.equal(admin.can('reminder.send'), true);
  const hall = await makeResource(app);
  const event = await app.services.events.create(student, eventData());
  await app.services.bookings.request(student, { eventId: event.id, resourceIds: [hall.id] });
  assert.equal((await app.services.notifications.listFor(admin)).items.length, 0);
  assert.equal((await app.services.notifications.listFor(manager)).items.length, 1);
});

test('Society must come from the predefined list', async () => {
  const app = buildApp();
  const student = await makeUser(app, ROLES.STUDENT);
  assert.equal(SOCIETIES.length, 8);
  await assert.rejects(app.services.events.create(student, eventData({ society: 'Made-up Club' })), /society from the list/);
  const ok = await app.services.events.create(student, eventData({ society: 'Baking Society' }));
  assert.equal(ok.society, 'Baking Society');
  await assert.rejects(app.services.events.update(student, ok.id, { society: 'Nope' }), /society from the list/);
});

test('Current week runs Monday to Sunday and the week filter keeps only those events', () => {
  assert.deepEqual(weekBounds(new Date('2026-11-22T12:00:00')), { start: '2026-11-16', end: '2026-11-22' }); // a Sunday
  assert.deepEqual(weekBounds(new Date('2026-11-16T08:00:00')), { start: '2026-11-16', end: '2026-11-22' }); // a Monday
  const { start, end } = weekBounds();
  const events = [{ date: start }, { date: end }, { date: '1999-01-01' }, { date: '2999-01-01' }];
  assert.equal(new WeekFilterStrategy().apply(events).length, 2);
});

test('Admin sends an in-app reminder to the registered students of an event, with a custom message', async () => {
  const app = buildApp();
  const admin = await makeUser(app, ROLES.ADMIN);
  const org = await makeUser(app, ROLES.ORGANIZER);
  const joined = await makeUser(app, ROLES.STUDENT);
  const other = await makeUser(app, ROLES.STUDENT);
  const event = await app.services.events.create(org, eventData());
  await app.services.registrations.register(joined, event.id);

  const result = await app.services.reminders.sendManual(admin, { eventId: event.id, message: 'Bring your ID card.' });
  assert.deepEqual(result, { sent: 1 });
  assert.match((await app.services.notifications.listFor(joined)).items[0].message, /Bring your ID card/);
  assert.equal((await app.services.notifications.listFor(other)).items.length, 0);
});

test('Admin can remind all students; empty audiences and bad input are refused', async () => {
  const app = buildApp();
  const admin = await makeUser(app, ROLES.ADMIN);
  const org = await makeUser(app, ROLES.ORGANIZER);
  const a = await makeUser(app, ROLES.STUDENT);
  const b = await makeUser(app, ROLES.STUDENT);
  const event = await app.services.events.create(org, eventData());
  await assert.rejects(app.services.reminders.sendManual(admin, { eventId: event.id }), /No students have registered/);
  assert.deepEqual(await app.services.reminders.sendManual(admin, { eventId: event.id, audience: 'all' }), { sent: 2 });
  assert.equal((await app.services.notifications.listFor(a)).items.length, 1);
  assert.equal((await app.services.notifications.listFor(b)).items.length, 1);
  await assert.rejects(app.services.reminders.sendManual(admin, {}), /Choose an event/);
  await assert.rejects(app.services.reminders.sendManual(admin, { eventId: event.id, audience: 'x' }), /Audience/);
  await app.services.events.cancel(org, event.id);
  await assert.rejects(app.services.reminders.sendManual(admin, { eventId: event.id, audience: 'all' }), /cancelled/);
});
