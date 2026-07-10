# Explanation: Event CRUD Features

## What was done and why
I implemented the full suite of Event CRUD endpoints in `backend/controllers/eventController.js` and wired them up to `backend/routes/eventRoutes.js`:
1. **getEvents (`GET /api/events`):** Retrieves all events from the database. It supports optional filters via query parameters:
   - `search`: Filter events whose title contains the search query (case-insensitive regex match).
   - `category`: Exact match.
   - `location`: Exact match.
   - `date`: Matches events on that specific calendar day (filtered using a start-of-day and end-of-day date range in UTC).
2. **getEventById (`GET /api/events/:id`):** Fetches a single event by its ID. Returns a `404 Not Found` if the ID is missing or invalid.
3. **createEvent (`POST /api/events`):** Runs inputs through `eventValidator.js`. If valid, inserts a new event document in Mongoose; if invalid, returns a `400 Bad Request` with an array of field-specific errors.
4. **updateEvent (`PUT /api/events/:id`):** Updates an event dynamically, validating fields beforehand and handling 404/Cast errors.
5. **deleteEvent (`DELETE /api/events/:id`):** Deletes the event, and cascades to delete all associated registrations in the `registrations` collection.

---

## Alternatives Considered

### 1. Filtering in application memory vs. Database queries
* **Alternative:** Retrieve all events from MongoDB and filter them in Node.js memory.
* **Why rejected:** Querying the entire database is inefficient and does not scale as the number of events grows. Using MongoDB filters like `$regex` and range queries on `date` indexes ensures minimal data is transferred and maximum query speed.

### 2. Manual cascade deletion vs. Mongoose pre-remove hooks
* **Alternative:** Define a pre-remove middleware hook on the `Event` schema to delete related registrations automatically.
* **Why rejected:** Mongoose middleware hooks can be fragile and occasionally do not fire when using certain query helpers like `findByIdAndDelete` directly. Doing the cascade deletion explicitly inside the controller (`Registration.deleteMany({ eventId: id })`) makes the data flow obvious, reliable, and easier to debug.
