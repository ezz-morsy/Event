# Pull Request Description: Phase 0 & Phase 1 Implementation

**Title:** feat: complete Phase 0 setup and Phase 1 backend controllers (Event CRUD, Registrations, Dashboard)
**Target Branch:** `main`  
**Source Branch:** `dev`

---

## 1. Description of Changes
This PR integrates all backend architecture, models, routes, and controllers completed in Phase 0 (Shared Setup) and Phase 1 (Core Backend Endpoints) for the Convene application. 

### Phase 0 — Infrastructure & Shared Setup
* **MongoDB Atlas Integration:** Setup live M0 cluster and configured URL-encoded connection parameters.
* **Server Setup:** Configured `express`, `cors`, and wired database connection routines. Registered custom `notFound` (404) and `errorHandler` (500) middlewares.
* **Model Enhancements:**
  * Added `min: 1` validator to `capacity` in the `Event` schema.
  * Added a unique compound index `{ eventId: 1, email: 1 }` to the `Registration` schema.
* **Seeding Script:** Created `backend/seed.js` to clear and pre-populate the database with test events.
* **Monorepo Layout:** Unified backend structure under the `backend/` folder.

### Phase 1 — Feature Implementation
* **Event CRUD (Ezz):**
  * `GET /api/events` - Lists events with regex filters for `search`, and exact matches for `category`, `location`, and UTC calendar day matching for `date`.
  * `GET /api/events/:id` - Fetches single event by ID (returns 404 for invalid/missing IDs).
  * `POST /api/events` - Validates payload against `eventValidator.js` and creates an event.
  * `PUT /api/events/:id` - Updates an event (with validation).
  * `DELETE /api/events/:id` - Deletes an event and cascades to delete all event registrations.
* **Registrations (4awmy):**
  * `POST /api/events/:id/register` - Registers attendee if capacity is not reached and email is unique.
  * `GET /api/events/:id/attendees` - Lists names and emails of attendees.
  * `DELETE /api/events/:id/registrations/:registrationId` - Cancels attendee registration.
* **Dashboard (4awmy):**
  * `GET /api/dashboard` - Returns aggregation stats (`totalEvents`, `upcomingEvents`, `totalRegistrations`, and `mostPopularEvent` using database pipelines).
* **Documentation:** Created architectural decision documents under `docs/explain-event-crud.md`, `docs/explain-dashboard.md`, and `docs/explain-registration.md`.

---

## 2. Smoke Tests and Verification
The API has been fully smoke tested on localhost and verified on the live Render environment:

### Health Check:
```bash
curl -s https://convene-backend-6hzd.onrender.com/api/health
# Response: {"success":true}
```

### Event Retrieval (Filtered Search):
```bash
curl -s "https://convene-backend-6hzd.onrender.com/api/events?search=tech"
# Response:
# {"success":true,"data":[{"_id":"6a50f6998ac42fa5bf460666","title":"Tech Summit 2025","category":"Technology","location":"Cairo",...}]}
```

### Create Event Validation Failure:
```bash
curl -s -X POST https://convene-backend-6hzd.onrender.com/api/events -H "Content-Type: application/json" -d '{"category":"Tech"}'
# Response:
# {"success":false,"errors":[{"field":"title","message":"Title is required"}]}
```

### Dashboard Statistics:
```bash
curl -s https://convene-backend-6hzd.onrender.com/api/dashboard
# Response:
# {"success":true,"data":{"totalEvents":3,"upcomingEvents":2,"totalRegistrations":0,"mostPopularEvent":null}}
```
