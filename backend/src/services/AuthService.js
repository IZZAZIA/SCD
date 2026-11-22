// FR-1: secure registration and login (student and admin portals), plus profile management.
const UserFactory = require('../factories/UserFactory');
const { ROLES } = require('../models/constants');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('../utils/security');
const { requireFields, isEmail } = require('../utils/validators');
const { ValidationError, ConflictError, AuthenticationError, ForbiddenError } = require('../utils/errors');

// Which roles may sign in on which tab of the login screen.
const PORTALS = {
  student: [ROLES.STUDENT, ROLES.ORGANIZER],
  admin: [ROLES.ADMIN, ROLES.RESOURCE_MANAGER],
};

class AuthService {
  constructor({ userRepository, tokenSecret, tokenTtlSeconds }) {
    this.users = userRepository;
    this.secret = tokenSecret;
    this.ttl = tokenTtlSeconds;
  }

  _token(user) { return signToken({ sub: user.id, role: user.role }, this.secret, this.ttl); }

  // Public sign-up always creates a student; an admin assigns other roles (FR-3).
  async register({ name, email, password } = {}) {
    requireFields({ name, email, password }, ['name', 'email', 'password']);
    if (!isEmail(email)) throw new ValidationError('Enter a valid email address.');
    if (String(password).length < 8) throw new ValidationError('Password must be at least 8 characters.');
    const normalized = String(email).trim().toLowerCase();
    if (await this.users.findByEmail(normalized)) throw new ConflictError('An account with this email already exists.');
    const user = UserFactory.create(ROLES.STUDENT, { name: String(name).trim(), email: normalized, passwordHash: hashPassword(password) });
    const saved = await this.users.create(user);
    return { user: saved, token: this._token(saved) };
  }

  async login({ identifier, email, password, portal } = {}) {
    const id = identifier ?? email;
    requireFields({ identifier: id, password }, ['identifier', 'password']);
    const user = await this.users.findByIdentifier(id);
    if (!user || !verifyPassword(password, user.passwordHash)) throw new AuthenticationError('Incorrect login details.');
    if (!user.isActive()) throw new ForbiddenError('This account is deactivated. Contact an administrator.');
    if (PORTALS[portal] && !PORTALS[portal].includes(user.role)) {
      throw new ForbiddenError(portal === 'admin' ? 'This is not an admin account. Use the Student tab.' : 'Admin and staff accounts sign in on the Admin tab.');
    }
    return { user, token: this._token(user) };
  }

  async authenticate(token) {
    const payload = verifyToken(token, this.secret);
    if (!payload) throw new AuthenticationError('Your session has expired. Sign in again.');
    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive()) throw new AuthenticationError('Your session has expired. Sign in again.');
    return user;
  }

  async updateProfile(user, { name, email } = {}) {
    const changes = {};
    if (name !== undefined) {
      if (!String(name).trim()) throw new ValidationError('Name cannot be blank.');
      changes.name = String(name).trim();
    }
    if (email !== undefined) {
      if (!isEmail(email)) throw new ValidationError('Enter a valid email address.');
      const normalized = String(email).trim().toLowerCase();
      const other = await this.users.findByEmail(normalized);
      if (other && other.id !== user.id) throw new ConflictError('Another account already uses this email.');
      changes.email = normalized;
    }
    return this.users.update(user.id, changes);
  }

  async changePassword(user, { currentPassword, newPassword } = {}) {
    requireFields({ currentPassword, newPassword }, ['currentPassword', 'newPassword']);
    if (!verifyPassword(currentPassword, user.passwordHash)) throw new AuthenticationError('Your current password is incorrect.');
    if (String(newPassword).length < 8) throw new ValidationError('New password must be at least 8 characters.');
    await this.users.update(user.id, { passwordHash: hashPassword(newPassword) });
    return { changed: true };
  }
}
module.exports = AuthService;
