# Explanation: Registration Feature

## What was done and why
I added a new backend controller (`registrationController.js`) and endpoints in `eventRoutes.js` to allow people to register for events, view attendees, and cancel their registrations. 

We needed this because an Event Platform is useless if people can't actually sign up for the events! 
- **POST /api/events/:id/register**: Allows a user to join an event. It checks if the event exists, if there is still room (capacity), and if the user hasn't already registered.
- **GET /api/events/:id/attendees**: Returns a list of people who signed up so we can show them on the event page.
- **DELETE /api/events/:id/registrations/:registrationId**: Allows a user (or admin) to cancel a registration.

## Alternatives Considered
- **Alternative 1:** Embedding attendees directly inside the `Event` document (e.g., as an array `attendees: [{ name, email }]`). 
  - **Why rejected:** MongoDB documents have a 16MB size limit. If an event becomes super popular, embedding thousands of attendees inside the event document could hit that limit and slow down the database. Keeping `Registration` as a separate collection (the approach we chose) scales much better.
- **Alternative 2:** Trusting the frontend to check for capacity.
  - **Why rejected:** The backend should never trust the frontend! Two users might try to register at the exact same millisecond. The backend must independently check the capacity to prevent overbooking.
