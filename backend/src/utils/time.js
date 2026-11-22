const toDate = (v) => (v instanceof Date ? v : new Date(v));

// Half-open interval overlap: a booking ending at 10:00 does not clash with one starting at 10:00.
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return toDate(aStart) < toDate(bEnd) && toDate(aEnd) > toDate(bStart);
}

const combine = (date, time) => new Date(`${date}T${time}:00`);
const hoursBetween = (a, b) => (toDate(b) - toDate(a)) / 36e5;

function dayBounds(date) {
  return { start: new Date(`${date}T00:00:00`), end: new Date(`${date}T23:59:59.999`) };
}

// Current calendar week, Monday to Sunday, as YYYY-MM-DD strings.
function weekBounds(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(day);
  start.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: fmt(start), end: fmt(end) };
}

module.exports = { toDate, rangesOverlap, combine, hoursBetween, dayBounds, weekBounds };
