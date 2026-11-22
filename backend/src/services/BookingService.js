// FR-10 to FR-15: booking requests, conflict detection and the approval workflow.
const Booking = require('../models/Booking');
const TOPICS = require('../events/topics');
const { BOOKING_STATUS: S, PERMISSIONS: P } = require('../models/constants');
const { isBlank } = require('../utils/validators');
const { ValidationError, ForbiddenError, NotFoundError, ConflictError } = require('../utils/errors');

class BookingService {
  constructor({ db, bookingRepository, eventRepository, resourceRepository, userRepository, conflictDetector, eventBus }) {
    this.db = db;
    this.bookings = bookingRepository;
    this.events = eventRepository;
    this.resources = resourceRepository;
    this.users = userRepository;
    this.detector = conflictDetector;
    this.bus = eventBus;
  }

  async _load(id) {
    const b = await this.bookings.findById(id);
    if (!b) throw new NotFoundError('Booking request not found.');
    return b;
  }

  async _present(b) {
    const [event, resource, requester] = await Promise.all([
      this.events.findById(b.eventId), this.resources.findById(b.resourceId), this.users.findById(b.requestedBy),
    ]);
    return { ...b, eventTitle: event?.title, eventDate: event?.date, resourceName: resource?.name, requesterName: requester?.name };
  }

  // FR-10 + FR-11: request one or more resources. All-or-nothing: one clash cancels the whole request.
  async request(user, { eventId, resourceIds, startTime, endTime } = {}) {
    if (!user.can(P.BOOKING_REQUEST)) throw new ForbiddenError('Only students and organizers can request resources.');
    const ids = [...new Set([].concat(resourceIds ?? []).filter((x) => x !== '' && x !== null).map(Number))];
    if (!ids.length || ids.some(Number.isNaN)) throw new ValidationError('Select at least one resource.');
    const event = await this.events.findById(eventId);
    if (!event) throw new NotFoundError('Event not found.');
    if (event.organizerId !== user.id && !user.can(P.EVENT_MANAGE_ANY)) throw new ForbiddenError('You can only request resources for your own events.');
    if (event.isCancelled()) throw new ConflictError('This event is cancelled.');

    const start = startTime ? new Date(startTime) : event.startsAt();
    const end = endTime ? new Date(endTime) : event.endsAt();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new ValidationError('Invalid start or end time.');
    if (end <= start) throw new ValidationError('The booking must end after it starts.');

    const { created, resources, warnings } = await this.db.transaction(async () => {
      const out = { created: [], resources: [], warnings: [] };
      for (const rid of ids) {
        const resource = await this.resources.findById(rid);
        if (!resource) throw new NotFoundError(`Resource ${rid} not found.`);
        if (!resource.isBookable()) throw new ConflictError(`${resource.name} is not available for booking (${resource.status}).`);
        const verdict = await this.detector.check(resource, start, end);
        if (!verdict.allowed) throw new ConflictError(verdict.reason, { resourceId: rid, conflictingBookingIds: verdict.conflicts.map((c) => c.id) });
        out.warnings.push(...verdict.warnings);
        if (resource.capacity && resource.capacity < event.capacity) {
          out.warnings.push(`${resource.name} seats ${resource.capacity} but the event expects ${event.capacity}.`);
        }
        out.created.push(await this.bookings.create(new Booking({
          eventId: event.id, resourceId: rid, startTime: start.toISOString(), endTime: end.toISOString(), requestedBy: user.id,
        })));
        out.resources.push(resource);
      }
      return out;
    });

    await this.bus.publish(TOPICS.BOOKING_REQUESTED, { bookings: created, event, resources, requester: user });
    return { bookings: await Promise.all(created.map((b) => this._present(b))), warnings };
  }

  // FR-13 + FR-14: Pending -> Approved / Rejected, with remarks. Re-checks clashes atomically on approval.
  async review(reviewer, id, { decision, remarks = '' } = {}) {
    const target = { approve: S.APPROVED, reject: S.REJECTED }[decision];
    if (!target) throw new ValidationError('Decision must be "approve" or "reject".');
    if (target === S.REJECTED && isBlank(remarks)) throw new ValidationError('Add remarks explaining why the request is rejected.');

    const { updated, event, resource } = await this.db.transaction(async () => {
      const booking = await this._load(id);
      if (!booking.canTransitionTo(target)) throw new ConflictError(`A ${booking.status.toLowerCase()} request cannot be ${target.toLowerCase()}.`);
      const resource = await this.resources.findById(booking.resourceId);
      if (target === S.APPROVED) {
        if (!resource.isBookable()) throw new ConflictError(`${resource.name} is currently ${resource.status} and cannot be approved.`);
        const clashes = await this.detector.findConflicts(booking.resourceId, booking.startTime, booking.endTime, {
          excludeBookingId: booking.id, statuses: [S.APPROVED],
        });
        if (clashes.length) throw new ConflictError(`Cannot approve: ${resource.name} is already approved for another event in that slot.`, { conflictingBookingIds: clashes.map((c) => c.id) });
      }
      const updated = await this.bookings.update(id, { status: target, remarks: String(remarks).trim(), reviewedBy: reviewer.id });
      return { updated, event: await this.events.findById(booking.eventId), resource };
    });

    await this.bus.publish(target === S.APPROVED ? TOPICS.BOOKING_APPROVED : TOPICS.BOOKING_REJECTED, {
      booking: updated, event, resource, remarks: updated.remarks, reviewer,
    });
    return this._present(updated);
  }

  async cancel(user, id) {
    const { updated, event, resource } = await this.db.transaction(async () => {
      const booking = await this._load(id);
      if (booking.requestedBy !== user.id && !user.can(P.BOOKING_REVIEW)) throw new ForbiddenError('You can only cancel your own requests.');
      if (!booking.canTransitionTo(S.CANCELLED)) throw new ConflictError(`A ${booking.status.toLowerCase()} request cannot be cancelled.`);
      const updated = await this.bookings.update(id, { status: S.CANCELLED });
      return { updated, event: await this.events.findById(booking.eventId), resource: await this.resources.findById(booking.resourceId) };
    });
    await this.bus.publish(TOPICS.BOOKING_CANCELLED, { booking: updated, event, resource, cancelledBy: user });
    return this._present(updated);
  }

  // FR-15: organizers track their own requests; reviewers see everything.
  async listMine(user) {
    const list = (await this.bookings.findByRequester(user.id)).sort((a, b) => b.id - a.id);
    return Promise.all(list.map((b) => this._present(b)));
  }

  async listAll({ status } = {}) {
    let list = await this.bookings.findAll();
    if (status) list = list.filter((b) => b.status === status);
    return Promise.all(list.sort((a, b) => b.id - a.id).map((b) => this._present(b)));
  }

  async getById(user, id) {
    const booking = await this._load(id);
    if (booking.requestedBy !== user.id && !user.can(P.BOOKING_VIEW_ALL)) throw new ForbiddenError('You cannot view this request.');
    return this._present(booking);
  }
}
module.exports = BookingService;
