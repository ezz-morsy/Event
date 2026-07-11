# Modern Reservation System — Full Stack Event Management Platform

A highly structured, responsive, and dual-themed Single-Page Application (SPA) designed to manage events and handle attendee registrations. The system is architected as a decoupled monorepo containing a **Node.js/Express/MongoDB** REST API backend and a **Vanilla JS (ES6 Modules)/CSS3** frontend.

---

## 📁 Detailed Directory Structure

Below is the complete file layout of the monorepo, detailing the purpose of every module:

```text
Event/ (Root)
│
├── backend/                       # Node.js/Express REST API
│   ├── config/
│   │   └── db.js                  # Database connection module using Mongoose
│   ├── controllers/               # Business logic controllers
│   │   ├── dashboardController.js # Statistics aggregation pipelines
│   │   ├── eventController.js     # Event CRUD & query parameters handler
│   │   └── registrationController.js # Registration transactions (capacity guards & duplicate checks)
│   ├── middleware/                # Express middleware layers
│   │   ├── errorHandler.js        # Global error interception (JSON payloads)
│   │   └── notFound.js            # Catch-all fallback for undefined routes
│   ├── models/                    # Mongoose database schemas
│   │   ├── Event.js               # Event schema (capacity constraints)
│   │   └── Registration.js        # Registration schema (compound unique indexes)
│   ├── routes/                    # API route declarations mapping controllers
│   │   ├── dashboardRoutes.js     # Routes under /api/dashboard
│   │   ├── eventRoutes.js         # Routes under /api/events
│   │   └── healthRoutes.js        # Health status check route under /api/health
│   ├── test/                      # Node.js native unit tests suite
│   │   ├── eventController.test.js
│   │   ├── eventValidator.test.js
│   │   ├── helpers.js
│   │   └── registrationController.test.js
│   ├── utilities/
│   │   └── eventValidator.js      # Input validators (capacity & future date bounds checks)
│   ├── .env.example               # Sample environment configuration file
│   ├── package.json               # Node scripts & module dependencies
│   ├── README.md                  # Dedicated Backend guide
│   ├── seed.js                    # Database seeder script for sample events
│   └── server.js                  # Express server listener
│
├── frontend/                      # Vanilla JS Single Page Application (SPA)
│   ├── views/                     # Modular render scripts (dynamic ESM)
│   │   ├── dashboard.js           # Statistics tiles & popular event spotlight
│   │   ├── detail.js              # Event description details, status trackers, & attendee list
│   │   ├── events.js              # Event list browser with search filter queries
│   │   └── form.js                # Shared event create/edit form views
│   ├── app.js                     # Global router, modal controls, & toast notices
│   ├── index.html                 # Main entrypoint SPA shell layout
│   ├── README.md                  # Dedicated Frontend guide
│   └── style.css                  # Clean design system (Dark & Light theme configs)
│
├── DEPLOYMENT.md                  # Production hosting guide (Render + Vercel)
└── README.md                      # Project master guide (This file)
```

---

## ⚡ Core User Flows & Features

### 1. Dynamic Dual-Theming (Dark & Light)
* **Theme Toggle Button:** Conveniently located in the top navigation bar. Uses a Moon icon for Dark Mode and a Sun icon for Light Mode.
* **Persistent Preferences:** The user's choice is saved in `localStorage` and automatically loaded on subsequent visits.
* **Variables System:** Managed entirely through CSS custom properties (variables), dynamically adapting card colors, input boxes, text contrasts, shadows, and status tracks.

### 2. Event Management (CRUD)
* **Create Event:** Fill out the creation form. The system validates fields (title, category, date, location, capacity, description).
* **Future-Date Check:** Enforces that new events can only be scheduled for a future date & time.
* **Flexible Categories:** Offers a list of standard categories (Technology, Art, Business, Social, Sports, Education, Music). Selecting **Other** dynamically reveals an inline text input field where users can type in and save a custom category.
* **Edit Event:** Prefills event details using the event ID read from the URL hash route. Prefills custom categories back into the "Other" text input field automatically.
* **Capacity Guard:** Blocks editing the capacity of an event to a number lower than its current registration count.
* **Cascade Deletions:** Deleting an event triggers a database cleanup, automatically deleting all registration records linked to that event.

### 3. Attendee Registrations
* **Dynamic Capacity Tracker:** Shows a progress bar representing filled seats. Turns red when fully booked.
* **Double-Constraint Guards:**
  * **Duplicate Prevention:** Utilizes a compound index `(eventId, email)` in MongoDB to prevent users from registering twice for the same event.
  * **Capacity Check:** Blocks new registrations if the event's capacity has already been filled.
  * **Past Event Guard:** Prevents registration if the event date has already passed.
* **Attendee List:** Shows registered names and emails, and allows canceling registrations with a modal confirmation popup.

### 4. Interactive Dashboard
* **Real-time Statistics:** Fetches total events, future upcoming events, and total attendee registrations.
* **Popular Spotlight Card:** Highlights the event with the highest registration count.

---

## 🔧 Database Models & Schema Specifications

The project leverages two Mongoose models linked through logical relationships:

### 1. Event Model (`backend/models/Event.js`)
Stores event details, with categories stored as strings for maximum flexibility and runtime variance.
```javascript
{
    title: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, required: true }
}
```

### 2. Registration Model (`backend/models/Registration.js`)
Tracks attendee registrations, linking them back to the event.
```javascript
{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
}
// Schema compound index enforces unique registration per event:
// registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
```

---

## 📡 REST API Endpoint Reference

### Events (`/api/events`)
* `GET /api/events` — Get all events (supports `?search=`, `?category=`, `?location=`, and `?date=`).
* `GET /api/events/:id` — Get details of a single event.
* `POST /api/events` — Create a new event (enforces future date check).
* `PUT /api/events/:id` — Update an event (checks capacity bounds).
* `DELETE /api/events/:id` — Delete an event (triggers cascade registration deletions).

### Registrations (`/api/events/:id/registrations`)
* `GET /api/events/:id/registrations` — Get all attendees registered for a specific event.
* `POST /api/events/:id/registrations` — Register a new attendee (checks capacity, duplicates, and past dates).
* `DELETE /api/events/:id/registrations/:regId` — Cancel/delete an attendee registration.

### Dashboard (`/api/dashboard`)
* `GET /api/dashboard` — Get aggregated statistics (total events, upcoming events, registrations, and the most popular spotlight event).

### Health (`/api/health`)
* `GET /api/health` — API health check endpoint (returns `"OK"`).

---

## 🚀 Running Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+) installed.
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance).

### 1. Setup the Backend API
1. Navigate to the backend folder:
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
   Modify the `.env` variables:
   * `PORT=5000`
   * `MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/reservation_system?retryWrites=true&w=majority`
   * `CLIENT_ORIGIN=http://localhost:5500`
4. Pre-seed default events (Optional):
   ```bash
   node seed.js
   ```
5. Launch the Node development server:
   ```bash
   npm run dev
   ```

### 2. Setup the Frontend SPA
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Set the backend API target URL in `frontend/app.js` (Use `http://localhost:5000` for local dev):
   ```javascript
   const API = "http://localhost:5000";
   ```
3. Boot up a local static server to resolve ES6 module imports:
   * **Using Python:**
     ```bash
     python -m http.server 5500
     ```
   * **Using Node http-server:**
     ```bash
     npx http-server -p 5500
     ```
4. Open your browser and navigate to **`http://localhost:5500`**.

---

## 🧪 Running Unit Tests

The backend includes a native unit test suite.
1. Make sure your `.env` file contains a valid `MONGO_URI`.
2. Run the tests:
   ```bash
   cd backend
   ```
3. Execute:
   ```bash
   npm run test
   ```
