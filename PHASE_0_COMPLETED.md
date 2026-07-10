# Convene — Dev Handover & Reference for 4awmy

This document summarizes the current live configuration, credentials, and next steps for **4awmy** following the successful completion of **Phase 0**.

---

## 1. Live Environment URLs

* **Backend API Base URL:** `https://convene-backend-6hzd.onrender.com`
* **Health Check Endpoint:** `https://convene-backend-6hzd.onrender.com/api/health`
  * *Verification Status:* Passing green (returns `{"success":true}`).

---

## 2. Database Connection Credentials

The live database is hosted on a MongoDB Atlas M0 Free Cluster. 

* **Database Name:** `convene`
* **URI:**
  ```text
  mongodb+srv://abdelazizkhaled687_db_user:Aziz%3F%3F168%25@event.g1ydjqs.mongodb.net/convene?retryWrites=true&w=majority
  ```
  *(Note: The database password `Aziz??168%` contains special characters and has been properly URL-encoded as `Aziz%3F%3F168%25` so the driver does not throw URI parsing errors)*

---

## 3. Codebase Changes & Local Setup

* **Monorepo Restructuring:** All backend files are now organized under the `backend/` subdirectory.
* **Seeded Data:** The Atlas DB has been pre-seeded with three default events:
  1. *Tech Summit 2025*
  2. *Art Expo*
  3. *Past Event*
* **Local `.env` Configuration:**
  Create a file at `backend/.env` containing:
  ```env
  PORT=5000
  MONGO_URI=mongodb+srv://abdelazizkhaled687_db_user:Aziz%3F%3F168%25@event.g1ydjqs.mongodb.net/convene?retryWrites=true&w=majority
  CLIENT_ORIGIN=*
  ```

---

## 4. Next Steps for 4awmy

### Phase 1 — Backend Tasks
You will work on the `dev` branch. Create your feature branch from it:
1. **Branch Name:** `feature/registration`
   * Implement registration controller logic under `backend/controllers/registrationController.js` and wire endpoints in `backend/routes/eventRoutes.js`.
2. **Branch Name:** `feature/dashboard`
   * Implement the dashboard statistics logic under `backend/controllers/dashboardController.js` and mount it under `/api/dashboard`.

### Phase 2 — Frontend Tasks
1. Create a `frontend` folder at the project root.
2. Inside `frontend/app.js`, set the API URL to target the live Render backend:
   ```javascript
   const API = "https://convene-backend-6hzd.onrender.com";
   ```
3. Once the frontend is deployed on Vercel, share the URL with Ezz so he can update the `CLIENT_ORIGIN` env var in Render from `*` to your secure production Vercel domain.

---

Everything is fully verified and connected. Have fun building!
