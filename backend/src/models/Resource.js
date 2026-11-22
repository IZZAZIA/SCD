const BaseModel = require('./BaseModel');
const { RESOURCE_STATUS } = require('./constants');

class Resource extends BaseModel {
  constructor({ id = null, name, type, location, capacity, status = RESOURCE_STATUS.AVAILABLE }) {
    super();
    Object.assign(this, { id, name, type, location, capacity: Number(capacity), status });
  }
  isBookable() { return this.status === RESOURCE_STATUS.AVAILABLE; }
}
module.exports = Resource;
