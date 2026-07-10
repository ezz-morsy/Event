# DEPLOYMENT.md — Convene

> Goal: Get a live URL for the demo video submission.
> Stack: MongoDB Atlas (DB) + Render.com (backend) + Vercel (frontend)
> Cost: Free tier on all three platforms.

---

## Architecture Overview

```
Browser (Vercel frontend)
        |
        | fetch()
        v
Render.com  (Node/Express backend — port 5000 in prod, auto-assigned)
        |
        | mongoose.connect()
        v
MongoDB Atlas (cloud DB — free M0 cluster)
```

---

## Trade-Off Summary

### MongoDB Atlas (Free M0 Cluster)

| | |
|---|---|
| Pro | Fully managed, no server to maintain |
| Pro | Free forever on M0 tier (512 MB storage) |
| Pro | Easy connection string — drop into MONGO_URI env var |
| Con | M0 is slow on first connect (~1-2s cold connection) |
| Con | 512 MB limit — not an issue for a demo |
| Con | You must whitelist IPs (or allow all: 0.0.0.0/0 for demo) |
| Verdict | Perfect for this use case. Use it. |

---

### Render.com (Backend — Free Tier)

| | |
|---|---|
| Pro | Connects directly to GitHub — push to main and it auto-deploys |
| Pro | Sets env vars through their dashboard UI |
| Pro | Free HTTPS out of the box |
| Con | **Cold starts** — free tier spins down after 15 min of inactivity. First request takes 30-60s to wake up. |
| Con | Free tier has limited monthly hours (~750 hrs/month — fine for a demo) |
| Con | No persistent disk on free tier (not a problem since you use Atlas) |
| Verdict | Totally fine for a demo video. Mention the cold start — just hit the URL once before recording. |

---

### Vercel (Frontend — Free Hobby Plan)

| | |
|---|---|
| Pro | Instant global CDN deployment |
| Pro | Works with a plain `frontend/` folder — no build step needed |
| Pro | Free HTTPS, custom domain support |
| Con | The frontend will call your Render backend over HTTPS — you must update `const API` to the live Render URL |
| Con | If the Render backend is asleep, the frontend will show error toasts until it wakes up |
| Verdict | Best option for static HTML/JS. Zero config, live in 2 minutes. |

---

## Deployment Steps

### Step 1 — MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account.
2. Create a new **M0 free cluster** (any region close to you).
3. Under **Database Access**: create a user with username/password.
4. Under **Network Access**: Add IP `0.0.0.0/0` (allow all — fine for demo).
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/convene?retryWrites=true&w=majority
   ```
6. Save this — you need it for Render.

---

### Step 2 — Render.com (Backend)

1. Go to https://render.com and sign up (connect with GitHub).
2. Click **New** → **Web Service**.
3. Connect your GitHub repo and select the repo root (or `backend/` folder if monorepo).
4. Set the following:
   - **Root Directory:** `backend` (if monorepo)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add:
   ```
   PORT=10000
   MONGO_URI=<your Atlas connection string>
   CLIENT_ORIGIN=https://your-vercel-app.vercel.app
   ```
   (Use a placeholder for CLIENT_ORIGIN now — update it after Vercel deploy)
6. Click **Create Web Service**.
7. Wait for the first deploy (~2-3 min).
8. Copy your Render URL — looks like: `https://convene-api.onrender.com`
9. Run the seed script once remotely or temporarily allow it to run on startup.

> **Cold start warning:** Free Render instances sleep after 15 min of no traffic.
> Before recording your demo video, hit the health endpoint once and wait for it to wake up:
> `curl https://your-render-url.onrender.com/api/health`

---

### Step 3 — Update Frontend API URL

Before deploying frontend, change one line in `frontend/app.js`:

```js
// Change this:
const API = "http://localhost:5000";

// To this:
const API = "https://your-render-url.onrender.com";
```

Commit and push that change.

---

### Step 4 — Vercel (Frontend)

1. Go to https://vercel.com and sign up (connect with GitHub).
2. Click **Add New Project** → import your GitHub repo.
3. Set **Root Directory** to `frontend` (since it is a monorepo).
4. Leave everything else default — Vercel detects static HTML automatically.
5. Click **Deploy**.
6. In ~30 seconds you get a live URL like: `https://convene.vercel.app`
7. Go back to Render → update the `CLIENT_ORIGIN` env var to this Vercel URL.
8. Trigger a manual redeploy on Render so the CORS setting takes effect.

---

### Step 5 — Seed the Live Database

After both services are up, either:

**Option A — Run seed locally against Atlas:**
```
# In backend/.env, temporarily swap MONGO_URI to your Atlas connection string
node seed.js
```

**Option B — Hit the API with curl to create sample events:**
```
curl -X POST https://your-render-url.onrender.com/api/events \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Tech Summit 2025\",\"category\":\"Technology\",\"location\":\"Cairo\",\"date\":\"2025-12-01\",\"capacity\":100,\"description\":\"A summit for tech enthusiasts.\"}"
```

---

## Final Checklist Before Recording Demo

- [ ] Atlas cluster is running and network access allows all IPs
- [ ] Render backend is awake — `curl https://your-url/api/health` returns `{ success: true }`
- [ ] Frontend API constant points to the live Render URL (not localhost)
- [ ] Vercel frontend loads without console errors
- [ ] CORS: `CLIENT_ORIGIN` on Render matches the exact Vercel URL
- [ ] At least 2-3 events exist in the DB
- [ ] All 6 demo flows work: Dashboard, Events List, Event Detail, Create, Edit, Registration

---

## Quick Reference — Live URLs to Fill In

| Service | URL |
|---|---|
| Backend (Render) | `https://________________.onrender.com` |
| Frontend (Vercel) | `https://________________.vercel.app` |
| MongoDB Atlas | (connection string, never share publicly) |

---

## What Could Go Wrong (and the fix)

| Problem | Cause | Fix |
|---|---|---|
| Frontend gets CORS error | `CLIENT_ORIGIN` on Render does not match Vercel URL exactly | Update env var, redeploy Render |
| Backend returns 503 / timeout | Render cold start | Wait 60s, try again |
| `MongooseError: connection failed` | Atlas IP not whitelisted | Add `0.0.0.0/0` to Atlas Network Access |
| Frontend shows blank page | API still points to localhost | Update `const API` and redeploy Vercel |
| Dashboard shows 0 for everything | DB is empty | Run seed or create events via the form |
