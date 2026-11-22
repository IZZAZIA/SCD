const BaseModel = require('./BaseModel');
const { ROLES, PERMISSIONS: P, USER_STATUS } = require('./constants');

class User extends BaseModel {
  constructor({ id = null, name, email, username = '', passwordHash, role, status = USER_STATUS.ACTIVE, createdAt = new Date().toISOString() }) {
    super();
    Object.assign(this, { id, name, email, username, passwordHash, role, status, createdAt });
  }
  get permissions() { return this.constructor.PERMISSIONS; }
  can(permission) { return this.permissions.includes(permission); }
  isActive() { return this.status === USER_STATUS.ACTIVE; }
  // The password hash never leaves the server.
  toJSON() {
    return { id: this.id, name: this.name, email: this.email, username: this.username, role: this.role, status: this.status, createdAt: this.createdAt, permissions: this.permissions };
  }
}
User.PERMISSIONS = Object.freeze([]);

// Role-specific products created by UserFactory (Factory pattern). Each role owns its permission set (FR-2).
class Student extends User {
  constructor(data) { super({ ...data, role: ROLES.STUDENT }); }
}
// Students also act for their society: they create events and request rooms/equipment (FR-4, FR-10).
Student.PERMISSIONS = Object.freeze([
  P.EVENT_VIEW, P.EVENT_REGISTER, P.EVENT_CREATE, P.EVENT_MANAGE, P.RESOURCE_VIEW, P.BOOKING_REQUEST, P.NOTIFICATION_VIEW,
]);

class Organizer extends User {
  constructor(data) { super({ ...data, role: ROLES.ORGANIZER }); }
}
Organizer.PERMISSIONS = Object.freeze([
  P.EVENT_VIEW, P.EVENT_CREATE, P.EVENT_MANAGE, P.RESOURCE_VIEW, P.BOOKING_REQUEST, P.NOTIFICATION_VIEW,
]);

class ResourceManager extends User {
  constructor(data) { super({ ...data, role: ROLES.RESOURCE_MANAGER }); }
}
ResourceManager.PERMISSIONS = Object.freeze([
  P.EVENT_VIEW, P.RESOURCE_VIEW, P.RESOURCE_MANAGE, P.BOOKING_REVIEW, P.BOOKING_VIEW_ALL, P.REPORT_VIEW, P.NOTIFICATION_VIEW,
]);

class Admin extends User {
  constructor(data) { super({ ...data, role: ROLES.ADMIN }); }
}
// The admin approves requests and sends reminders; admins do not register for events, request rooms or receive alerts.
Admin.PERMISSIONS = Object.freeze(Object.values(P).filter((p) => ![P.EVENT_REGISTER, P.BOOKING_REQUEST, P.NOTIFICATION_VIEW].includes(p)));

module.exports = { User, Student, Organizer, ResourceManager, Admin };
