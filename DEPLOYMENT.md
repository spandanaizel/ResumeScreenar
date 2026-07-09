# Deployment Guide

This guide walks through deploying CareerFit AI's frontend, backend, and database to free/low-cost hosting suitable for a final-year project demo or portfolio link.

---

## 1. MongoDB Atlas Setup (Database)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a new **free-tier (M0) cluster**.
2. **Database user:** under *Database Access*, create a user with a username/password (avoid special characters like `@` or `/` in the password, or URL-encode them). Give it read/write access to the database.
3. **Network access:** under *Network Access*, add an IP whitelist entry. For a hosted backend (Render/Railway), the simplest option is `0.0.0.0/0` (allow from anywhere) — acceptable for a demo project, but note this is a security tradeoff and not recommended long-term for production data.
4. **Connection string:** under *Database → Connect → Drivers*, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-host>/<database-name>?retryWrites=true&w=majority&appName=<app-name>
   ```
   Replace `<username>`, `<password>`, and add your database name (e.g. `careerfit_ai`) before the `?`.
5. If your hosting provider's outbound network doesn't support the `mongodb+srv://` DNS SRV lookup (rare, but happens on some restrictive networks), Atlas also lets you copy a non-SRV connection string with all shard hosts listed explicitly (`mongodb://host1:27017,host2:27017,host3:27017/...`) — either format works with this app since `server/src/config/db.js` just calls `mongoose.connect(MONGO_URI)` regardless of format.

---

## 2. Backend Deployment (Render or Railway)

Both platforms work the same way for this project — pick either.

### Steps (Render)
1. Push your code to GitHub (see the root `.gitignore` — make sure `.env` is **not** committed).
2. On [render.com](https://render.com), create a **New Web Service** and connect your GitHub repo.
3. Set the **Root Directory** to `server`.
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add the environment variables listed below under *Settings → Environment*.
7. Deploy. Render will give you a public URL like `https://careerfit-ai-api.onrender.com`.

### Steps (Railway)
1. On [railway.app](https://railway.app), create a **New Project → Deploy from GitHub repo**.
2. Set the service root to `server`.
3. Railway auto-detects `npm install` / `npm start` from `package.json`.
4. Add the environment variables under the service's **Variables** tab.
5. Deploy and copy the generated public domain.

### Required Environment Variables (Backend)

| Variable | Example | Notes |
|---|---|---|
| `PORT` | `5000` | Some hosts inject their own `PORT` — if so, leave this and let the host override it |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/careerfit_ai?...` | From MongoDB Atlas |
| `JWT_SECRET` | a long random string | Use a strong, unique secret in production (not the dev default) |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `GEMINI_API_KEY` | your Gemini API key | From [Google AI Studio](https://ai.google.dev/) — never commit this |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Must match your deployed frontend's origin exactly, for CORS |
| `NODE_ENV` | `production` | Disables verbose logging and stack traces in error responses |

---

## 3. Frontend Deployment (Vercel)

1. On [vercel.com](https://vercel.com), create a **New Project** and import your GitHub repo.
2. Set the **Root Directory** to `client`.
3. Vercel auto-detects Vite: **Build Command** `npm run build`, **Output Directory** `dist`.
4. Add the environment variable:

   | Variable | Example |
   |---|---|
   | `VITE_API_BASE_URL` | `https://careerfit-ai-api.onrender.com/api` |

5. Deploy. Vercel gives you a public URL like `https://careerfit-ai.vercel.app`.
6. Go back to your backend's environment variables and set `CLIENT_URL` to this exact Vercel URL, then redeploy the backend so CORS allows it.

> Vite only exposes variables prefixed with `VITE_` to the client bundle, and they're baked in at build time — if you change `VITE_API_BASE_URL` after deploying, you must trigger a new build for it to take effect.

---

## 4. Common Deployment Errors

### CORS error
**Symptom:** browser console shows `blocked by CORS policy` when the frontend calls the API.
**Cause:** the backend's `CLIENT_URL` doesn't exactly match the frontend's deployed origin (protocol, domain, and no trailing slash all matter).
**Fix:** set `CLIENT_URL` on the backend to the exact frontend URL (e.g. `https://careerfit-ai.vercel.app`, not `.../` or `http://`), then redeploy the backend.

### MongoDB connection error
**Symptom:** backend logs `MongoDB connection error: ...` and exits, or requests time out.
**Cause:** wrong `MONGO_URI`, wrong password, or the hosting provider's IP isn't whitelisted in Atlas Network Access.
**Fix:** double-check the connection string (no typos, correct database name), confirm the Atlas user's password doesn't contain unencoded special characters, and add `0.0.0.0/0` (or your host's static IP range, if known) under Network Access.

### Gemini quota error
**Symptom:** analysis/roadmap requests fail with `429 RESOURCE_EXHAUSTED` from the Gemini API.
**Cause:** the API key has hit its free-tier request/token quota, or billing isn't enabled on the associated Google Cloud project.
**Fix:** check usage at [ai.dev/rate-limit](https://ai.dev/rate-limit), wait for the quota window to reset, or switch to a model with available quota on your key (the app reads the model name from a single constant in `server/src/services/aiService.js`).

### 404 API route error
**Symptom:** frontend requests return `404` for routes that work locally.
**Cause:** `VITE_API_BASE_URL` is missing `/api`, points to the wrong host, or wasn't rebuilt after being changed.
**Fix:** confirm `VITE_API_BASE_URL` ends in `/api` (e.g. `https://your-api.onrender.com/api`) and redeploy the frontend after any change to it.

### Environment variable missing
**Symptom:** backend crashes on startup or a specific feature fails (`GEMINI_API_KEY is not configured...`, `MONGO_URI is not defined...`).
**Cause:** an environment variable wasn't set on the hosting platform (local `.env` files are never deployed).
**Fix:** re-check every variable listed in section 2 is set in your hosting provider's dashboard, not just in your local `.env`.
