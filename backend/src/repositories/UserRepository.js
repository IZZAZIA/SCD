const BaseRepository = require('./BaseRepository');
const { User } = require('../models/User');
const UserFactory = require('../factories/UserFactory');

class UserRepository extends BaseRepository {
  constructor(db) { super(db, 'users', User); }
  // Factory pattern: every stored row comes back as the correct role subclass.
  _toModel(row) { return row ? UserFactory.create(row.role, row) : null; }
  findByEmail(email) { return this.findOne((u) => u.email === String(email).trim().toLowerCase()); }
  findByUsername(username) { return this.findOne((u) => u.username && u.username.toLowerCase() === String(username).trim().toLowerCase()); }
  // Sign-in accepts an email (students) or a username (admin).
  findByIdentifier(identifier) {
    const v = String(identifier || '').trim().toLowerCase();
    return this.findOne((u) => u.email === v || (u.username && u.username.toLowerCase() === v));
  }
  findByRoles(roles) { return this.findWhere((u) => roles.includes(u.role) && u.isActive()); }
}
module.exports = UserRepository;
