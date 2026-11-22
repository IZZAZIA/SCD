// FR-7: students register / unregister within capacity limits.
const Registration = require('../models/Registration');
const { PERMISSIONS: P } = require('../models/constants');
const { ConflictError, NotFoundError, ForbiddenError } = require('../utils/errors');

class RegistrationService {
  constructor({ db, registrationRepository, eventRepository, userRepository }) {
    this.db = db;
    this.registrations = registrationRepository;
    this.events = eventRepository;
    this.users = userRepository;
  }

  async _event(id) {
    const e = await this.events.findById(id);
    if (!e) throw new NotFoundError('Event not found.');
    return e;
  }

  async register(student, eventId) {
    return this.db.transaction(async () => {
      const event = await this._event(eventId);
      if (event.isCancelled()) throw new ConflictError('This event has been cancelled.');
      if (event.startsAt() <= new Date()) throw new ConflictError('This event has already started.');
      if (await this.registrations.findOneFor(eventId, student.id)) throw new ConflictError('You are already registered for this event.');
      if ((await this.registrations.countByEvent(eventId)) >= event.capacity) throw new ConflictError('This event is full.');
      return this.registrations.create(new Registration({ eventId: event.id, studentId: student.id }));
    });
  }

  async unregister(student, eventId) {
    const reg = await this.registrations.findOneFor(eventId, student.id);
    if (!reg) throw new NotFoundError('You are not registered for this event.');
    await this.registrations.delete(reg.id);
    return { unregistered: true };
  }

  async listMine(student) {
    const regs = await this.registrations.findByStudent(student.id);
    const rows = [];
    for (const r of regs) {
      const event = await this.events.findById(r.eventId);
      if (event) rows.push({ ...r, event });
    }
    return rows.sort((a, b) => a.event.startsAt() - b.event.startsAt());
  }

  async _assertOrganizer(user, eventId) {
    const event = await this._event(eventId);
    if (event.organizerId !== user.id && !user.can(P.EVENT_MANAGE_ANY)) throw new ForbiddenError('Only the organizer can see attendees.');
    return event;
  }

  async listAttendees(user, eventId) {
    await this._assertOrganizer(user, eventId);
    const regs = await this.registrations.findByEvent(eventId);
    const rows = [];
    for (const r of regs) {
      const student = await this.users.findById(r.studentId);
      rows.push({ ...r, studentName: student?.name, studentEmail: student?.email });
    }
    return rows;
  }

  async markAttendance(user, eventId, studentId, attended = true) {
    await this._assertOrganizer(user, eventId);
    const reg = await this.registrations.findOneFor(eventId, Number(studentId));
    if (!reg) throw new NotFoundError('That student is not registered for this event.');
    return this.registrations.update(reg.id, { attended: attended === true || attended === 'true' });
  }
}
module.exports = RegistrationService;
