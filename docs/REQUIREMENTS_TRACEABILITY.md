# Requirement traceability

| ID | Requirement | Backend | Mobile |
|---|---|---|---|
| FR-1 | Register and log in securely | `AuthService`, `utils/security.js` (scrypt hashes, signed tokens) | `LoginScreen`, `RegisterScreen`, `AuthContext` |
| FR-2 | Restrict features by role | `models/User.js` permissions, `middleware/auth.js`, `routes/index.js` | `tabFactory.js`, `useAuth().can()` |
| FR-3 | Admin adds/edits/deactivates/deletes users | `UserService` | `UsersScreen`, `UserFormScreen` |
| FR-4 | Create events (title, description, type, date, time, venue, capacity) | `EventService.create` | `EventFormScreen` |
| FR-5 | Organizers edit or cancel events | `EventService.update/cancel` | `EventDetailScreen`, `EventFormScreen` |
| FR-6 | Students view upcoming events, filter by date/category/society | `EventService.list`, `strategies/filter` | `EventListScreen` |
| FR-7 | Register/unregister within capacity | `RegistrationService` (transactional) | `EventDetailScreen`, `MyRegistrationsScreen` |
| FR-8 | Admin adds/updates resources | `ResourceService` | `ResourcesScreen`, `ResourceFormScreen` |
| FR-9 | Real-time availability | `ResourceService.list/getAvailability` | `ResourcesScreen`, `ResourceAvailabilityScreen` |
| FR-10 | Request one or more resources for a slot | `BookingService.request` | `RequestBookingScreen` |
| FR-11 | Reject or warn about overlaps | `strategies/conflict`, `BookingService` | warnings shown after sending a request |
| FR-12 | *(missing from the proposal's numbering, jumps from FR-11 to FR-13)* | n/a | n/a |
| FR-13 | States Pending/Approved/Rejected/Cancelled | `models/Booking.js` transition table | `Badge`, `BookingCard` |
| FR-14 | Manager approves/rejects with remarks | `BookingService.review` | `BookingRequestsScreen`, `ReviewActions` |
| FR-15 | Organizer tracks status | `BookingService.listMine` | `MyBookingsScreen` |
| FR-16 | Notify on approve/reject | `NotificationObserver` | `NotificationsScreen`, tab badge |
| FR-17 | Reminders before events | `ReminderService` (runs every minute; `POST /api/notifications/reminders/run` for demos) | `NotificationsScreen` |
| FR-18 | Notify on reschedule/cancel | `EventService.update/cancel` + `NotificationObserver` | `NotificationsScreen` |
| Obj. 6 | Utilization and participation reports | `ReportService` | `ReportsScreen`, `DashboardScreen` |

| NFR | How it is met |
|---|---|
| Security | Salted scrypt password hashes, HMAC-signed expiring tokens, role-based authorization on every route, input validation. SQL injection: no SQL is built from strings (use parameterized queries if you move to MySQL). |
| Reliability | `Database.transaction()` makes bookings and registrations all-or-nothing and serialized. |
| Maintainability / scalability | Layered modules, dependency injection in `container.js`, new modules (e.g. attendance) plug in as service + controller + routes. |
| Usability | Plain-language screens, pull-to-refresh, empty states that say what to do next. |
| Portability | Node.js and Expo run on Windows, Linux and macOS. |

## Role note
The proposal's role table lists only Admin and Student, yet the requirements also mention
**organizers** and a **resource manager**. The system implements four roles: Admin, Organizer,
Resource manager, Student.
