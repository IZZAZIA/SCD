const BaseRepository = require('./BaseRepository');
const Resource = require('../models/Resource');

class ResourceRepository extends BaseRepository {
  constructor(db) { super(db, 'resources', Resource); }
}
module.exports = ResourceRepository;
