// Composition root: the only place where classes are wired together (Dependency Inversion / SOLID).
// Controllers -> Services -> Repositories -> Database, plus observers on the EventBus.
const { Database } = require('./database/Database');
const EventBus = require('./events/EventBus');
const TOPICS = require('./events/topics');
const NotificationObserver = require('./events/observers/NotificationObserver');
const EmailObserver = require('./events/observers/EmailObserver');
const { loadConfig } = require('./config');
const { createConflictStrategy, ConflictDetector } = require('./strategies/conflict');

const UserRepository = require('./repositories/UserRepository');
const EventRepository = require('./repositories/EventRepository');
const ResourceRepository = require('./repositories/ResourceRepository');
const BookingRepository = require('./repositories/BookingRepository');
const RegistrationRepository = require('./repositories/RegistrationRepository');
const NotificationRepository = require('./repositories/NotificationRepository');

const AuthService = require('./services/AuthService');
const UserService = require('./services/UserService');
const EventService = require('./services/EventService');
const ResourceService = require('./services/ResourceService');
const BookingService = require('./services/BookingService');
const RegistrationService = require('./services/RegistrationService');
const NotificationService = require('./services/NotificationService');
const ReminderService = require('./services/ReminderService');
const ReportService = require('./services/ReportService');

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const EventController = require('./controllers/EventController');
const RegistrationController = require('./controllers/RegistrationController');
const ResourceController = require('./controllers/ResourceController');
const BookingController = require('./controllers/BookingController');
const NotificationController = require('./controllers/NotificationController');
const ReportController = require('./controllers/ReportController');

function createContainer({ db = Database.getInstance(), config = loadConfig(), bus = EventBus.getInstance() } = {}) {
  const repositories = {
    userRepository: new UserRepository(db),
    eventRepository: new EventRepository(db),
    resourceRepository: new ResourceRepository(db),
    bookingRepository: new BookingRepository(db),
    registrationRepository: new RegistrationRepository(db),
    notificationRepository: new NotificationRepository(db),
  };

  // Strategy pattern: the conflict policy comes from configuration.
  const conflictDetector = new ConflictDetector(repositories.bookingRepository, createConflictStrategy(config.conflictStrategy));
  const shared = { db, eventBus: bus, ...repositories };

  const services = {
    auth: new AuthService({ ...shared, tokenSecret: config.tokenSecret, tokenTtlSeconds: config.tokenTtlSeconds }),
    users: new UserService(shared),
    events: new EventService(shared),
    resources: new ResourceService(shared),
    bookings: new BookingService({ ...shared, conflictDetector }),
    registrations: new RegistrationService(shared),
    notifications: new NotificationService(shared),
    reminders: new ReminderService({ ...shared, hoursBefore: config.reminderHoursBefore }),
    reports: new ReportService(shared),
  };

  // Observer pattern: register observers once, on a clean bus.
  bus.clear();
  const notificationObserver = new NotificationObserver({ ...repositories, notificationService: services.notifications });
  bus.subscribe(notificationObserver.topics(), notificationObserver);
  if (config.emailEnabled) bus.subscribe([TOPICS.NOTIFICATION_CREATED], new EmailObserver(repositories));

  const controllers = {
    auth: new AuthController(services.auth),
    users: new UserController(services.users),
    events: new EventController(services.events),
    registrations: new RegistrationController(services.registrations),
    resources: new ResourceController(services.resources),
    bookings: new BookingController(services.bookings),
    notifications: new NotificationController(services.notifications, services.reminders),
    reports: new ReportController(services.reports),
  };

  return { db, bus, config, repositories, services, controllers, conflictDetector };
}
module.exports = { createContainer };
