export const EVENT_TYPES = ['Seminar', 'Workshop', 'Sports', 'Competition', 'Society event', 'Exam'];
export const RESOURCE_TYPES = ['Hall', 'Classroom', 'Lab', 'Equipment'];
export const RESOURCE_STATUSES = ['available', 'maintenance', 'unavailable'];
export const USER_STATUSES = ['active', 'inactive'];

export const ROLES = {
  admin: 'Admin',
  organizer: 'Organizer',
  resource_manager: 'Resource manager',
  student: 'Student',
};
export const ROLE_KEYS = Object.keys(ROLES);

export const SOCIETIES = [
  'Computing Society', 'Sports Society', 'Baking Society', 'English Lit Society',
  'Board Games Society', 'Medical Sciences Society', 'Astronomy Society', 'Shakespeare Reading Society',
];
export const societyOptions = SOCIETIES.map((s) => ({ value: s, label: s }));
