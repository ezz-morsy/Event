# Phase 0 — Shared Setup Checklist

> **CRITICAL:** Use the `dev` branch for all development! Branch off `dev` and open all PRs targeting `dev`.
> Do this before anything else. Finish Phase 0 before splitting into feature branches.
> Both devs work through this list together or in parallel as assigned below.

---

## Task Ownership

| Task | Owner | Status |
|---|---|---|
| Set up MongoDB Atlas cluster | **Ezz** | [ ] |
| Fix `config/db.js` | **Fawmy** | [x] Done |
| Wire `connectDB()` in `server.js` | **Fawmy** | [x] Done |
| Register `notFound` + `errorHandler` in `server.js` | **Fawmy** | [x] Done |
| Create `backend/.env.example` | **Fawmy** | [x] Done |
| Add unique index to `Registration.js` | **Fawmy** | [x] Done |
| Add `min: 1` to `capacity` in `Event.js` | **Fawmy** | [x] Done |
| Rename `utilities/  eventValidator.js` | **Fawmy** | [x] Done |
| Create `backend/seed.js` | **Fawmy** | [x] Done |
| Deploy backend to Render | **Ezz** | [ ] |
| Seed the live Atlas DB | **Ezz** | [ ] |
| Smoke test live server | **Ezz** | [ ] |
| Share live Render URL with Fawmy | **Ezz** | [ ] |
| Update `const API` in `frontend/app.js` to live URL | **Fawmy** | [ ] (BLOCKED - Waiting for Ezz Render URL) |

---

## Ezz — Your Tasks

### 1. Set up MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account (or log in)
2. Create a new **M0 free cluster** — pick any region
3. Under **Database Access**: create a user with a username and password — save both
4. Under **Network Access**: click Add IP → enter `0.0.0.0/0` → confirm
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/convene?retryWrites=true&w=majority
   ```
6. Share the connection string with Fawmy so he can put it in `.env`

---

### 2. Deploy Backend to Render

> Do this after Fawmy pushes his code fixes to main.

1. Go to https://render.com → sign up with GitHub
2. Click **New** → **Web Service** → connect the `ezz-morsy/Event` repo
3. Settings:
   - **Root Directory:** leave empty (server.js is at root for now)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Under **Environment Variables** → add:
   ```
   MONGO_URI=<Atlas connection string>
   CLIENT_ORIGIN=*
   PORT=5000
   ```
5. Click **Create Web Service** — wait for first deploy (~2-3 min)
6. Copy the live URL (e.g. `https://convene-api.onrender.com`)
7. Share the URL with Fawmy

---

### 3. Seed the Live Database

> Do this after Render is up and running.

Temporarily update your local `backend/.env` to use the Atlas connection string, then run:

```bash
node seed.js
```

Output should be: `Seeded.`

Swap your local `.env` `MONGO_URI` back to `mongodb://localhost:27017/convene` after.

---

### 4. Smoke Test the Live Server

```bash
curl https://<your-render-url>.onrender.com/api/health
```

Expected response:
```json
{ "success": true }
```

If it works — Phase 0 is done on your end. Tell Fawmy the URL.

---

## Fawmy — Your Tasks

> Start these while Ezz sets up Atlas and Render.

### 1. Fix `backend/config/db.js`

Replace the current content (which is just one empty line) with:

```js
const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
};

module.exports = connectDB;
```

---

### 2. Wire `connectDB()` in `server.js`

Add these two lines to `server.js`:

```js
// At the top with other requires:
const connectDB = require("./config/db");

// Before app.listen():
connectDB();
```

---

### 3. Register Middleware in `server.js`

`notFound` and `errorHandler` are imported but never registered. Add after all route declarations:

```js
app.use(notFound);
app.use(errorHandler);
```

---

### 4. Fix `models/Registration.js`

Add the unique compound index before `module.exports`:

```js
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
```

---

### 5. Fix `models/Event.js`

Update the `capacity` field to add a min validator:

```js
capacity: {
    type: Number,
    required: true,
    min: [1, "Capacity must be greater than 0"]
},
```

---

### 6. Rename the Validator File

The file has leading spaces in its name. Run this from the `backend/` folder:

```powershell
Rename-Item "utilities/  eventValidator.js" "utilities/eventValidator.js"
```

---

### 7. Create `.env.example`

Create `backend/.env.example` with:

```
PORT=
MONGO_URI=
CLIENT_ORIGIN=
```

---

### 8. Create `backend/seed.js`

Create the file with this content:

```js
const mongoose = require("mongoose");
require("dotenv").config();
const Event = require("./models/Event");

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    await Event.deleteMany({});
    await Event.insertMany([
        {
            title: "Tech Summit 2025",
            category: "Technology",
            location: "Cairo",
            date: new Date("2025-12-01T10:00:00"),
            capacity: 100,
            description: "A summit for tech enthusiasts."
        },
        {
            title: "Art Expo",
            category: "Art",
            location: "Alexandria",
            date: new Date("2025-11-15T14:00:00"),
            capacity: 50,
            description: "Annual art exhibition."
        },
        {
            title: "Past Event",
            category: "Other",
            location: "Giza",
            date: new Date("2024-01-01T10:00:00"),
            capacity: 30,
            description: "This event has already passed."
        }
    ]);
    console.log("Seeded.");
    process.exit();
}

seed();
```

---

### 9. Commit and Push All Your Fixes

```bash
git add .
git commit -m "phase 0: fix db connection, middleware wiring, model fixes, seed script"
git push origin main
```

Then tell Ezz to deploy on Render.

---

### 10. Update the Frontend API Constant

Once Ezz shares the live Render URL, update `frontend/app.js`:

```js
const API = "https://<render-url>.onrender.com";
```

---

## Phase 0 Done When

- [ ] `curl https://<render-url>.onrender.com/api/health` returns `{ "success": true }`
- [ ] DB has 3 seeded events (check via `GET /api/events`)
- [ ] Fawmy has the live Render URL in `frontend/app.js`
- [ ] Both devs can hit the live API with no errors

Once all boxes are checked — split into feature branches and start Phase 1.
