class RegistrationController {
  constructor(registrationService) { this.registrations = registrationService; }
  register = async (req, res) => res.status(201).json(await this.registrations.register(req.user, req.body.eventId));
  unregister = async (req, res) => res.json(await this.registrations.unregister(req.user, req.params.eventId));
  mine = async (req, res) => res.json(await this.registrations.listMine(req.user));
  attendees = async (req, res) => res.json(await this.registrations.listAttendees(req.user, req.params.eventId));
  attendance = async (req, res) =>
    res.json(await this.registrations.markAttendance(req.user, req.params.eventId, req.params.studentId, req.body.attended));
}
module.exports = RegistrationController;
