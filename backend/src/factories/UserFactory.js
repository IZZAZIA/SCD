// DESIGN PATTERN: FACTORY
// Callers ask for a role; the factory returns the right User subclass with that role's permissions.
// Used by AuthService (register), UserService (admin creates users), UserRepository (rebuilding rows).
const { ROLES } = require('../models/constants');
const { Student, Organizer, ResourceManager, Admin } = require('../models/User');
const { ValidationError } = require('../utils/errors');

const REGISTRY = {
  [ROLES.STUDENT]: Student,
  [ROLES.ORGANIZER]: Organizer,
  [ROLES.RESOURCE_MANAGER]: ResourceManager,
  [ROLES.ADMIN]: Admin,
};

class UserFactory {
  static create(role, data) {
    const UserClass = REGISTRY[role];
    if (!UserClass) throw new ValidationError(`Unknown role "${role}". Use: ${Object.keys(REGISTRY).join(', ')}.`);
    return new UserClass(data);
  }
  static roles() { return Object.keys(REGISTRY); }
}
module.exports = UserFactory;
