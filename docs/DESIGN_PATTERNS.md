# Design patterns: where each one is implemented

All six required patterns exist in real, running source code (not just diagrams).

| # | Pattern | Where (file) | What it does in BOOKT |
|---|---|---|---|
| 1 | **MVC** | Model: `backend/src/models/*` · Controller: `backend/src/controllers/*` (+ `routes/`) · View: `mobile/src/screens/*`, `mobile/src/components/*` | Models hold domain rules (e.g. `Booking.canTransitionTo`), controllers translate HTTP to service calls, the React Native screens are the view. |
| 2 | **Repository** | `backend/src/repositories/BaseRepository.js` + `User/Event/Resource/Booking/Registration/NotificationRepository.js` | Services never touch storage. Every query (`findByEmail`, `findByResource`, `countByEvent`...) lives in a repository, so the JSON store can be replaced by MySQL/Supabase/Firebase. |
| 3 | **Factory** | `backend/src/factories/UserFactory.js` (used by `AuthService`, `UserService`, `UserRepository`, `seed.js`) · `backend/src/factories/NotificationFactory.js` (used by `NotificationObserver`) · `mobile/src/navigation/tabFactory.js` | `UserFactory.create(role, data)` returns `Student`, `Organizer`, `ResourceManager` or `Admin` with that role's permissions. `NotificationFactory.create(type, ...)` builds the right message for each event. `createTabsForRole` builds the tab set per role in the app. |
| 4 | **Singleton** | `backend/src/database/Database.js` · `backend/src/events/EventBus.js` · `mobile/src/api/ApiClient.js` · `mobile/src/stores/NotificationStore.js` | One database connection, one event bus, one HTTP client (holding the auth token) and one notification store. Each exposes `getInstance()`. |
| 5 | **Observer** | Subject: `backend/src/events/EventBus.js` · Observers: `events/observers/NotificationObserver.js`, `events/observers/EmailObserver.js` · Publishers: `BookingService`, `EventService`, `ReminderService`, `NotificationService` · Client side: `mobile/src/stores/NotificationStore.js` + `hooks/useNotifications.js` | When a booking is approved, an event is rescheduled/cancelled or a reminder is due, the service **publishes** a topic. Observers react by creating notifications (FR-16/17/18) and optionally emailing. The mobile tab badge and notification screen subscribe to the store and update automatically. |
| 6 | **Strategy** | Conflict: `backend/src/strategies/conflict/` (`ConflictStrategy`, `RejectConflictStrategy`, `WarnConflictStrategy`, context `ConflictDetector`) · Filtering: `backend/src/strategies/filter/` (`DateFilterStrategy`, `CategoryFilterStrategy`, `SocietyFilterStrategy`, context `EventFilter`) | FR-11 "reject **or** warn" is two interchangeable strategies chosen by config. FR-6 filters (date, category, society) are separate strategies applied by `EventFilter`. |

## How the pieces connect (for the viva)
```
Mobile screen --HTTP--> routes (RBAC) --> Controller --> Service --> Repository --> Database (Singleton)
                                                          |  \
                                                          |   +--> ConflictDetector --> Strategy
                                                          +--> EventBus (Singleton, Observer subject)
                                                                   +--> NotificationObserver --> NotificationFactory
                                                                   +--> EmailObserver
```
Example, "organizer requests a hall": `BookingController.request` > `BookingService.request`
> `ConflictDetector.check` (**Strategy**) > `BookingRepository.create` (**Repository**, inside a DB transaction)
> `EventBus.publish('booking.requested')` (**Observer**) > `NotificationObserver` > `NotificationFactory`
(**Factory**) > managers receive a notification.

## SOLID, briefly
- **S**: each service has one job (`BookingService`, `ReportService`...).
- **O**: add a new conflict policy, filter, notification type or observer without editing existing code.
- **L**: `Student`/`Organizer`/... and both conflict strategies are substitutable.
- **I**: small focused repositories and strategy interfaces.
- **D**: services receive repositories and the bus through constructors; `container.js` is the only wiring point.
