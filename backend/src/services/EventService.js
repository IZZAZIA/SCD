// FR-4, FR-5, FR-6: create, edit, cancel and browse events.
const Event = require('../models/Event');
const TOPICS = require('../events/topics');
const EventFilter = require('../strategies/filter/EventFilter');
const { PERMISSIONS: P, BOOKING_STATUS: S, EVENT_STATUS, SOCIETIES } = require('../models/constants');
const { requireFields, isDate, isTime, isBlank } = require('../utils/validators');
const { combine } = require('../utils/time');
const { ValidationError, ForbiddenError, NotFoundError, ConflictError } = require('../utils/errors');

const FIELDS = ['title', 'description', 'type', 'society', 'date', 'startTime', 'endTime', 'venue', 'capacity'];
const pick = (src, keys) => Object.fromEntries(keys.filter((k) => src[k] !== undefined).map((k) => [k, src[k]]));
const truthy = (v) => v === true || v === 'true';

class EventService {
  constructor({ db, eventRepository, registrationRepository, bookingRepository, eventBus, eventFilter = new EventFilter() }) {
    this.db = db;
    this.events = eventRepository;
    this.registrations = registrationRepository;
    this.bookings = bookingRepository;
    this.bus = eventBus;
    this.filter = eventFilter;
  }

  _validate(f) {
    requireFields(f, ['title', 'type', 'date', 'startTime', 'endTime', 'venue', 'capacity']);
    if (!isDate(f.date)) throw new ValidationError('Date must look like 2026-12-31.');
    if (!isTime(f.startTime) || !isTime(f.endTime)) throw new ValidationError('Times must look like 14:30.');
    if (f.endTime <= f.startTime) throw new ValidationError('The event must end after it starts.');
    const capacity = Number(f.capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) throw new ValidationError('Capacity must be a whole number greater than 0.');
    if (isBlank(f.title) || isBlank(f.venue)) throw new ValidationError('Title and venue cannot be blank.');
  }

  _checkSociety(society) {
    if (society && !SOCIETIES.includes(society)) throw new ValidationError('Choose a society from the list.');
  }

  _assertCanManage(user, event) {
    if (user.can(P.EVENT_MANAGE_ANY)) return;
    if (user.can(P.EVENT_MANAGE) && event.organizerId === user.id) return;
    throw new ForbiddenError('Only the organizer of this event can change it.');
  }

  async _load(id) {
    const event = await this.events.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  async _present(event) {
    const registeredCount = await this.registrations.countByEvent(event.id);
    return { ...event, registeredCount, seatsLeft: Math.max(0, event.capacity - registeredCount) };
  }

  async create(user, data = {}) {
    const fields = { ...pick(data, FIELDS) };
    this._validate(fields);
    this._checkSociety(fields.society);
    if (combine(fields.date, fields.startTime) < new Date()) throw new ValidationError('The event must start in the future.');
    const event = new Event({ ...fields, organizerId: user.id });
    return this._present(await this.events.create(event));
  }

  async get(id) { return this._present(await this._load(id)); }

  // FR-6: upcoming events, filtered through the filter strategies.
  async list(query = {}) {
    const { includePast, includeCancelled, ...criteria } = query;
    const now = new Date();
    let events = await this.events.findAll();
    if (!truthy(includeCancelled)) events = events.filter((e) => !e.isCancelled());
    if (!truthy(includePast)) events = events.filter((e) => e.endsAt() >= now);
    events = this.filter.apply(events, criteria).sort((a, b) => a.startsAt() - b.startsAt());
    return Promise.all(events.map((e) => this._present(e)));
  }

  async listByOrganizer(user) {
    const events = (await this.events.findByOrganizer(user.id)).sort((a, b) => b.startsAt() - a.startsAt());
    return Promise.all(events.map((e) => this._present(e)));
  }

  // FR-5 + FR-18: editing the schedule notifies students and releases now-invalid resource bookings.
  async update(user, id, patch = {}) {
    const event = await this._load(id);
    this._assertCanManage(user, event);
    if (event.isCancelled()) throw new ConflictError('Cancelled events cannot be edited.');
    const next = { ...pick(event, FIELDS), ...pick(patch, FIELDS) };
    this._validate(next);
    if (patch.society !== undefined && patch.society !== event.society) this._checkSociety(next.society);
    next.capacity = Number(next.capacity);
    const registered = await this.registrations.countByEvent(id);
    if (next.capacity < registered) throw new ConflictError(`Capacity cannot be lower than the ${registered} students already registered.`);

    const rescheduled = ['date', 'startTime', 'endTime'].some((k) => next[k] !== event[k]);
    if (rescheduled && combine(next.date, next.startTime) < new Date()) throw new ValidationError('The new start time must be in the future.');

    let cancelledBookings = 0;
    const updated = await this.db.transaction(async () => {
      const saved = await this.events.update(id, { ...next, ...(rescheduled ? { reminderSent: false } : {}) });
      if (rescheduled) {
        const active = (await this.bookings.findByEvent(id)).filter((b) => b.isBlocking());
        for (const b of active) {
          await this.bookings.update(b.id, { status: S.CANCELLED, remarks: 'Cancelled automatically because the event was rescheduled. Request the resource again.' });
        }
        cancelledBookings = active.length;
      }
      return saved;
    });

    if (rescheduled) {
      await this.bus.publish(TOPICS.EVENT_RESCHEDULED, {
        event: updated,
        previous: { date: event.date, startTime: event.startTime, endTime: event.endTime },
      });
    }
    return { ...(await this._present(updated)), cancelledBookings };
  }

  // FR-5 + FR-18: cancelling notifies students and cancels the event's bookings.
  async cancel(user, id) {
    const event = await this._load(id);
    this._assertCanManage(user, event);
    if (event.isCancelled()) throw new ConflictError('This event is already cancelled.');
    const updated = await this.db.transaction(async () => {
      const saved = await this.events.update(id, { status: EVENT_STATUS.CANCELLED });
      for (const b of (await this.bookings.findByEvent(id)).filter((x) => x.isBlocking())) {
        await this.bookings.update(b.id, { status: S.CANCELLED, remarks: 'Event cancelled.' });
      }
      return saved;
    });
    await this.bus.publish(TOPICS.EVENT_CANCELLED, { event: updated });
    return this._present(updated);
  }
}
module.exports = EventService;
