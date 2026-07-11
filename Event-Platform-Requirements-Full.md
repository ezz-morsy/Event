# Final Project -- Event Management Platform

> **Replicated in Markdown from the provided project PDF.**

## Task Overview

The objective of this project is to design and develop a full-stack
Event Management Platform called **Convene**. The platform allows users
to create events, browse events, register as attendees, and view a
dashboard of platform statistics.

The project uses:

-   Node.js
-   Express.js
-   MongoDB + Mongoose
-   Vanilla JavaScript (Single Page Application)

The project is split into two repositories that communicate using
**HTTP**, **fetch()**, and **JSON**.

------------------------------------------------------------------------

# A) Dashboard View

The Dashboard is the application's landing page and displays live
platform statistics fetched from the backend API.

## Features

### Platform Statistics

-   Total number of events
-   Total upcoming events (future date)
-   Total registrations
-   Most popular event (highest registration count)

### Loading & Error States

-   Show loading indicator while fetching.
-   Show error toast if API request fails.

## JavaScript Requirements

-   Call `GET /api/dashboard` using `fetch()` on page load.
-   Render statistics dynamically.
-   Handle loading and error states.
-   Router lives in `app.js` — maps hash routes to loader functions.
-   Views are shown/hidden with JS display logic (no page reload).

## Backend Requirements

`GET /api/dashboard`

Returns:

``` json
{
  "totalEvents": 0,
  "upcomingEvents": 0,
  "totalRegistrations": 0,
  "mostPopularEvent": {}
}
```

Use MongoDB aggregation in a single query.

## CSS Requirements

-   Responsive stat cards
-   Mobile / Tablet / Desktop support
-   Navigation bar must be **fixed at the top** with clear **active-state styling** on the current page link.
-   Toast notifications: **green** for success, **red** for error.

------------------------------------------------------------------------

# B) Events List View

## Features

### Event Cards

Display:

-   Title
-   Category
-   Location
-   Date
-   Capacity
-   Registration count
-   Edit button
-   Delete button

### Search & Filters

-   Search by title
-   Filter by category
-   Filter by location
-   Filter by date
-   Clear filters button

## JavaScript Requirements

-   `GET /api/events`
-   Pass query parameters:
    -   `search`
    -   `category`
    -   `location`
    -   `date`
-   Card click opens Event Detail without page reload.
-   Delete confirmation modal before calling `DELETE /api/events/:id`.

## Backend Requirements

-   `GET /api/events`
-   Support query parameters
-   `DELETE /api/events/:id`
-   Delete associated registrations too.

## CSS Requirements

Responsive card grid.

------------------------------------------------------------------------

# C) Event Detail View

## Features

### Event Information

-   Title
-   Category
-   Location
-   Date & Time
-   Capacity
-   Description
-   Remaining spots

### Attendees

Display attendee:

-   Name
-   Email

### Registration Form

Fields:

-   Name
-   Email

Disable when event reaches capacity.

## JavaScript Requirements

-   `GET /api/events/:id`
-   `GET /api/events/:id/attendees`
-   `POST /api/events/:id/register`
-   Refresh attendees and remaining spots.
-   `DELETE /api/events/:id/registrations/:registrationId`

## Backend Requirements

-   `GET /api/events/:id`
-   `GET /api/events/:id/attendees`
-   `POST /api/events/:id/register`
-   Prevent duplicate email registration.
-   `DELETE /api/events/:id/registrations/:registrationId`

------------------------------------------------------------------------

# D) Create / Edit Event View

## Form Fields

-   Title
-   Category
-   Location
-   Date & Time
-   Capacity
-   Description

## Validation

-   All fields required
-   Capacity \> 0
-   Inline validation messages — styled **red**, placed **beneath each invalid field**
-   Success toast
-   Edit mode pre-fills form — detect edit mode by reading event ID from the **URL hash**
-   PUT for edit
-   POST for create

## JavaScript

-   `POST /api/events`
-   `PUT /api/events/:id`
-   Detect edit mode
-   Display server validation errors

## Backend

Validate all fields.

Return structured validation:

``` json
[
  {
    "field":"title",
    "message":"Title is required"
  }
]
```

Return updated document after PUT.

------------------------------------------------------------------------

# E) Backend API

## Event Endpoints

-   GET `/api/events`
-   POST `/api/events`
-   GET `/api/events/:id`
-   PUT `/api/events/:id`
-   DELETE `/api/events/:id`

## Registration Endpoints

-   POST `/api/events/:id/register`
-   GET `/api/events/:id/attendees`
-   DELETE `/api/events/:id/registrations/:registrationId`

## Dashboard

-   GET `/api/dashboard`

## Health

-   GET `/api/health`

## Response Envelope

Success

``` json
{
  "success": true,
  "data": {}
}
```

Failure

``` json
{
  "success": false,
  "message": "..."
}
```

## MongoDB Requirements

### Event Schema

-   title
-   category
-   location
-   date
-   capacity
-   description

### Registration Schema

-   eventId (ref)
-   name
-   email
-   registeredAt

Unique index:

-   eventId + email

## General Requirements

-   Port 5000
-   `.env` — must contain: `MONGO_URI`, `PORT`, `CLIENT_ORIGIN`
-   `.env.example` — same keys, empty values
-   `.gitignore` — exclude `node_modules` and `.env`
-   Enable CORS — allow origin **`http://localhost:5500`** (frontend Live Server)
-   Global 404 middleware
-   Global error middleware
-   `package.json` scripts:
    -   `npm start` → runs production server (`node server.js`)
    -   `npm run dev` → runs dev server with nodemon (`nodemon server.js`)

------------------------------------------------------------------------

# F) Navigation & SPA Routing

## Navigation

-   Dashboard
-   Events
-   New Event
-   Navigation bar must be **fixed at the top**
-   Active link must be visually highlighted

## Views

-   Dashboard (`#dashboard`)
-   Events (`#events`)
-   Detail (`#event/:id`)
-   Create/Edit (`#new-event` / `#edit-event/:id`)

## Requirements

-   Single `index.html` with one `<div id="app">`
-   Central router in **`app.js`** — maps hash to loader functions
-   View switching via JS **show/hide logic** — no full page reload
-   Edit mode: detect by reading event ID from the **URL hash**
-   Toast notifications: **green** for success, **red** for error
-   Confirmation modal before destructive actions
-   Responsive layout (Mobile / Tablet / Desktop)

------------------------------------------------------------------------

# Deliverables

## Repositories

**Two separate repositories** must be submitted:

-   Backend repo name: **`event-platform-backend`**
    -   `README.md` — setup steps, `.env` vars, all endpoints
    -   `.env.example`
    -   Exclude `node_modules` and `.env`
-   Frontend repo name: **`event-platform-frontend`**
    -   `README.md` — how to run, what each view does
    -   Exclude `node_modules`

> ⚠️ Current project uses a monorepo (`ezz-morsy/Event`) — must be split into two repos before submission.

## Demo Video

Must demonstrate:

-   Dashboard
-   Events List
-   Event Detail
-   Create Event
-   Edit Event
-   Registration Flow

------------------------------------------------------------------------

**End of replicated Markdown document.**
