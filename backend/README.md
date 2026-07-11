# Convene — Event Management Platform Backend

Convene is a RESTful API backend built with Node.js, Express, and MongoDB/Mongoose. It manages events and attendee registrations.

## Prerequisites

- **Node.js** (v16.0.0 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection URI)

## Getting Started

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   Modify the `.env` file to supply your database URI and other settings (see [Environment Variables](#environment-variables) below).

4. Seed the database with initial test data:
   ```bash
   node seed.js
   ```

5. Run the server in development mode (with hot reloading via `nodemon`):
   ```bash
   npm run dev
   ```

6. Run the server in production mode:
   ```bash
   npm start
   ```

---

## Environment Variables

The server expects a `.env` file at the root of the `backend/` directory with the following variables:

| Variable | Description | Example |
|---|---|---|
| `PORT` | The port the Express server will listen on. | `5000` |
| `MONGO_URI` | MongoDB Atlas cluster connection string or local MongoDB URI. | `mongodb+srv://...` |
| `CLIENT_ORIGIN` | Allowed origin for CORS requests (e.g. your local Live Server or frontend Vercel URL). | `http://localhost:5500` |

---

## API Endpoints

All responses from endpoints follow a standard envelope format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Failure Response:**
```json
{
  "success": false,
  "message": "Error details/validation feedback"
}
```

### Health Endpoints
- **`GET /api/health`**
  - Returns `{ "success": true }` to verify API availability.

### Dashboard Endpoints
- **`GET /api/dashboard`**
  - Returns consolidated statistics about the platform:
    - `totalEvents`: Total count of events
    - `upcomingEvents`: Count of events scheduled in the future
    - `totalRegistrations`: Count of registrations across all events
    - `mostPopularEvent`: Event object with the highest attendee registration count (null if none)

### Event Endpoints
- **`GET /api/events`**
  - Fetch all events. Supports optional query filters:
    - `?search=title` (Regex search on titles, case-insensitive)
    - `?category=Name` (Filter by exact category)
    - `?location=Name` (Filter by exact location)
    - `?date=YYYY-MM-DD` (Filter by exact day)
- **`POST /api/events`**
  - Create a new event. All fields required.
  - Body structure:
    ```json
    {
      "title": "Tech Summit 2025",
      "category": "Technology",
      "location": "Cairo",
      "date": "2025-12-01T10:00:00.000Z",
      "capacity": 100,
      "description": "A summit for tech enthusiasts."
    }
    ```
- **`GET /api/events/:id`**
  - Fetch detailed information for a single event by its ID.
- **`PUT /api/events/:id`**
  - Update details of an existing event. Runs full schema validations.
- **`DELETE /api/events/:id`**
  - Delete an event. **Cascades deletion to remove all attendee registrations for this event.**

### Registration Endpoints
- **`POST /api/events/:id/register`**
  - Register an attendee for a specific event.
  - Body structure:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
    ```
  - Validation rules:
    - Prevents registration if event is at capacity.
    - Prevents duplicate registrations with the same email on the same event.
- **`GET /api/events/:id/attendees`**
  - Fetch the list of registered attendees (only `name` and `email` fields) for a specific event.
- **`DELETE /api/events/:id/registrations/:registrationId`**
  - Cancel and remove an attendee registration.
