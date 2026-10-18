# Birthday Wishes

## Run locally

1. Install Node.js 20 or newer.
2. In this folder, run `npm install`.
3. Start the app with `npm start`.
4. Open `http://localhost:3000/birthday/`.

The local app continues to use SQLite and the local `server.js`. Vercel uses a separate serverless API and Supabase database; deployment does not change the local run commands.

### Open it on other devices on the same Wi-Fi

1. Start the server with `npm run start:network`.
2. Find this computer's local IPv4 address (`ipconfig` on Windows, or `ip addr` on Linux).
3. On a phone, tablet, or another computer connected to the same trusted Wi-Fi, open `http://<computer-ip>:3000/birthday/` (replace `<computer-ip>` with the IPv4 address).
4. If it does not connect, allow Node.js through the computer's private-network firewall.

This network mode uses plain HTTP. Use it only on a trusted private network; do not forward the port or expose it directly to the internet.

After signing in, choose from seven games: collect the stars, pop the balloons, birthday quiz, memory match, word scramble, party picker, or repeat the birthday rhythm. Each game unlocks the personalized birthday reveal. Choose Easy, Normal, or Hard for a shorter or longer challenge; quizzes and word puzzles allow retries.

## Birthday experience features

- Personalize the page with color themes, sound effects, optional generated music, reduced motion, and high contrast. Display preferences are saved in the current browser.
- Add up to five photo memories (up to 2 MB each). They are stored in this browser only and are never uploaded.
- Add birthday wishes from friends to the profile and view them on the personalized reveal.
- Track wins, game variety, Hard-mode wins, daily challenges, and achievements. Progress is saved to the local server database; interrupted offline wins are queued on the device and synchronized after logging in again.
- Download or share a personalized birthday-card image after winning.
- Install the app and use its cached game shell offline on supported browsers. Offline play requires a profile previously saved on that same device; account changes and progress syncing require a connection.

Sign-up stores profiles in `data/birthday.sqlite`. Passwords are hashed with Node's built-in scrypt; plaintext passwords are never stored. Birthday and profile fields are stored as entered in this local database, so protect the file and device. Login sessions use an HTTP-only, SameSite cookie and are held in memory, so users must log in again after the server restarts.

The app can save a copy of the signed-in profile (including its birthday details) in that browser for offline play; it does not save the password. Use **Clear photos and offline copy** to remove that browser's local photos, profile copy, and unsynced wins. **Delete my account and data** deletes the server account and progress as well as those local copies. Browser storage is specific to a browser and device, so clearing data in one browser does not clear copies in others.

Service workers and app installation generally require HTTPS or `localhost`. The same-Wi-Fi instructions above use HTTP, so offline caching and installation may not be available when opened from another device over a LAN address. Offline wins can only sync while connected and signed in.

For the local SQLite app, the first registered account becomes the administrator; later accounts are regular users. Sign in with that account and open `http://localhost:3000/admin/` to search user profiles or delete regular accounts. Admin authorization is enforced by the server. Existing local databases are migrated so the earliest account becomes admin if no admin exists.

## Deploy on Vercel with Supabase

The Vercel build uses the serverless endpoint in `api/index.js`; it does not run the local SQLite server. Create a Supabase project, then paste and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor. The schema enables row-level security and only grants application access to the server-side service role. Keep that service-role key private: never put it in browser code, source control, or a `NEXT_PUBLIC_*` variable.

For local Vercel-function testing, copy `.env.example` to `.env.local`, fill in the Supabase service-role key and the other private values, then run `npx vercel dev` from the project root. The sample file already contains this project's Supabase URL. Do not commit `.env.local`; it is excluded by `.gitignore`. The regular `npm start` command intentionally continues to use the local SQLite server.

Before deploying, set these **Production** (and Preview, if needed) environment variables in Vercel Project Settings → Environment Variables:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL, such as `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The project's secret `service_role` key from Supabase API settings |
| `SESSION_SECRET` | A private random string of at least 32 characters; generate a different value for each environment |
| `ADMIN_USERNAME` | The username you reserve for the site administrator (3–32 letters, numbers, dots, underscores, or hyphens) |
| `ADMIN_PASSWORD` | A private administrator password of 16–128 characters |

Deploy the project root folder containing `vercel.json`, `package.json`, `api/`, `birthday/`, and `admin/` to Vercel (using its CLI or by connecting a Git repository). Do not set `birthday/` itself as the Vercel project root; the API and deployment configuration are in the parent folder. Open the resulting HTTPS URL and choose **Create an account**. For that one-time administrator account, use the exact `ADMIN_USERNAME` and `ADMIN_PASSWORD` configured in Vercel. Other usernames can sign up normally and receive regular-user access. The configured administrator username is reserved; attempting to register it with any other password is rejected. Do not share the admin password or Supabase service-role key.

Check that the deployment URL opens the birthday app at `/` and `/birthday/`, then log in and visit `/admin/` to verify administrator access. The admin page can search accounts and delete regular-user accounts. The functions require the Supabase schema and all five environment variables; otherwise, API requests return a configuration error. Redeploy after changing Production environment variables.

The local SQLite database is not uploaded or automatically migrated to Supabase. This deployment starts with empty hosted accounts; local and hosted accounts/passwords are separate. The hosting and database providers have their own free-tier quotas, limits, and terms, which can change; confirm current pricing in their dashboards. This setup does not guarantee that either service will remain free or available without limits.

Hosted login sessions are signed, HTTP-only, Secure, SameSite cookies and last up to seven days. Deleting an account removes its server profile and progress, and its cookie can no longer authenticate. Photo memories and visual preferences remain local to each browser; they are not uploaded. Review the providers' current privacy, backup, and retention policies before storing real birthday data or making the site public.

## Tests

Run `npm test` to exercise the Vercel API using a mocked Supabase Data API. This verifies API behavior, not your deployed Supabase project configuration.

The server binds to `127.0.0.1` by default. For same-Wi-Fi use, start it with `npm run start:network`. Treat birthday details as sensitive personal information.
