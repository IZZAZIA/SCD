const { ValidationError } = require('./errors');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const isEmail = (v) => EMAIL_RE.test(String(v || ''));
const isTime = (v) => TIME_RE.test(String(v || ''));

function isDate(v) {
  if (!DATE_RE.test(String(v || ''))) return false;
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function requireFields(obj, fields) {
  const missing = fields.filter((f) => isBlank(obj?.[f]));
  if (missing.length) throw new ValidationError(`Missing required field(s): ${missing.join(', ')}`);
}

function positiveInt(value, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new ValidationError(`${label} must be a whole number greater than 0.`);
  return n;
}

module.exports = { isBlank, isEmail, isDate, isTime, requireFields, positiveInt };
