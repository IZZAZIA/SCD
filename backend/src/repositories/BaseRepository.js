// DESIGN PATTERN: REPOSITORY
// Services never touch storage directly; they ask a repository. Methods are async so a real
// database driver can replace the JSON store without changing any service code.
class BaseRepository {
  constructor(db, table, ModelClass) {
    this.db = db;
    this.table = table;
    this.ModelClass = ModelClass;
  }
  _toModel(row) { return row ? new this.ModelClass(row) : null; }

  async findAll() { return this.db.all(this.table).map((r) => this._toModel(r)); }
  async findById(id) { return this._toModel(this.db.get(this.table, Number(id))); }
  async findWhere(predicate) { return (await this.findAll()).filter(predicate); }
  async findOne(predicate) { return (await this.findWhere(predicate))[0] || null; }
  async count(predicate = () => true) { return (await this.findWhere(predicate)).length; }
  async create(entity) { return this._toModel(this.db.insert(this.table, entity.toRow())); }
  async update(id, patch) { return this._toModel(this.db.update(this.table, Number(id), patch)); }
  async delete(id) { return this.db.remove(this.table, Number(id)); }
}
module.exports = BaseRepository;
