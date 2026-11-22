# Git and GitHub workflow (required by the guidelines)

Each member should work on feature branches and merge through Pull Requests, with small meaningful commits.

```bash
git init && git add . && git commit -m "chore: import BOOKT project skeleton"
git branch -M main
git remote add origin https://github.com/<team>/bookt.git
git push -u origin main
```

## Suggested branches (one per feature, one owner each)
| Branch | Scope |
|---|---|
| `feature/auth-and-rbac` | AuthService, UserService, middleware, login/register screens |
| `feature/event-management` | EventService, EventFilter strategies, event screens |
| `feature/resource-management` | ResourceService, resource screens, availability |
| `feature/booking-workflow` | BookingService, ConflictDetector + strategies, review screens |
| `feature/notifications-observer` | EventBus, observers, NotificationFactory, reminders |
| `feature/reports-dashboard` | ReportService, dashboard and reports screens |
| `test/unit-tests` | backend/tests |

## Commit style
`feat: reject overlapping bookings with RejectConflictStrategy`, `fix: ...`, `test: ...`, `docs: ...`.

## Pull Request rules
1. Open a PR from the feature branch into `main`; at least one teammate reviews it.
2. `npm test` in `backend/` must pass before merging.
3. Describe which requirement (FR-x) or pattern the PR implements.
