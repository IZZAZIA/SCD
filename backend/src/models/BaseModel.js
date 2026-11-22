// MVC - Model layer: plain domain objects with their own rules, no database or HTTP knowledge.
class BaseModel {
  toRow() {
    return { ...this };
  }
}
module.exports = BaseModel;
