# Graph Report - .  (2026-07-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 323 nodes · 323 edges · 21 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d73ba203`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `AGENTS.md — Frontend` - 14 edges
2. `AGENTS.md — Backend` - 13 edges
3. `Convene – Dev Plan` - 12 edges
4. `4awmy — Your Tasks` - 11 edges
5. `E) Backend API` - 8 edges
6. `Branch: `feature/event-crud`` - 7 edges
7. `Deployment Steps` - 6 edges
8. `A) Dashboard View` - 5 edges
9. `B) Events List View` - 5 edges
10. `D) Create / Edit Event View` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (21 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (30): A) Dashboard View, Attendees, Backend, Backend Requirements, Backend Requirements, C) Event Detail View, code:json ({), code:json ([) (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (30): Branch: `feature/event-crud`, Branch: `feature/frontend-detail-form`, Branch: `feature/frontend-setup`, code:block1 (convene/                          ← repo root), code:js (registrationSchema.index({ eventId: 1, email: 1 }, { unique:), code:json ("scripts": {), code:js (app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://), code:js (const mongoose = require("mongoose");) (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (29): AGENTS.md — Frontend, API Base URL, code:block1 (git checkout dev), code:block10 (git add .), code:block11 (git push origin feature/<task-name>), code:block2 (git checkout -b feature/<your-task-name>), code:block3 (cd ../backend && node server.js), code:block4 (npx serve .) (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (27): AGENTS.md — Backend, API Response Format — Always Follow This, code:block1 (git checkout dev), code:js (// Added: needed for X because Y), code:block14 (curl http://localhost:5000/api/events), code:block15 (curl -X POST http://localhost:5000/api/events -H "Content-Ty), code:block16 (curl -X POST http://localhost:5000/api/events/<id>/register ), code:block17 (curl http://localhost:5000/api/dashboard) (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (14): app, connectDB, cors, dashboardRoutes, errorHandler, eventRoutes, express, healthRoutes (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (20): Architecture Overview, code:block1 (Browser (Vercel frontend)), code:block2 (mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/c), code:block3 (PORT=10000), code:js (// Change this:), code:block5 (# In backend/.env, temporarily swap MONGO_URI to your Atlas ), code:block6 (curl -X POST https://your-render-url.onrender.com/api/events), Deployment Steps (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (21): 10. Update the Frontend API Constant, 1. Fix `backend/config/db.js`, 2. Wire `connectDB()` in `server.js`, 3. Register Middleware in `server.js`, 4. Fix `models/Registration.js`, 4awmy — Your Tasks, 5. Fix `models/Event.js`, 6. Rename the Validator File (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): author, dependencies, cors, dotenv, express, mongoose, description, devDependencies (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (12): Event, mongoose, Event, getDashboardStats(), Registration, eventSchema, mongoose, mongoose (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (14): createEvent(), deleteEvent(), getEventById(), getEvents(), updateEvent(), deleteRegistration(), Event, getAttendees() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (13): 1. Set up MongoDB Atlas, 2. Deploy Backend to Render, 3. Seed the Live Database, 4. Smoke Test the Live Server, code:block1 (mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/c), code:block2 (MONGO_URI=<Atlas connection string>), code:bash (node seed.js), code:bash (curl https://<your-render-url>.onrender.com/api/health) (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (12): code:json ({), code:json ({), Dashboard, E) Backend API, Event Endpoints, Event Schema, General Requirements, Health (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (8): backdrop, cancelBtn, closeBtn, confirmBtn, handleRouting(), hideLoading(), routes, showLoading()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (10): 1. Live Environment URLs, 2. Database Connection Credentials, 3. Codebase Changes & Local Setup, 4. Next Steps for 4awmy, code:text (mongodb+srv://abdelazizkhaled687_db_user:Aziz%3F%3F168%25@ev), code:env (PORT=5000), code:javascript (const API = "https://convene-backend-6hzd.onrender.com";), Convene — Dev Handover & Reference for 4awmy (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (8): Branch: `feature/dashboard`, Branch: `feature/registration`, code:js (router.post("/:id/register", registerAttendee);), code:json ({), Phase 1 — Backend: 4awmy Tasks, Task 7 — registrationController.js, Task 8 — Add Registration Routes to eventRoutes.js, Task 9 — dashboardController.js + dashboardRoutes.js

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (7): code:block11 (git checkout dev), code:block12 (git add .), code:block13 (git push origin feature/<task-name>), Commit often with descriptive messages, Git Workflow — GitHub CLI, Push and open a PR (targeting `dev` branch), Start a task (always from `dev` branch)

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (7): B) Events List View, Backend Requirements, CSS Requirements, Event Cards, Features, JavaScript Requirements, Search & Filters

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): Alternatives Considered, Explanation: Dashboard Feature, What was done and why

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): Alternatives Considered, Explanation: Frontend Project Setup, What was done and why

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): Alternatives Considered, Explanation: Registration Feature, What was done and why

## Knowledge Gaps
- **190 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+185 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Convene – Dev Plan` connect `Community 1` to `Community 14`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `AGENTS.md — Backend` connect `Community 3` to `Community 15`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `E) Backend API` connect `Community 11` to `Community 0`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _190 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._