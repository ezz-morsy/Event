# Explanation: Dashboard View and Events List View

## What was done and why
I implemented the premium interactive views for the Dashboard Statistics and the Events List Browser:

1. **Dashboard View (`frontend/views/dashboard.js`)**:
   - Shows the platform statistics summary: **Total Events**, **Upcoming Events**, and **Registrations**.
   - Spots the **Most Popular Event**: Spotlight card showing title, category, date & time, location, description, and link to view details. If no events have registrations yet, it displays a premium styled empty state.

2. **Events List View (`frontend/views/events.js`)**:
   - Features **Advanced Filtering Form**: Lets users dynamically search by Title (regex on backend), Category select dropdown, Location text input, and Date.
   - Embeds **Event Grid Layout**: Renders each event in its own card with beautiful category badges, location icons, formatted datetime stamps, descriptions, and a link to view details.
   - Includes **Delete Event Actions**: Embeds a trash icon button on each card that prompts the global confirmation modal before performing cascade deletion of the event and its registrants.

---

## Alternatives Considered

### 1. Manual string construction vs. dynamic templates
- **Alternative:** Building DOM nodes via `document.createElement` and appending them one by one.
- **Why rejected:** Manual DOM construction makes code long, hard to read, and complex to update. Templated strings parsed into `innerHTML` allow us to write clean semantic HTML structures directly in Javascript, significantly reducing lines of code while maintaining high maintainability.

### 2. Client-side vs. Server-side event filtering
- **Alternative:** Downloading all events at once and filtering them locally in JS.
- **Why rejected:** As events database grow, pulling thousands of events to the client drains mobile data bandwidth and degrades performance. Querying the backend API using `URLSearchParams` filters events directly at the database level, ensuring the client only receives relevant matching events.
