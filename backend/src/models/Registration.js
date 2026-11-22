const BaseModel = require('./BaseModel');

class Registration extends BaseModel {
  constructor({ id = null, eventId, studentId, registeredOn = new Date().toISOString(), attended = false }) {
    super();
    Object.assign(this, { id, eventId, studentId, registeredOn, attended });
  }
}
module.exports = Registration;
