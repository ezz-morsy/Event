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
│   │   ├── categoryController.js  # Category CRUD handlers (rename cascade & deletion guards)
│   │   ├── dashboardController.js # Statistics aggregation pipelines
│   │   ├── eventController.js     # Event CRUD & query parameters handler
│   │   └── registrationController.js # Registration transactions (capacity guards & duplicate checks)
│   ├── middleware/                # Express middleware layers
│   │   ├── errorHandler.js        # Global error interception (JSON payloads)
│   │   └── notFound.js            # Catch-all fallback for undefined routes
│   ├── models/                    # Mongoose database schemas
│   │   ├── Category.js            # Category schema (name & description)
│   │   ├── Event.js               # Event schema (capacity constraints)
│   │   └── Registration.js        # Registration schema (compound unique indexes)
│   ├── routes/                    # API route declarations mapping controllers
│   │   ├── categoryRoutes.js      # Routes under /api/categories
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
│   └── server.js                  # Express server listener & default category seeder
│
├── frontend/                      # Vanilla JS Single Page Application (SPA)
│   ├── views/                     # Modular render scripts (dynamic ESM)
│   │   ├── categories.js          # Categories view (CRUD layout & inline editing forms)
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
* **Edit Event:** Prefills event data using the event ID read from the URL hash route.
* **Capacity Guard:** Blocks editing the capacity of an event to a number lower than its current registration count.
* **Cascade Deletions:** Deleting an event triggers a database cleanup, automatically deleting all registration records linked to that event.

### 3. Category Management (CRUD)
* **Dedicated Manager:** A "Categories" view lists all existing categories with inline controls.
* **Inline Form Editing:** Allows editing name/description fields directly. Clicking "Edit" populates the right-hand panel form with a "Cancel" backup button.
* **Rename Cascade:** Renaming a category automatically triggers a backend query update, updating the category field on all assigned events in MongoDB.
* **Referential Safeguard:** Deleting a category is blocked if any active events are currently assigned to it, showing a warning toast message.
* **Auto-Seeding:** If the category collection is empty, the database seeds default categories (*Technology, Art, Business, Social, Sports, Education, Music, Other*) on server boot.

### 4. Attendee Registrations
* **Dynamic Capacity Tracker:** Shows a progress bar representing filled seats. Turns red when fully booked.
* **Double-Constraint Guards:**
  * **Duplicate Prevention:** Utilizes a compound index `(eventId, email)` in MongoDB to prevent users from registering twice for the same event.
  * **Capacity Check:** Blocks new registrations if the event's capacity has already been filled.
  * **Past Event Guard:** Prevents registration if the event date has already passed.
* **Attendee List:** Shows registered names and emails, and allows canceling registrations with a modal confirmation popup.

### 5. Interactive Dashboard
* **Real-time Statistics:** Fetches total events, future upcoming events, and total attendee registrations.
* **Popular Spotlight Card:** Highlights the event with the highest registration count.

---

## 🔧 Database Models & Schema Specifications

The project leverages three Mongoose models linked through logical relationships:

### 1. Event Model (`backend/models/Event.js`)
Stores event details. Storing `category` as a String maintains backwards compatibility while enabling flexible, cascade-updated renames.
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

### 2. Category Model (`backend/models/Category.js`)
Defines categories that populate search filters and creation dropdowns.
```javascript
{
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" }
}
```

### 3. Registration Model (`backend/models/Registration.js`)
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

### Categories (`/api/categories`)
* `GET /api/categories` — Get all categories.
* `POST /api/categories` — Create a new category.
* `PUT /api/categories/:id` — Update category details (triggers event updates if renamed).
* `DELETE /api/categories/:id` — Delete category (fails if used by active events).

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
