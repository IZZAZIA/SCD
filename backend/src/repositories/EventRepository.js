const BaseRepository = require('./BaseRepository');
const Event = require('../models/Event');

class EventRepository extends BaseRepository {
  constructor(db) { super(db, 'events', Event); }
  findByOrganizer(organizerId) { return this.findWhere((e) => e.organizerId === organizerId); }
}
module.exports = EventRepository;
