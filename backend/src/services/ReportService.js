// Objective 6 + dashboard: utilization and participation reports.
const { ROLES, BOOKING_STATUS: S, EVENT_STATUS } = require('../models/constants');
const { dayBounds, weekBounds } = require('../utils/time');

const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const pct = (a, b) => (b ? round((a / b) * 100, 0) : 0);

class ReportService {
  constructor({ userRepository, eventRepository, resourceRepository, bookingRepository, registrationRepository, notificationRepository }) {
    Object.assign(this, {
      users: userRepository, events: eventRepository, resources: resourceRepository,
      bookings: bookingRepository, registrations: registrationRepository, notifications: notificationRepository,
    });
  }

  async resourceUtilization({ from, to } = {}) {
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? dayBounds(to).end : null;
    const [resources, bookings] = await Promise.all([this.resources.findAll(), this.bookings.findAll()]);
    return resources
      .map((r) => {
        const mine = bookings.filter((b) => b.resourceId === r.id);
        const approved = mine.filter((b) => b.status === S.APPROVED && (!start || new Date(b.startTime) >= start) && (!end || new Date(b.startTime) <= end));
        return {
          resourceId: r.id, name: r.name, type: r.type, status: r.status,
          approvedBookings: approved.length,
          hoursBooked: round(approved.reduce((sum, b) => sum + b.durationHours(), 0)),
          pendingRequests: mine.filter((b) => b.status === S.PENDING).length,
        };
      })
      .sort((a, b) => b.hoursBooked - a.hoursBooked);
  }

  async eventParticipation() {
    const [events, regs] = await Promise.all([this.events.findAll(), this.registrations.findAll()]);
    return events
      .map((e) => {
        const mine = regs.filter((r) => r.eventId === e.id);
        const attended = mine.filter((r) => r.attended).length;
        return {
          eventId: e.id, title: e.title, date: e.date, type: e.type, status: e.status,
          capacity: e.capacity, registered: mine.length, attended,
          fillRate: pct(mine.length, e.capacity), attendanceRate: pct(attended, mine.length),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async dashboard(user) {
    const now = new Date();
    const week = weekBounds(now);
    const [events, bookings, resources, regs, users, unread] = await Promise.all([
      this.events.findAll(), this.bookings.findAll(), this.resources.findAll(), this.registrations.findAll(),
      this.users.findAll(), this.notifications.countUnread(user.id),
    ]);
    const upcoming = events.filter((e) => e.status === EVENT_STATUS.SCHEDULED && e.endsAt() >= now);
    const thisWeek = upcoming.filter((e) => e.date >= week.start && e.date <= week.end); // events happening this week
    const stat = (key, label, value) => ({ key, label, value });
    const all = (status) => bookings.filter((b) => b.status === status).length;
    const mine = bookings.filter((b) => b.requestedBy === user.id);
    const myPending = mine.filter((b) => b.status === S.PENDING).length;
    const myEvents = upcoming.filter((e) => e.organizerId === user.id).length;
    let stats;

    switch (user.role) {
      case ROLES.STUDENT:
        stats = [
          stat('thisWeek', 'Events this week', thisWeek.length),
          stat('registered', 'My registrations', regs.filter((r) => r.studentId === user.id && upcoming.some((e) => e.id === r.eventId)).length),
          stat('myevents', 'My events', myEvents),
          stat('pending', 'Requests waiting', myPending),
        ];
        break;
      case ROLES.ORGANIZER:
        stats = [
          stat('thisWeek', 'Events this week', thisWeek.length),
          stat('myevents', 'My events', myEvents),
          stat('pending', 'Requests waiting', myPending),
          stat('approved', 'Approved bookings', mine.filter((b) => b.status === S.APPROVED).length),
        ];
        break;
      case ROLES.RESOURCE_MANAGER:
        stats = [
          stat('pending', 'Requests to review', all(S.PENDING)),
          stat('approved', 'Approved bookings', all(S.APPROVED)),
          stat('resources', 'Resources', resources.length),
          stat('offline', 'Not bookable', resources.filter((r) => !r.isBookable()).length),
        ];
        break;
      default:
        stats = [
          stat('users', 'Users', users.length),
          stat('thisWeek', 'Events this week', thisWeek.length),
          stat('resources', 'Resources', resources.length),
          stat('pending', 'Requests to review', all(S.PENDING)),
          stat('approved', 'Approved bookings', all(S.APPROVED)),
          stat('registrations', 'Registrations', regs.length),
        ];
    }
    return { role: user.role, week, unreadNotifications: unread, stats };
  }
}
module.exports = ReportService;
