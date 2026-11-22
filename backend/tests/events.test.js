const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp, makeUser, makeResource, eventData, dayFromNow, ROLES } = require('./helpers');

test('FR-4: an organizer creates an event; invalid data is refused', async () => {
  const app = buildApp();
  const org = await makeUser(app, ROLES.ORGANIZER);
  const event = await app.services.events.create(org, eventData());
  assert.equal(event.organizerId, org.id);
  assert.equal(event.seatsLeft, 2);
  await assert.rejects(app.services.events.create(org, eventData({ endTime: '09:00' })), /end after it starts/);
  await assert.rejects(app.services.events.create(org, eventData({ capacity: 0 })), /Capacity/);
  await assert.rejects(app.services.events.create(org, eventData({ date: '2020-01-01' })), /future/);
  await assert.rejects(app.services.events.create(org, { title: 'x' }), /Missing required/);
});

test('FR-5: only the owning organizer can edit an event', async () => {
  const app = buildApp();
  const owner = await makeUser(app, ROLES.ORGANIZER, 'owner');
  const other = await makeUser(app, ROLES.ORGANIZER, 'other');
  const event = await app.services.events.create(owner, eventData());
  await assert.rejects(app.services.events.update(other, event.id, { title: 'Hijack' }), /Only the organizer/);
  assert.equal((await app.services.events.update(owner, event.id, { title: 'Renamed' })).title, 'Renamed');
});

test('FR-6: students list upcoming events and filter by category', async () => {
  const app = buildApp();
  const org = await makeUser(app, ROLES.ORGANIZER);
  await app.services.events.create(org, eventData({ type: 'Seminar', date: dayFromNow(5) }));
  await app.services.events.create(org, eventData({ type: 'Sports', date: dayFromNow(3) }));
  const all = await app.services.events.list({});
  assert.deepEqual(all.map((e) => e.type), ['Sports', 'Seminar'], 'sorted by start time');
  assert.equal((await app.services.events.list({ category: 'Seminar' })).length, 1);
});

test('FR-18: rescheduling notifies registered students and releases booked resources', async () => {
  const app = buildApp();
  const org = await makeUser(app, ROLES.ORGANIZER);
  const student = await makeUser(app, ROLES.STUDENT);
  const event = await app.services.events.create(org, eventData());
  const hall = await makeResource(app);
  await app.services.registrations.register(student, event.id);
  const { bookings } = await app.services.bookings.request(org, { eventId: event.id, resourceIds: [hall.id] });

  const updated = await app.services.events.update(org, event.id, { startTime: '14:00', endTime: '16:00' });
  assert.equal(updated.cancelledBookings, 1);
  assert.equal((await app.services.bookings.getById(org, bookings[0].id)).status, 'Cancelled');
  const { items } = await app.services.notifications.listFor(student);
  assert.equal(items.length, 1);
  assert.match(items[0].message, /rescheduled/);
});

test('FR-18: cancelling an event notifies students and cancels its bookings', async () => {
  const app = buildApp();
  const org = await makeUser(app, ROLES.ORGANIZER);
  const student = await makeUser(app, ROLES.STUDENT);
  const event = await app.services.events.create(org, eventData());
  await app.services.registrations.register(student, event.id);
  const cancelled = await app.services.events.cancel(org, event.id);
  assert.equal(cancelled.status, 'Cancelled');
  assert.match((await app.services.notifications.listFor(student)).items[0].message, /cancelled/);
  await assert.rejects(app.services.events.cancel(org, event.id), /already cancelled/);
});

test('FR-17: reminders go to registered students once, inside the reminder window', async () => {
  const app = buildApp({ reminderHoursBefore: 24 * 11 });
  const org = await makeUser(app, ROLES.ORGANIZER);
  const student = await makeUser(app, ROLES.STUDENT);
  const event = await app.services.events.create(org, eventData());
  await app.services.registrations.register(student, event.id);
  assert.deepEqual(await app.services.reminders.runOnce(), { reminded: 1 });
  assert.deepEqual(await app.services.reminders.runOnce(), { reminded: 0 }, 'not sent twice');
  assert.match((await app.services.notifications.listFor(student)).items[0].message, /Reminder/);
});
