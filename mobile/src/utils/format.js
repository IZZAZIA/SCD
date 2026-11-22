const pad = (n) => String(n).padStart(2, '0');
const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const formatTimeRange = (start, end) => `${start} to ${end}`;

export const formatSlot = (startIso, endIso) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return `${s.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${hm(s)} to ${hm(e)}`;
};

export const timeOf = (iso) => hm(new Date(iso));

// Throws a RangeError when the date or time is not valid; callers show a friendly message.
export const toIso = (date, time) => {
  const d = new Date(`${date}T${time}:00`);
  if (Number.isNaN(d.getTime())) throw new RangeError('Use a date like 2026-12-31 and a time like 14:30.');
  return d.toISOString();
};

export const formatDateTime = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${hm(d)}`;
};
