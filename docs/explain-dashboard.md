# Explanation: Dashboard Feature

## What was done and why
I created a `dashboardController.js` and `dashboardRoutes.js` to provide high-level statistics for the application.

We need a way to show a quick summary of the platform's activity on the home page. The dashboard endpoint (`GET /api/dashboard`) calculates and returns:
1. **totalEvents**: The total number of events ever created.
2. **upcomingEvents**: Events that have a date in the future.
3. **totalRegistrations**: The total number of sign-ups across all events.
4. **mostPopularEvent**: The single event that has the highest number of registrations.

## Alternatives Considered
- **Alternative 1:** Having the frontend fetch all events and all registrations, and calculate these statistics itself.
  - **Why rejected:** This is very bad for performance. If we have 10,000 registrations, the frontend would have to download all 10,000 records just to count them! By doing it on the backend, we only send 4 small numbers to the frontend, making the app much faster.
- **Alternative 2:** Using a simple JavaScript loop on the backend to find the `mostPopularEvent`.
  - **Why rejected:** I initially considered fetching all events and counting registrations in a `for` loop, but I used a MongoDB Aggregation Pipeline instead (`Registration.aggregate(...)`). The database is heavily optimized for counting and sorting things. Asking the database to group and sort the registrations is much faster than doing it manually in Node.js memory.
