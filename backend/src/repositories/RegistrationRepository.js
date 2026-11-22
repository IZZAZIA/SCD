const BaseRepository = require('./BaseRepository');
const Registration = require('../models/Registration');

class RegistrationRepository extends BaseRepository {
  constructor(db) { super(db, 'registrations', Registration); }
  findByEvent(eventId) { return this.findWhere((r) => r.eventId === Number(eventId)); }
  findByStudent(studentId) { return this.findWhere((r) => r.studentId === studentId); }
  findOneFor(eventId, studentId) { return this.findOne((r) => r.eventId === Number(eventId) && r.studentId === studentId); }
  countByEvent(eventId) { return this.count((r) => r.eventId === Number(eventId)); }
}
module.exports = RegistrationRepository;
