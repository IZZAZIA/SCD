# Unit testing

Run `npm test` inside `backend/`. The suite uses Node's built-in `node:test` runner (no extra install), covers
**36 tests** in 7 files, and the latest output is saved in `TEST_RESULTS.txt`.

The proposal lists JUnit/NUnit/PyTest, which are for Java, C# and Python; this JavaScript project uses `node:test`.

| File | What it proves |
|---|---|
| `security.test.js` | password hashing, token signing, tamper/expiry rejection |
| `patterns.test.js` | Singleton, Factory (users + notifications), Observer, both Strategy families |
| `auth.test.js` | FR-1, FR-2, FR-3 |
| `events.test.js` | FR-4, FR-5, FR-6, FR-17, FR-18 |
| `registrations.test.js` | FR-7 including a concurrency test |
| `bookings.test.js` | FR-9 to FR-16, rollback, reports |
| `database.test.js` | transaction rollback |
