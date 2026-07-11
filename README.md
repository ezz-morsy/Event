# Modern Reservation System — Event Platform

A clean, responsive, and dual-themed single-page application (SPA) designed for event management and registration. The system is split into a **Node.js/Express/MongoDB** REST API backend and a **Vanilla JS (ES6 modules)/CSS3** frontend.

---

## 📁 Project Structure

This project is organized as a monorepo containing both the backend and frontend codebases:

```text
Event/ (Root)
├── backend/                  # REST API Backend
│   ├── config/               # Database connection setup (Mongoose)
│   ├── controllers/          # Business logic handlers (Event, Registration, Dashboard)
│   ├── middleware/           # Express error handler & route fallback fallbacks
│   ├── models/               # MongoDB models (Event, Registration)
│   ├── routes/               # API endpoint routing declarations
│   ├── utilities/            # Data validation helper modules
│   ├── .env.example          # Sample environment configuration
│   ├── package.json          # Node project dependencies & scripts
│   ├── README.md             # Backend setup & API documentation
│   ├── seed.js               # Atlas pre-seeding script
│   └── server.js             # API entrypoint
│
├── frontend/                 # Client SPA Web Application
│   ├── views/                # Modular client view scripts
│   │   ├── dashboard.js      # Dashboard stats & popular event spotlight
│   │   ├── detail.js         # Event specs, registration form, & attendee list
│   │   ├── events.js         # Event list browser with search filter queries
│   │   └── form.js           # Shared event create/edit form
│   ├── app.js                # Custom SPA router, modal, & toast notification systems
│   ├── index.html            # Main SPA entrypoint shell
│   ├── README.md             # Frontend setup & folder overview
│   └── style.css             # Structured design system (Light/Dark themes)
│
├── DEPLOYMENT.md             # Production hosting configurations (Render + Vercel)
└── README.md                 # Project master manual (This file)
```

---

## ⚡ Core Features

### 1. Dynamic Theming (Dark & Light Modes)
* **Toggle Selector:** A theme button located directly in the navigation bar allows users to switch modes.
* **Smart Storing:** Theme preferences are stored in the browser's `localStorage` and automatically restored on return.
* **Visuals:** Uses CSS Custom Properties (variables) to customize slate/white tones, ambient gradients, cards, and input wells based on the selected theme.

### 2. Event Management (CRUD)
* **Creation:** Publish new events with standard fields: title, category, date & time, location, capacity, and description.
* **Future-Date Validation:** Enforces that new events cannot be created with a date in the past.
* **Editing:** Pre-fills the event details by reading parameters from the URL hash route.
* **Capacity Guardrail:** During edits, prevents reducing the capacity below the number of currently registered attendees.
* **Cascade Deletion:** Deleting an event automatically triggers a MongoDB transaction to clean up and delete all associated registrations.

### 3. Registration System
* **Real-time Status Bar:** Dynamic progress bar showing attendance vs. maximum capacity.
* **Double-Constraint Guards:**
  * **Duplicate Prevention:** Enforces a compound unique index in MongoDB on `(eventId, email)` to prevent attendees from registering twice for the same event.
  * **Capacity Prevention:** Blocks further registrations once the event reaches its capacity.
  * **Past Event Block:** Blocks registration if the event date has already passed.
* **Attendee Listing:** Shows the list of attendees (displaying only name & email). Allows canceling/deleting registrations with a warning confirmation.

### 4. Interactive Dashboard
* **Real-time Statistics:** Fetches total events, future upcoming events, and registration counts from the database.
* **Popular Spotliner:** Highlights the event with the highest registration count on a custom card.

### 5. Category Management (CRUD)
* **Dedicated Manager:** A "Categories" view accessible via the navigation bar allows users to view, create, edit, and delete categories.
* **Rename Cascades:** Renaming a category automatically updates the category name on all events using it in the database.
* **Constraint Protection:** Deletion of a category is blocked if any events are currently assigned to it.
* **Auto Seeding:** Default categories (Technology, Art, Business, Social, Sports, Education, Music, Other) are seeded automatically on first launch.

---

## 🔧 Database Models

### Event Schema
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

### Category Schema
```javascript
{
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" }
}
```

### Registration Schema
```javascript
{
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
}
// Compound Index: { eventId: 1, email: 1 } (Unique)
```

---

## 🚀 Running Locally

### 1. Run the Backend API
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
   Add your MongoDB Connection String inside `.env` (`MONGO_URI`).
4. (Optional) Pre-seed the database:
   ```bash
   node seed.js
   ```
5. Start the server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Run the Frontend SPA
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Serve the static assets using an HTTP server (to support ES6 Modules):
   ```bash
   # Option A: Python server
   python -m http.server 5500
   
   # Option B: Node http-server
   npx http-server -p 5500
   ```
3. Open your browser and navigate to: **`http://localhost:5500`**
