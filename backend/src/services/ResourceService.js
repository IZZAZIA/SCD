// FR-8, FR-9: resource records and real-time availability.
const Resource = require('../models/Resource');
const { RESOURCE_STATUS, BOOKING_STATUS: S } = require('../models/constants');
const { requireFields, isDate, isBlank } = require('../utils/validators');
const { dayBounds } = require('../utils/time');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class ResourceService {
  constructor({ resourceRepository, bookingRepository, eventRepository }) {
    this.resources = resourceRepository;
    this.bookings = bookingRepository;
    this.events = eventRepository;
  }

  _validate(f) {
    requireFields(f, ['name', 'type', 'location', 'capacity']);
    if (isBlank(f.name)) throw new ValidationError('Name cannot be blank.');
    const capacity = Number(f.capacity);
    if (!Number.isInteger(capacity) || capacity < 0) throw new ValidationError('Capacity must be a whole number (0 for equipment).');
    if (f.status && !Object.values(RESOURCE_STATUS).includes(f.status)) throw new ValidationError('Status must be available, maintenance or unavailable.');
  }

  async _load(id) {
    const r = await this.resources.findById(id);
    if (!r) throw new NotFoundError('Resource not found.');
    return r;
  }

  async _withAvailability(resource, now = new Date()) {
    const bookings = await this.bookings.findByResource(resource.id);
    const inUseNow = bookings.some((b) => b.status === S.APPROVED && b.overlaps(now, new Date(now.getTime() + 1)));
    return { ...resource, inUseNow, availableNow: resource.isBookable() && !inUseNow };
  }

  async create(data = {}) {
    this._validate(data);
    const { name, type, location, capacity, status } = data;
    return this.resources.create(new Resource({ name: name.trim(), type, location, capacity, status }));
  }

  async update(id, patch = {}) {
    const current = await this._load(id);
    const next = { ...current, ...patch };
    this._validate(next);
    const { name, type, location, capacity, status } = next;
    return this.resources.update(id, { name, type, location, capacity: Number(capacity), status });
  }

  async remove(id) {
    await this._load(id);
    const now = new Date();
    const active = (await this.bookings.findByResource(id)).filter((b) => b.isBlocking() && new Date(b.endTime) > now);
    if (active.length) throw new ConflictError('This resource has upcoming bookings. Mark it unavailable instead of deleting it.');
    await this.resources.delete(id);
    return { deleted: true };
  }

  // FR-9: availability is computed from live bookings on every request.
  async list() {
    const now = new Date();
    const all = await this.resources.findAll();
    return Promise.all(all.sort((a, b) => a.name.localeCompare(b.name)).map((r) => this._withAvailability(r, now)));
  }

  async getAvailability(id, date) {
    const resource = await this._load(id);
    if (!isDate(date)) throw new ValidationError('Pick a date like 2026-12-31.');
    const { start, end } = dayBounds(date);
    const busy = (await this.bookings.findByResource(id))
      .filter((b) => b.isBlocking() && b.overlaps(start, end))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const busySlots = [];
    for (const b of busy) {
      const event = await this.events.findById(b.eventId);
      busySlots.push({ bookingId: b.id, eventId: b.eventId, eventTitle: event?.title, startTime: b.startTime, endTime: b.endTime, status: b.status });
    }
    return { resource: await this._withAvailability(resource), date, busySlots };
  }
}
module.exports = ResourceService;
