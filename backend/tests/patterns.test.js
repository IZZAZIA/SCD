const test = require('node:test');
const assert = require('node:assert/strict');
const { Database } = require('../src/database/Database');
const EventBus = require('../src/events/EventBus');
const UserFactory = require('../src/factories/UserFactory');
const NotificationFactory = require('../src/factories/NotificationFactory');
const { Student, Organizer, Admin } = require('../src/models/User');
const { RejectConflictStrategy, WarnConflictStrategy } = require('../src/strategies/conflict');
const EventFilter = require('../src/strategies/filter/EventFilter');
const { ROLES, PERMISSIONS: P, NOTIFICATION_TYPES: T } = require('../src/models/constants');

test('Singleton: Database and EventBus always return the same instance', () => {
  assert.equal(Database.getInstance(), Database.getInstance());
  assert.equal(EventBus.getInstance(), EventBus.getInstance());
  assert.equal(new EventBus(), EventBus.getInstance());
});

test('Factory: UserFactory builds the right role with the right permissions', () => {
  const s = UserFactory.create(ROLES.STUDENT, { name: 'S', email: 's@x.edu' });
  const o = UserFactory.create(ROLES.ORGANIZER, { name: 'O', email: 'o@x.edu' });
  const a = UserFactory.create(ROLES.ADMIN, { name: 'A', email: 'a@x.edu' });
  assert.ok(s instanceof Student && o instanceof Organizer && a instanceof Admin);
  assert.equal(s.can(P.EVENT_REGISTER), true);
  assert.equal(s.can(P.EVENT_CREATE), true, 'students act for their society');
  assert.equal(a.can(P.EVENT_REGISTER) || a.can(P.BOOKING_REQUEST) || a.can(P.NOTIFICATION_VIEW), false);
  assert.equal(o.can(P.BOOKING_REQUEST), true);
  assert.equal(a.can(P.USER_MANAGE), true);
  assert.throws(() => UserFactory.create('janitor', {}), /Unknown role/);
});

test('Factory: user JSON never exposes the password hash', () => {
  const u = UserFactory.create(ROLES.STUDENT, { name: 'S', email: 's@x.edu', passwordHash: 'secret' });
  assert.equal(JSON.stringify(u).includes('secret'), false);
});

test('Factory: NotificationFactory writes the right message per type', () => {
  const event = { title: 'Hack Night', date: '2030-01-01', startTime: '10:00', endTime: '12:00', venue: 'Lab 1' };
  const n = NotificationFactory.create(T.EVENT_REMINDER, 5, { event });
  assert.equal(n.userId, 5);
  assert.match(n.message, /Hack Night/);
  assert.equal(NotificationFactory.createMany(T.EVENT_CANCELLED, [1, 1, 2], { event }).length, 2, 'duplicates removed');
  assert.throws(() => NotificationFactory.create('NOPE', 1, {}), /Unknown notification type/);
});

test('Observer: subscribers are notified, can unsubscribe, and failures are isolated', async () => {
  const bus = EventBus.getInstance();
  bus.clear();
  const seen = [];
  const good = { update: (topic, payload) => seen.push([topic, payload]) };
  const bad = { update: () => { throw new Error('boom'); } };
  const originalError = console.error;
  console.error = () => {};
  const unsubscribe = bus.subscribe(['a.b'], bad);
  bus.subscribe(['a.b'], good);
  await bus.publish('a.b', { x: 1 });
  assert.deepEqual(seen, [['a.b', { x: 1 }]]);
  unsubscribe();
  await bus.publish('a.b', { x: 2 });
  assert.equal(seen.length, 2);
  console.error = originalError;
  bus.clear();
});

test('Strategy: reject blocks overlaps, warn allows them with a warning', () => {
  const resource = { name: 'Hall' };
  const clash = [{ id: 1 }];
  assert.equal(new RejectConflictStrategy().evaluate([], resource).allowed, true);
  const rejected = new RejectConflictStrategy().evaluate(clash, resource);
  assert.equal(rejected.allowed, false);
  assert.match(rejected.reason, /already booked/);
  const warned = new WarnConflictStrategy().evaluate(clash, resource);
  assert.equal(warned.allowed, true);
  assert.equal(warned.warnings.length, 1);
});

test('Strategy: EventFilter applies date, category and society filters together', () => {
  const events = [
    { type: 'Seminar', society: 'Computing Society', date: '2030-01-01' },
    { type: 'Seminar', society: 'Arts Society', date: '2030-01-02' },
    { type: 'Sports', society: 'Computing Society', date: '2030-01-01' },
  ];
  const f = new EventFilter();
  assert.equal(f.apply(events, {}).length, 3);
  assert.equal(f.apply(events, { category: 'seminar' }).length, 2);
  assert.equal(f.apply(events, { society: 'computing' }).length, 2);
  assert.equal(f.apply(events, { category: 'Seminar', date: '2030-01-01', society: 'Computing' }).length, 1);
});
