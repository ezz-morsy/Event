# Explanation: Event Detail View and Form Management

## What was done and why
I implemented the interactive pages for displaying event details and managing event creation/editing in the Convene frontend:

1. **Event Detail & Attendee view (`frontend/views/detail.js`)**:
   - Shows comprehensive event information: Title, Category badge, Date & Time, Location, Description, and a real-time Attendance progress bar.
   - Embeds a **Registration Form**: Captures Name and Email. If the event hits its capacity limit, the input fields and submit button automatically disable, showing a warning that registration is closed.
   - Embeds an **Attendees List**: Lists everyone signed up. Each attendee chip has a "Cancel Registration" trash button.
   - Interactivity:
     - Form submissions trigger `POST /api/events/:id/register`. On success, the UI re-fetches and updates.
     - Cancellations trigger a global modal confirmation before issuing a `DELETE` call to the registration endpoint.

2. **Event Form view (`frontend/views/form.js`)**:
   - Features standard fields: Title, Category (Select dropdown), Capacity, Location, Date & Time (using a `datetime-local` picker), and Description.
   - Handles both **Create** and **Edit** modes:
     - If an ID is passed, it prefills the fields by calling `GET /api/events/:id`. It handles converting timezone dates from the database to format perfectly inside the `datetime-local` input (`YYYY-MM-DDTHH:MM`).
     - Submitting issues a `POST` or `PUT` request.
     - Handles errors: Shows inline warning text beneath inputs by matching the field name from the server's validation error array (`[{ field, message }]`).

---

## Alternatives Considered

### 1. Polling for Live Attendance Updates
- **Alternative:** Running `setInterval` to periodically poll the backend to update the attendee list.
- **Why rejected:** Polling increases network load unnecessarily. Since this is a single-user SPA session, re-fetching the list right after a user successfully registers or cancels a registration is sufficient to keep the UI perfectly synchronized.

### 2. Timezone conversion via external libraries (like Moment.js or date-fns)
- **Alternative:** Installing date libraries to parse and format dates for the form inputs.
- **Why rejected:** The project constraints avoid extra npm packages/dependencies. Using standard JavaScript `Date` offset calculations:
  ```js
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
  ```
  achieves the correct `datetime-local` format natively without bloating the bundle.

### 3. Basic alert box validations
- **Alternative:** Using generic HTML5 browser validations or JS `alert()` calls.
- **Why rejected:** Basic browser alert styles look unpolished. We map the API response's validation error shape directly to corresponding form inputs to provide custom, smooth inline feedback under each individual field for a premium user experience.
