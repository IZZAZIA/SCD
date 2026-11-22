// DESIGN PATTERN: SINGLETON
// One shared database connection per process. Everyone calls Database.getInstance().
// Storage is a JSON file so the project runs with zero setup; repositories hide this, so it can be
// swapped for MySQL / Supabase / Firebase without touching services (see docs/DESIGN_PATTERNS.md).
const fs = require('fs');
const path = require('path');

const TABLES = ['users', 'events', 'resources', 'bookings', 'registrations', 'notifications'];

class Database {
  constructor({ file = null } = {}) {
    if (Database._instance) return Database._instance; // enforce a single instance
    this.file = file;
    this.tables = {};
    this.counters = {};
    this._inTransaction = false;
    this._queue = Promise.resolve();
    this._load();
    Database._instance = this;
  }

  static getInstance(options) {
    if (!Database._instance) new Database(options);
    return Database._instance;
  }

  static destroyInstance() {
    Database._instance = null;
  }

  _empty() {
    TABLES.forEach((t) => { this.tables[t] = []; this.counters[t] = 0; });
  }

  _load() {
    this._empty();
    if (this.file && fs.existsSync(this.file)) {
      const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      Object.assign(this.tables, saved.tables);
      Object.assign(this.counters, saved.counters);
    }
  }

  _persist() {
    if (!this.file || this._inTransaction) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ tables: this.tables, counters: this.counters }, null, 2));
    fs.renameSync(tmp, this.file);
  }

  reset() { this._empty(); this._persist(); }
  isEmpty() { return this.tables.users.length === 0; }

  all(table) { return structuredClone(this.tables[table]); }
  get(table, id) { return structuredClone(this.tables[table].find((r) => r.id === id) || null); }

  insert(table, row) {
    const id = ++this.counters[table];
    this.tables[table].push({ ...row, id });
    this._persist();
    return this.get(table, id);
  }

  update(table, id, patch) {
    const row = this.tables[table].find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch, { id });
    this._persist();
    return this.get(table, id);
  }

  remove(table, id) {
    const before = this.tables[table].length;
    this.tables[table] = this.tables[table].filter((r) => r.id !== id);
    this._persist();
    return this.tables[table].length < before;
  }

  // NFR "Reliability": all-or-nothing units of work (used for bookings and registrations).
  // Transactions run one at a time; do not nest them.
  transaction(work) {
    const run = async () => {
      const snapshot = { tables: structuredClone(this.tables), counters: { ...this.counters } };
      this._inTransaction = true;
      try {
        const result = await work();
        this._inTransaction = false;
        this._persist();
        return result;
      } catch (err) {
        this.tables = snapshot.tables;
        this.counters = snapshot.counters;
        this._inTransaction = false;
        throw err;
      }
    };
    const result = this._queue.then(run, run);
    this._queue = result.catch(() => {});
    return result;
  }
}
Database._instance = null;

module.exports = { Database };
