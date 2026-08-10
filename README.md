# Lyceum

Lyceum is a React/Vite learning application with a MongoDB-backed member system, saved progress, points, and a leaderboard.

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and set:

   - `MONGODB_URI` to a local MongoDB or MongoDB Atlas connection string.
   - `JWT_SECRET` to a random secret containing at least 32 characters.

3. Start the API in one terminal:

   ```sh
   npm run dev:server
   ```

4. Start Vite in a second terminal:

   ```sh
   npm run dev
   ```

Vite proxies `/api` requests to `http://localhost:3001`. For production, run `npm run build` followed by `npm start`; the backend serves the compiled `dist` application.

## Backend

All server logic lives under `backend/`:

- `models/User.js` stores member identity, hashed credentials, points, and unique progress achievements.
- `models/Counter.js` stores the site-view counter.
- `routes/auth.js` handles sign-up, login, logout, and session restoration.
- `routes/progress.js` awards deduplicated section and quiz points.
- `routes/leaderboard.js` returns member rankings.
- `routes/views.js` manages site views.

Passwords are hashed with bcrypt. Authentication uses a signed JWT in an HTTP-only, same-site cookie. Production deployments should use HTTPS, a strong private secret, and a restricted MongoDB database user.

## Point rules

- First visit to each application section: 10 points.
- First correct answer to each quiz question: 20 points.
- Reopening a section or repeating an already-earned answer does not add points.

Point awards require a logged-in member account.
