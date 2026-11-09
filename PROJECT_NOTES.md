# HelpDesk Pro: Project Notes

A record of what has been done in this project so far.

## 1. Project created

- Angular 22 app using standalone components, SCSS styles, the Angular Router and Vitest for tests.
- Committed as `initial commit` (`535fbe4`).
- The app is still the default starter: `src/app/app.routes.ts` has no routes and `src/app/app.html` is the default page.

## 2. MSW (Mock Service Worker) installed

MSW lets the app use a fake API by intercepting network requests.

Command used:

```bash
npm install msw --save-dev
```

Result:

- `msw` `^3.0.3` was added to `devDependencies` in `package.json`.
- `package-lock.json` was updated (19 packages added).
- `npm install` reported 0 vulnerabilities.

Only the package is installed. MSW is not set up in the app yet: there are no mock handlers, no worker file in `public/`, and nothing starts it, so it does not intercept any requests.

## 3. Folder structure created

```
src/app/pages/
├── login/
└── dashboard/
    ├── tickets/
    ├── topics/
    ├── landing-page/
    └── settings/
```

The dashboard's four navigation options sit inside `dashboard/`.

## 4. Components and routes created

Each page got a component generated with `ng generate component`, and its route was added to `src/app/app.routes.ts`:

| URL                       | Component     |
| ------------------------- | ------------- |
| `/login`                  | `Login`       |
| `/dashboard`              | `Dashboard`   |
| `/dashboard/tickets`      | `Tickets`     |
| `/dashboard/topics`       | `Topics`      |
| `/dashboard/landing-page` | `LandingPage` |
| `/dashboard/settings`     | `Settings`    |

- The four dashboard pages are child routes of `/dashboard`. `dashboard.html` has a link to each one and a `<router-outlet />` that displays the selected page.
- `dashboard.spec.ts` now provides the router, because the dashboard's links need it.
- The pages still show the generated "works!" text.
- `/` later got a redirect to `/login`.
- The starter content in `src/app/app.html` was later removed, leaving only `<router-outlet>`. The `should render title` test in `app.spec.ts` still looks for that content, so it currently fails.

## 5. Login page UI created

The login page layout and styling were built from the supplied design, in `login.html` and `login.scss`:

- Left blue panel: Acme Corp logo, "Support portal" heading and text, and "Powered by HelpDesk Pro".
- Right panel: sign-in card with "Continue with Google", email and password fields, "Forgot password?" and "Sign in".

`src/styles.scss` now sets the page margin to 0 so the panels reach the edges of the screen.

This step was UI structure only, with no form logic (added in section 7).

## 6. Colours moved to global CSS variables

The colour variables from `login.scss` were moved to `:root` in `src/styles.scss` as CSS variables, so any component can use them, for example `color: var(--primary);`.

Available variables: `--primary`, `--link`, `--text`, `--text-muted`, `--border`, `--border-light`, `--background`, `--white`, `--error`.

## 7. Login reactive form created

A reactive form was added to the login page, then its code was removed from `login.ts` because Rufiyan will write that part. It will be reviewed against the latest Angular features once done.

- `login.ts` now has Rufiyan's own form code, which is still in progress.
- `login.html` still has the form bindings and error messages.
- `login.scss` and `styles.scss` still have the error styling and the `--error` colour.

## 8. Routes lazy loaded

All six routes in `src/app/app.routes.ts` now use `loadComponent`, so each page's code downloads only when that page is opened.

## 9. Dummy login added

`onSubmit()` in `login.ts` checks the details against dummy credentials hardcoded in the file:

- Username: `admin`
- Password: `123`

If they match, the user goes to `/dashboard`. If not, the page shows "Invalid username or password." and the user stays on it.

This is for development only: it is not real authentication, and `/dashboard` can still be opened directly without logging in.

The login form's Email field was later replaced with Username.

## 10. Dashboard layout and Tickets page UI created

Built from the supplied design:

- `dashboard.html` and `dashboard.scss`: left sidebar with the Acme Corp logo, the four navigation links with the current page highlighted, and the user at the bottom. The selected page shows on the right.
- `/dashboard` now redirects to `/dashboard/tickets`, so Tickets shows first.
- `tickets.html`, `tickets.scss` and `tickets.ts`: header, "+ New ticket", search, filters, "Advanced search", ticket table and footer text.
- `styles.scss`: new `--primary-light` and `--status-*` colour variables. The font moved here from `login.scss` so every page uses it.

This is UI only. The tickets are 8 hardcoded rows in `tickets.ts`, and the user (Alex Morgan) is hardcoded in `dashboard.html`. Search, filters and buttons do nothing. "10,000 tickets" and the footer text about virtual scroll and server search are design text only: none of that is built yet.

## 11. MSW mock API set up for tickets

Command used:

```bash
npx msw init public --save
```

- `public/mockServiceWorker.js`: the worker file MSW generates. Do not edit it by hand.
- `package.json`: `msw.workerDirectory` records where the worker file lives.
- `src/mocks/handlers.ts`: the mock data and the `GET /api/tickets` endpoint. It returns the same 8 tickets as the page.
- `src/mocks/browser.ts`: creates the worker from the handlers.
- `src/main.ts`: starts the worker before the app loads, in development mode only. Requests with no mock handler pass through as normal.

## 12. Tickets page gets its data from the mock API

- `tickets.ts` loads the tickets from `GET /api/tickets` using `httpResource`. The hardcoded rows were removed, so the data now lives only in `src/mocks/handlers.ts`.
- `tickets.html` shows "Loading tickets..." while waiting and "Could not load tickets." if the request fails.

## 13. MSW removed, mock data moved to a JSON file

MSW was removed to reduce complexity. Sections 2, 11 and 12 describe the earlier setup.

- Removed: the `msw` package, the `msw` entry in `package.json`, `public/mockServiceWorker.js` and `src/mocks/`.
- `src/main.ts` is back to starting the app directly.
- `public/mock-data/tickets.json` now holds the 8 tickets. To change the mock data, edit this file.
- `tickets.ts` still uses `httpResource`, now loading `/mock-data/tickets.json`.

Files in `public/` are included in production builds, so this JSON file ships with the app until it is replaced by a real API.

## 14. Tickets table uses Angular Material

Angular Material was chosen for the table because it is free (MIT licence).

Command used:

```bash
npm install @angular/material @angular/cdk
```

- `tickets.html` now uses `mat-table`, with its columns listed in `columns` in `tickets.ts`.
- `tickets.scss` styles the table through Material's `--mat-table-*` CSS variables, so it keeps the look of the design. No Material theme was added.
- `styles.scss` has a new global `--font-family` variable, because Material's table needs the font set explicitly.
- The loading and error messages now sit in the table's no-data row, along with a new "No tickets found." message for an empty list.

`mat-table` has no built-in virtual scrolling, so all rows are rendered. Pagination is not added.

## 15. Tickets table sorting added

All seven columns can be sorted by clicking their header, using Material's `MatSort` and `MatTableDataSource`. Sorting happens in the browser, on the tickets already loaded.

- Most columns sort alphabetically.
- Priority sorts by importance: Low, Medium, High, Urgent.
- Updated sorts by time: most recent first when ascending. This reads the display text in the mock data, such as "4 min ago", so it needs changing when real dates arrive.

## 16. Tickets search added

The search box filters the table as the user types, matching text anywhere in the subject or ID, ignoring upper and lower case. It uses the `filter` on `MatTableDataSource`, so it runs in the browser on the tickets already loaded, and it works together with sorting. No matches shows "No tickets found."

The placeholder reads "Search by subject or ID". The design also mentioned requester, but the mock data has no requester field, so that was left out.

## 17. Microfrontend architecture started

The project is moving to microfrontends using Native Federation (`@angular-architects/native-federation`), with Rufiyan doing the setup.

- Shell: the root `helpdesk-pro` app, port 4200.
- Tickets: Angular remote in `projects/tickets`, port 4201, now loaded by the shell. It also works on its own: its `angular.json` assets include the shell's `public/mock-data`, and its `styles.scss` loads the shell's `src/styles.scss`.
- Planned: Topics and Landing page as Angular remotes, and Settings as a React remote. The React work comes later, after the Tickets functionality is finished.

Backend: started in `server/` at the repo root, using Express and Node's built-in `node:sqlite`, with Rufiyan doing the setup. Its own `.gitignore` keeps `node_modules` and the database file out of Git. `server/db.ts` creates the tickets table, and `npm run seed` copies the tickets from `public/mock-data/tickets.json` into `server/helpdesk.db`. `server/tsconfig.json` sets up the editor and type checks for Node.

The Tickets page now loads from `GET http://localhost:3000/api/tickets` instead of the mock JSON file, so the backend must be running (`npm run dev` in `server/`). `server/server.ts` uses `cors` to allow requests from `localhost:4200` and `localhost:4201`. The API URL is hardcoded for local development. `public/mock-data/tickets.json` stays because `seed.ts` reads it.

API calls in the tickets remote now go through a service instead of `httpResource`:

- `projects/tickets/src/app/core/api-urls.ts`: stores the API URLs in `API_URLS`.
- `projects/tickets/src/app/core/api.ts`: the `Api` service, with `get`, `post`, `put`, `patch` and `delete` methods that take any URL.
- `tickets.ts` calls `api.get` through `rxResource`, which keeps the loading and error states.

Only `GET /api/tickets` exists on the backend so far.

`npm run seed` now fills the database with 10,000 tickets, `HD-00483` to `HD-10482`. The 8 tickets from the mock JSON file are kept and the rest are randomly generated, so re-running it changes the generated tickets. 

## 18. Server-side paging with mat-paginator

`GET /api/tickets` now returns one page at a time as `{ tickets, total }`, and paging, search and sorting all run in SQLite.

| Query parameter | Meaning | Default |
| --- | --- | --- |
| `page` | Page number, starting at 1 | `1` |
| `pageSize` | Tickets per page, up to 100 | `25` |
| `search` | Text to find in the subject or ID | None |
| `sortBy` | `id`, `subject`, `topic`, `status`, `priority`, `assignee` or `updated` | None |
| `sortDir` | `asc` or `desc` | Newest ID first |

- `tickets.ts` no longer uses `MatTableDataSource`. It keeps the page, search and sort in signals, and `rxResource` reloads when any of them change.
- The table has a `mat-paginator` showing 25 tickets per page. Changing the search or sort returns to the first page.
- Search waits 300 ms after typing stops.
- Priority and Updated keep their sort order through SQL `CASE` expressions in `server.ts`. Updated still reads display text such as "4 min ago", so it needs changing when real dates arrive.

## 19. Tickets filters added

The Status, Priority, Assignee and Topic filters now work, and run on the server.

- `GET /api/tickets` accepts `status`, `priority`, `assignee` and `topic` as exact matches. They combine with each other, and with search and sorting.
- `tickets.html` uses a native `<select>` for each filter, styled to look like the design's buttons. Each filter shows all tickets until an option is chosen.
- Choosing a filter returns to the first page.
- The filter options are listed in `tickets.ts`, so they must be kept in step with the data.
- The header shows "Total tickets: N" using the API's `total`, so it follows search and filters.
- The footer's virtual scroll line was removed, because the table uses paging.

## 20. Tickets page fits the screen

- `dashboard.scss` now makes the layout exactly the height of the screen, and `.content` scrolls if a page is taller than that.
- In `tickets.scss`, the header, toolbar, paginator and footer stay in place, and only the table rows scroll inside `.table-scroll`.
- The table's column headings stay visible while scrolling, and each new set of rows starts at the top.
- The table card has a minimum height of 240px, so on very short windows `.content` scrolls instead.

## 21. New ticket page added

"+ New ticket" opens `/dashboard/tickets/new`, built from the supplied design in `projects/tickets/src/app/tickets/new-ticket/`.

- Creating a ticket calls `POST /api/tickets`, saves it to SQLite and returns to the list, where it appears first. New tickets get the next ID, status Open, assignee Unassigned and updated "Just now".
- Requester email must be valid and Subject is required, in both the form and the server. Description is optional.
- `db.ts` adds `requester_email` and `description` columns, including to an existing database.
- The tickets remote now exposes `./Routes` (`tickets.routes.ts`) instead of `./Component`, and the shell loads it with `loadChildren`, so the remote owns its own pages. Changing `federation.config.mjs` needs `ng serve tickets` to be restarted.
- `ticket-options.ts` holds the status, priority, assignee and topic lists.

Not built yet: the Similar articles links are static and do nothing. The list page does not show requester email or description.

## 22. CKEditor 5 added for the ticket description

Command used:

```bash
npm install ckeditor5 @ckeditor/ckeditor5-angular
```

- `new-ticket/rich-text-editor/` is a small component wrapping CKEditor, with Bold, Italic, Underline, Bulleted List and Link. It works with any `FormControl<string>`.
- Its encapsulation is off, because CKEditor adds its own elements at runtime and its styles must reach them.
- The description is now saved as HTML. **Any page that displays it must sanitize it**, for example with Angular's `[innerHTML]`, and the server does not clean it yet.
- `licenseKey: 'GPL'` uses CKEditor's free GPL licence. A closed-source product would need a commercial licence from CKSource instead.
- CKEditor only downloads when the New ticket page opens, not on the list page. Adding it to the shared packages needs `ng serve tickets` to be restarted.

## 23. Selecting and deleting tickets

- The Tickets table has a checkbox on each row, and one in the header to select the whole page.
- "Delete selected (N)" appears when something is selected. It asks for confirmation, then calls `DELETE /api/tickets` with `{ "ids": [...] }`, up to 100 at a time.
- Deleting is permanent, as there is no undo or trash.
- Selection only covers the current page, and clears when the rows change, such as on a new page, search, filter or sort. This stops tickets you can't see from being deleted.
- `npm run seed` restores the seeded tickets, but not ones created through the form.

## 24. Ticket IDs are never reused

New ticket IDs now come from a `ticket_counter` table in SQLite instead of the highest existing ID, so deleting a ticket never frees up its ID. `db.ts` creates the counter from the highest existing ID, and `seed.ts` makes sure it stays above the seeded tickets. Gaps in the numbering are normal.

## 25. JWT login

The cookie approach below was later replaced by a token in `localStorage`, and the server files moved. See section 29.

Part 1 is done:

- `server/.env` holds `JWT_SECRET`, and Git ignores it. `npm run dev` loads it with `--env-file=.env`.
- `db.ts` has a `users` table, and passwords are stored as `scrypt` hashes.
- `server/auth.ts` has the password and token helpers, using `jsonwebtoken`. Tokens last 1 hour.
- `npm run create-admin` creates or updates the admin user in the `users` table without touching tickets. It reads `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `server/.env`, so no login details are in the code, and it stops if either is blank.
- `welcome123` was pushed to GitHub in commit `d9600f4` and is still in the Git history, so it must not be used as a password again.
- `POST /api/login` sets the login cookie, or returns a 401 with the same message for a wrong username or password.

Part 2 is done: `requireAuth` in `auth.ts` checks the login cookie, and `server.ts` applies it to everything under `/api/tickets`. `/api/login` and `/api/logout` stay open.

Part 3 is done, in the shell's `src/app/core/`:

- `auth.ts`: the `Auth` service. It calls the login, logout and `/api/me` APIs, and never sees the token.
- `auth.interceptor.ts`: sends the login cookie with every API request. A 401 from the API goes to `/login`.
- `auth.guards.ts`: `/dashboard` needs a login, and `/login` sends logged-in users to the dashboard. Both ask `GET /api/me`.
- The token is in an `HttpOnly`, `SameSite=Strict` cookie, which JavaScript cannot read. It is also `Secure` when `NODE_ENV` is `production`. Browsers treat `localhost` on any port as the same site, but production domains must also be same-site, or these settings need changing.
- The tickets remote's `Api` service also sends the cookie, so it works on its own at `localhost:4201` once you have logged in through the shell.
- `login.ts` calls the API, and the hardcoded credentials and the `console.log` of the password are gone. Both fields are required: submitting with an empty field shows "Username is required." or "Password is required." and sends nothing to the server. `dashboard.html` has a "Log out" button.

Known limits: the sidebar's name "Alex Morgan" is still hardcoded (fixed later, see section 31). A malicious script cannot read the cookie, but it could still send requests while the page is open, so preventing XSS still matters, especially once ticket descriptions are displayed.

## 26. Ticket details page

Clicking a subject in the tickets table opens `/dashboard/tickets/<id>`. The page is read-only and is in `projects/tickets/src/app/tickets/ticket-details/`.

- `GET /api/tickets/:id` returns one ticket, or a 404. It needs a login, like the other ticket routes.
- The page shows the subject, ID, description, status, priority, topic, assignee, requester and last update, plus messages for loading, not found and failed requests.
- The description is displayed with `[innerHTML]`, which makes Angular remove scripts and other unsafe HTML.
- The status badge styles moved to `_status-badge.scss` and its classes to `ticket-options.ts`, so the table and this page share them.

## 27. React settings remote connected

The Settings page now comes from a React app in `projects/settings`, built with Vite and served on port 4203. It has its own `package.json`, is not part of `angular.json`, and React is not shared with Angular.

- `src/mount.tsx` exports `mount(element)`, which shows React inside an element and returns a function that removes it.
- `vite.config.ts` builds `mount.tsx` into a fixed `mount.js` file.
- `public/remoteEntry.json` is written by hand and exposes `./Mount`, so the shell can find it through `public/federation.manifest.json` like the tickets remote.
- The shell's `settings.ts` loads the remote, mounts it when the page opens and unmounts it when the page closes. If the remote cannot be loaded, the page shows "Could not load settings."

To run it, open two terminals in `projects/settings`: `npm run watch` rebuilds on save, and `npm run preview` serves the build to the shell. Refresh the browser to see a change. `watch` skips type checking, so run `npm run build` before committing.

Styles go in `src/styles/settings.css`, with every rule starting `.settings`. `mount.tsx` imports the file with `?inline`, adds it to the page when mounting and removes it when unmounting. A normal `import './x.css'` would not load in the shell. Use `@import` inside `settings.css` to split styles into more files.

Checked by hand: the React page shows in the shell, its button works, and leaving and returning mounts it again from a fresh state. With the React server stopped, Settings shows the error message and Tickets still works.

## 28. Vanity Page Configuration design

The React Settings page now shows the Vanity Page Configuration layout, in `App.tsx`, `icons.tsx` and `settings.css`. Colours come from the shell's CSS variables.

- The side sections open and close, one at a time.
- Page Text works (`PageTextSection.tsx`, `page-text.ts`). For the district name and the subtext, you can hide the text, or choose Custom and change the text and colour. The preview updates as you type. The settings live in `App`'s state, so they are lost on refresh until Save works.
- Backend: each user has their own vanity page. The `vanity_page_sections` table in `db.ts` has one row per user and section, with the settings as JSON. `requireAuth` now also puts the logged-in user's ID in `res.locals.userId`. `GET /api/vanity-page/page-text` returns that user's saved Page Text, or `null` if they haven't saved any. `PUT` saves it after checking every field, so a half-typed colour or text over 100 characters is rejected. Both need a login.
- Frontend: `src/api/vanity-page.ts` in the React app calls both routes with `fetch` and `credentials: 'include'`, so the login cookie is sent. The page loads the user's saved Page Text when it opens, and Save sends it. Save is disabled until loading succeeds, so a failed load can't overwrite saved settings with the defaults. A half-typed custom colour stops the save with a message. Running React on its own at `localhost:5173` can't call the API, because the server only allows ports 4200 and 4201.
- Page Appearance works the same way (`PageAppearanceSection.tsx`, `page-appearance.ts`): page background colour, card background colour, and rounded or square button corners. The monogram belongs to the Monogram & Logo section, which will also have logo upload.
- Monogram & Logo UI (`MonogramLogoSection.tsx`, `monogram-logo.ts`): choose Monogram or Logo. The monogram has Default letters (the first letter of the district name shown) or up to 2 custom letters, plus background and letter colours. The logo takes a PNG, JPG or SVG of up to 1 MB, with a thumbnail and Remove. The monogram settings are saved as the `monogram-logo` section. The logo file is saved separately in the `vanity_page_logos` table (one per user, as bytes) through `GET`, `PUT` and `DELETE /api/vanity-page/logo`. These routes sit before the `:section` routes. Uploading checks the type and size again, and also checks the file's first bytes, so a renamed file is rejected. The logo is served with a sandboxing Content Security Policy, so scripts inside an SVG can't run. A chosen or removed logo is only sent when Save is clicked.
- Sign-in Block UI (`SignInBlockSection.tsx`, `sign-in-block.ts`) controls the white sign-in card: show or hide the heading, Default or Custom heading text and colour, card background colour, card border on or off, and rounded or square corners. It is saved per user as the `sign-in-block` section. The buttons inside the card belong to other sections: Google SSO goes in SSO Sign In Options (shown or hidden), and Sign in with Email and Continue as Guest go in Alternate Sign-in Options.
- Alternate Sign-in Options (`AlternateSignInSection.tsx`, `alternate-sign-in.ts`): show or hide "Sign in with Email" and "Continue as Guest", each with Default or Custom button text and colour. Saved as `alternate-sign-in`.
- Footer (`FooterSection.tsx`, `footer.ts`): show or hide the copyright line, with Default or Custom text and colour. The default text follows the district name and the current year. You can also show or hide "Powered by onflo" and set the footer background colour. If both are hidden, the footer disappears. Saved as `footer`.
- URL Configuration (`UrlConfigurationSection.tsx`, `url-configuration.ts`): each user's page address, `VANITY_BASE_URL` plus a slug of 3 to 40 lowercase letters, numbers or hyphens, which is formatted as you type. `https://helpdesk.example.com/` is a placeholder domain. Saved as `url-configuration`. An empty slug means none has been chosen. A unique index in `db.ts` stops two users having the same slug, and the server answers 409, which the page shows as "That page URL is already taken". The preview shows the address above the page.
- SSO Sign In Options (`SsoSignInSection.tsx`, `sso-sign-in.ts`): show or hide a Google sign-in button, with Default ("Sign in with Google") or Custom text and colour. It is hidden by default. In the preview, the button has Google's "G" logo and sits above the other options, with an "or" divider when Email or Guest is also shown. Saved as `sso-sign-in`. This only sets how the button looks: actually signing in with Google needs a Google OAuth client and the public login page, which aren't built yet.
- Shared pieces: `lib/colors.ts` has the colour checks, `lib/text.ts` has the hideable text setting, and `lib/corners.ts` has the Rounded or Square choice. In `components/`, `ColorField.tsx` is the colour picker plus hex field, `ColorGroup.tsx` is a colour with a Default or Custom choice, and `TextGroup.tsx` is text that can be hidden with Default or Custom wording and colour.
- Folder structure of `projects/settings/src`:

  ```text
  main.tsx, mount.tsx, App.tsx   entry points (main.tsx runs it alone, mount.tsx in the shell) and the page
  api/vanity-page.ts             all calls to the server
  components/                    shared controls: ColorField, ColorGroup, TextGroup, icons
  lib/                           shared logic with no UI: colors, text, corners
  sections/<section>/            one folder per settings section: its panel (<Name>Section.tsx) and its settings, defaults and checks (<section>.ts)
  styles/                        settings.css (loaded by mount.tsx) and index.css (used only when run alone)
  ```

  Sections only import from `lib/` and `components/`. The one exception is Footer, which reads the default district name from Page Text. The unused Vite starter files (`App.css`, `src/assets/`, `public/icons.svg`) were removed.
- The server now has one pair of routes for every section: `GET` and `PUT /api/vanity-page/:section`. `VANITY_SECTIONS` in `server.ts` lists the allowed sections, each with its own check. An unknown section returns a 404. A new section only needs an entry there.
- Save sends every section at once, and the page loads every section when it opens.
- Publish, the view tabs, Full Screen Preview and the other sections don't do anything yet.

## 29. Token in localStorage, and server folders

At the user's request, the login token moved from the `HttpOnly` cookie to `localStorage`.

- `POST /api/login` returns `{ token, username }` and no longer sets a cookie. `/api/logout` was removed, because the server keeps no session.
- `requireAuth` reads the `Authorization: Bearer <token>` header. Tokens still last 1 hour, and expired, forged, or unsigned tokens get a 401.
- `cookie-parser` was uninstalled, and CORS no longer allows credentials.
- Shell (`src/app/core/`): `Auth` saves the token under `helpdesk.token` (`TOKEN_KEY`). Log out just removes it. `isLoggedIn()` asks `/api/me` and removes a token that no longer works. The interceptor adds the header to API requests, and on a 401 it removes the token and goes to `/login`. The dashboard's "Could not log out" message was removed, because logging out can no longer fail.
- The tickets remote's `Api` and the React app's `api/vanity-page.ts` read the same key and send the header themselves.
- Trade-off: any script running on the page can read the token, unlike the old cookie. Running the tickets remote alone at `localhost:4201` now has no token, because `localStorage` is separate for each port.

The server code is now in folders. `server.ts` stays the entry file, so `npm run dev` didn't change:

```text
server/
  server.ts                         starts the app
  src/app.ts                        Express app: CORS, JSON, and which router handles which path
  src/config.ts                     port and allowed origins
  src/db/database.ts                SQLite connection and tables (helpdesk.db stays in server/)
  src/auth/password.ts, token.ts    password hashing, and creating and checking tokens
  src/middleware/require-auth.ts    checks the Bearer token
  src/routes/                       auth.routes.ts, tickets.routes.ts, vanity-page.routes.ts
  src/validation/                   vanity-sections.ts (each section's checks), logo.ts (file checks)
  src/utils/text.ts                 text() helper
  scripts/                          seed.ts and create-admin.ts (npm run seed, npm run create-admin)
```

## 30. Google sign-in (in progress)

- Step 1, done by the user: a Google Cloud project with an OAuth Client ID (Web application). The authorized JavaScript origins are `http://localhost` and `http://localhost:4200`, and the user's Gmail is a test user.
- Step 2: `users` has an `email` column, with a unique index so two users can't share an email. `database.ts` adds it to older databases. `npm run create-admin` also reads `ADMIN_EMAIL` and saves it in lowercase. A blank `ADMIN_PASSWORD` keeps the existing password, so the email can be set on its own. Both changes are saved together, so a taken email changes nothing and prints "Another user already has the email ...".
- Step 3: `POST /api/login/google` in `auth.routes.ts` uses `google-auth-library`. It checks the ID token's Google signature, expiry and audience (`GOOGLE_CLIENT_ID` in `server/.env`), and that Google has verified the email. It then finds the user by email and returns the same `{ token, username }` as password login. Unknown emails, and invalid or faked tokens, all get the same 401, so the route doesn't reveal which emails have accounts. Google accounts can't create new users.
- Step 4: `src/app/core/google-sign-in.ts` loads Google's script once. The Client ID is only in `server/.env`. The login page gets it from `GET /api/login/google/config`, which needs no login and returns `{ clientId }`, or 404 if it isn't set. It isn't secret, but this way there is one copy and none in the frontend code. If the config request fails, the page shows "Google sign-in is unavailable right now." and password login still works. The login page asks Google to draw its own "Continue with Google" button into a `<div>`, because this method doesn't allow a custom button. `Auth.loginWithGoogle()` sends the ID token and saves our token like a password login. Errors show under the button.

## 31. Username in the sidebar, and a favicon

- The sidebar shows the logged-in username and its initials instead of "Alex Morgan". `Auth` keeps the name in a read-only `username` signal. It is set on password or Google login, set by `isLoggedIn()` from `/api/me` when a page loads, and cleared on log out, so the sidebar needs no extra request. Initials take the first letter of the first two words (`priya.sharma` becomes "PS"), or the first two letters of a single word (`admin` becomes "AD"). Long names end in "…". The "Admin" role under the name is still hardcoded, because users have no roles yet.
- Later, users got a `name` column for the person's real name. The sidebar shows the name ("Rufiyan Hasan", initials "RH"), or the username if no name is set. `/api/login`, `/api/login/google` and `/api/me` return `name`, and `/api/me` reads it from the database, so a changed name shows after a refresh. `npm run create-admin` sets it from `ADMIN_NAME` in `server/.env`. Google sign-in fills in a missing name from the Google account, but never replaces a name that is already set. `Auth.displayName` is the name, or the username if there's no name.
- New favicon in `public/`: a blue rounded square with a white speech bubble and a tick. `favicon.svg` is the main icon. `favicon.png` (32 × 32) is for browsers without SVG icons, and `apple-touch-icon.png` (180 × 180, square corners) is for iPhone home screens. The PNGs were rendered from the SVG in headless Chrome. The old Angular `favicon.ico` was removed.

## 32. Ready for Vercel and Turso

Hosting choice: Vercel (frontends and API) and Turso (database), both free with no card. Vercel's free Hobby plan is for non-commercial use.

- Database: the server uses Turso's `@libsql/client` instead of `node:sqlite`, so every database call is now `await`ed. `src/db/database.ts` connects to Turso when `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set, and otherwise to the local `server/helpdesk.db`, so local development is unchanged. It has small helpers, `queryOne`, `queryAll` and `run`. The tables are created once per server start (`databaseReady`), and `app.ts` makes every request wait for that. Scripts use `db.batch(..., 'write')`, which is saved all together, in place of `BEGIN`/`COMMIT`.
- `npm run copy-to-turso` copies every table from the local database into Turso. It's run once after creating the Turso database.
- API addresses are now `/api` on the same domain in all three apps. In development, `proxy.conf.json`, used by both Angular dev servers through `angular.json`, and the Vite `proxy` setting forward `/api` to port 3000.
- `src/main.ts` reads `federation.manifest.json` and turns its addresses into full URLs. The dev manifest keeps its `localhost` addresses. The production manifest, written by the build script, uses `/tickets/remoteEntry.json` and `/settings/remoteEntry.json`, so it works on any domain, including Vercel preview URLs.
- `scripts/build-vercel.mjs` (root) builds the shell, Tickets and React into `dist-vercel/`, with Tickets in `tickets/` and React in `settings/`. It overwrites `dist/`, so it must not be run while `ng serve` is running.
- `vercel.json` uses Vercel Services. `web` is the static `dist-vercel` folder, with a fallback to `index.html` for Angular routes. `api` is the Express app (`server/src/app.ts`, which now has `export default app`). `/api/*` goes to `api`, and everything else goes to `web`.
- The Tickets production build had never been run before. It failed its 8 kB component-style budget because of CKEditor's 273 kB stylesheet, so the Tickets limit is now 300 kB. The shell keeps 8 kB.
- `PORT` can be set in `.env`. Its default is 3000.

Problems met so far:

- `Could not resolve "node:path/posix"`: fixed by adding `'@angular/cdk/schematics'` to `skip` in the remote's `federation.config.mjs`. Any remote using Material or CDK needs this.
- `ngDevMode is not defined`: caused by running `ng build` while `ng serve` was running. Both use `dist/<app>/browser`, so production files replaced the development ones. Do not run a production build during `ng serve`. If it happens, restart `ng serve`.
- `Exposed module './Mount' from remote 'settings' not found in storage`: an old `mfe-projects/settings` server was already using port 4203, so the shell read that app's `remoteEntry.json`. Check what is on a port when a remote's modules are missing.
