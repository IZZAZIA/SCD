// FR-3: admin adds, edits, deactivates and deletes users.
const UserFactory = require('../factories/UserFactory');
const { USER_STATUS, ROLES } = require('../models/constants');
const { hashPassword } = require('../utils/security');
const { requireFields, isEmail } = require('../utils/validators');
const { ValidationError, ConflictError, NotFoundError } = require('../utils/errors');

class UserService {
  constructor({ userRepository, eventRepository, bookingRepository }) {
    this.users = userRepository;
    this.events = eventRepository;
    this.bookings = bookingRepository;
  }

  async list() {
    return (await this.users.findAll()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async create({ name, email, password, role, username } = {}) {
    requireFields({ name, email, password, role }, ['name', 'email', 'password', 'role']);
    if (!isEmail(email)) throw new ValidationError('Enter a valid email address.');
    if (String(password).length < 8) throw new ValidationError('Password must be at least 8 characters.');
    const normalized = String(email).trim().toLowerCase();
    if (await this.users.findByEmail(normalized)) throw new ConflictError('An account with this email already exists.');
    const uname = username ? String(username).trim() : '';
    if (uname && (await this.users.findByUsername(uname))) throw new ConflictError('That username is already taken.');
    const user = UserFactory.create(role, { name: String(name).trim(), email: normalized, username: uname, passwordHash: hashPassword(password) });
    return this.users.create(user);
  }

  async update(actor, id, patch = {}) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError('User not found.');
    const changes = {};
    if (patch.name !== undefined) changes.name = String(patch.name).trim();
    if (patch.email !== undefined) {
      if (!isEmail(patch.email)) throw new ValidationError('Enter a valid email address.');
      const email = String(patch.email).trim().toLowerCase();
      const other = await this.users.findByEmail(email);
      if (other && other.id !== user.id) throw new ConflictError('Another account already uses this email.');
      changes.email = email;
    }
    if (patch.username !== undefined) {
      const uname = String(patch.username).trim();
      const other = uname ? await this.users.findByUsername(uname) : null;
      if (other && other.id !== user.id) throw new ConflictError('That username is already taken.');
      changes.username = uname;
    }
    if (patch.role !== undefined) {
      if (!UserFactory.roles().includes(patch.role)) throw new ValidationError('Unknown role.');
      changes.role = patch.role;
    }
    if (patch.status !== undefined) {
      if (!Object.values(USER_STATUS).includes(patch.status)) throw new ValidationError('Status must be active or inactive.');
      changes.status = patch.status;
    }
    if (patch.password) {
      if (String(patch.password).length < 8) throw new ValidationError('Password must be at least 8 characters.');
      changes.passwordHash = hashPassword(patch.password);
    }
    if (actor.id === user.id && (changes.status === USER_STATUS.INACTIVE || (changes.role && changes.role !== ROLES.ADMIN))) {
      throw new ConflictError('You cannot deactivate or demote your own account.');
    }
    return this.users.update(id, changes);
  }

  deactivate(actor, id) { return this.update(actor, id, { status: USER_STATUS.INACTIVE }); }

  async remove(actor, id) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError('User not found.');
    if (actor.id === user.id) throw new ConflictError('You cannot delete your own account.');
    const owns = (await this.events.findByOrganizer(user.id)).length + (await this.bookings.findByRequester(user.id)).length;
    if (owns) throw new ConflictError('This user has events or bookings on record. Deactivate the account instead.');
    await this.users.delete(id);
    return { deleted: true };
  }
}
module.exports = UserService;
