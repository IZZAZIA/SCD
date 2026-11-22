const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp, makeUser, makeResource, eventData, ROLES } = require('./helpers');

async function setup(config) {
  const app = buildApp(config);
  const org = await makeUser(app, ROLES.ORGANIZER, 'org');
  const manager = await makeUser(app, ROLES.RESOURCE_MANAGER, 'mgr');
  const hall = await makeResource(app, 'Main Hall');
  const e1 = await app.services.events.create(org, eventData({ title: 'Event 1' }));
  const e2 = await app.services.events.create(org, eventData({ title: 'Event 2' })); // same slot as e1
  return { app, org, manager, hall, e1, e2 };
}

test('FR-10/13: a booking request starts as Pending and managers are notified', async () => {
  const { app, org, manager, hall, e1 } = await setup();
  const { bookings } = await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  assert.equal(bookings[0].status, 'Pending');
  assert.equal(bookings[0].resourceName, 'Main Hall');
  const { items } = await app.services.notifications.listFor(manager);
  assert.match(items[0].message, /New booking request/);
});

test('FR-11: overlapping bookings are rejected (Reject strategy)', async () => {
  const { app, org, hall, e1, e2 } = await setup({ conflictStrategy: 'reject' });
  await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  await assert.rejects(app.services.bookings.request(org, { eventId: e2.id, resourceIds: [hall.id] }), /already booked/);
});

test('FR-11: overlapping bookings only warn under the Warn strategy', async () => {
  const { app, org, hall, e1, e2 } = await setup({ conflictStrategy: 'warn' });
  await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  const { warnings } = await app.services.bookings.request(org, { eventId: e2.id, resourceIds: [hall.id] });
  assert.equal(warnings.length, 1);
});

test('FR-11: back-to-back bookings (end = next start) do not clash', async () => {
  const { app, org, hall, e1 } = await setup();
  const later = await app.services.events.create(org, eventData({ startTime: '12:00', endTime: '13:00' }));
  await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  await app.services.bookings.request(org, { eventId: later.id, resourceIds: [hall.id] });
});

test('FR-10: requesting several resources is all-or-nothing (transaction rollback)', async () => {
  const { app, org, hall, e1, e2 } = await setup();
  const projector = await makeResource(app, 'Projector');
  await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [projector.id] });
  await assert.rejects(app.services.bookings.request(org, { eventId: e2.id, resourceIds: [hall.id, projector.id] }));
  assert.equal((await app.services.bookings.listAll()).length, 1, 'the hall booking was rolled back');
});

test('FR-14/16: a manager approves with remarks and the organizer is notified', async () => {
  const { app, org, manager, hall, e1 } = await setup();
  const { bookings } = await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  const approved = await app.services.bookings.review(manager, bookings[0].id, { decision: 'approve', remarks: 'Enjoy!' });
  assert.equal(approved.status, 'Approved');
  assert.match((await app.services.notifications.listFor(org)).items[0].message, /Approved.*Enjoy!/);
});

test('FR-14: rejecting needs remarks, and a decided request cannot change again (FR-13)', async () => {
  const { app, org, manager, hall, e1 } = await setup();
  const { bookings } = await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  await assert.rejects(app.services.bookings.review(manager, bookings[0].id, { decision: 'reject' }), /remarks/);
  await app.services.bookings.review(manager, bookings[0].id, { decision: 'reject', remarks: 'Maintenance' });
  await assert.rejects(app.services.bookings.review(manager, bookings[0].id, { decision: 'approve' }), /rejected request cannot be approved/);
});

test('FR-14: two clashing pending requests cannot both be approved', async () => {
  const { app, org, manager, hall, e1, e2 } = await setup({ conflictStrategy: 'warn' });
  const a = (await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] })).bookings[0];
  const b = (await app.services.bookings.request(org, { eventId: e2.id, resourceIds: [hall.id] })).bookings[0];
  await app.services.bookings.review(manager, a.id, { decision: 'approve' });
  await assert.rejects(app.services.bookings.review(manager, b.id, { decision: 'approve' }), /already approved/);
});

test('FR-15: organizers track and cancel their own requests; others cannot see them', async () => {
  const { app, org, hall, e1 } = await setup();
  const stranger = await makeUser(app, ROLES.ORGANIZER, 'stranger');
  const { bookings } = await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  assert.equal((await app.services.bookings.listMine(org)).length, 1);
  await assert.rejects(app.services.bookings.getById(stranger, bookings[0].id), /cannot view/);
  assert.equal((await app.services.bookings.cancel(org, bookings[0].id)).status, 'Cancelled');
});

test('Organizers cannot book resources for someone else\'s event; unavailable resources are refused', async () => {
  const { app, hall, e1 } = await setup();
  const stranger = await makeUser(app, ROLES.ORGANIZER, 'stranger2');
  await assert.rejects(app.services.bookings.request(stranger, { eventId: e1.id, resourceIds: [hall.id] }), /own events/);
  const owner = await makeUser(app, ROLES.ORGANIZER, 'o3');
  const mine = await app.services.events.create(owner, eventData());
  await app.services.resources.update(hall.id, { status: 'maintenance' });
  await assert.rejects(app.services.bookings.request(owner, { eventId: mine.id, resourceIds: [hall.id] }), /not available/);
});

test('FR-9: resource availability reflects approved bookings in real time', async () => {
  const { app, org, manager, hall, e1 } = await setup();
  const { bookings } = await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  await app.services.bookings.review(manager, bookings[0].id, { decision: 'approve' });
  const day = await app.services.resources.getAvailability(hall.id, e1.date);
  assert.equal(day.busySlots.length, 1);
  assert.equal(day.busySlots[0].eventTitle, 'Event 1');
  assert.equal((await app.services.resources.list())[0].availableNow, true, 'not in use right now');
});

test('Reports: utilization counts approved hours and participation counts registrations', async () => {
  const { app, org, manager, hall, e1 } = await setup();
  const student = await makeUser(app);
  const { bookings } = await app.services.bookings.request(org, { eventId: e1.id, resourceIds: [hall.id] });
  await app.services.bookings.review(manager, bookings[0].id, { decision: 'approve' });
  await app.services.registrations.register(student, e1.id);
  const [row] = await app.services.reports.resourceUtilization();
  assert.equal(row.approvedBookings, 1);
  assert.equal(row.hoursBooked, 2);
  const part = (await app.services.reports.eventParticipation()).find((p) => p.eventId === e1.id);
  assert.equal(part.registered, 1);
  assert.equal(part.fillRate, 50);
});
