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

The login form's Email field was later replaced with Username.

## 10. Dashboard layout and Tickets page UI created

Built from the supplied design:

- `dashboard.html` and `dashboard.scss`: left sidebar with the Acme Corp logo, the four navigation links with the current page highlighted, and the user at the bottom. The selected page shows on the right.
- `/dashboard` now redirects to `/dashboard/tickets`, so Tickets shows first.
- `tickets.html`, `tickets.scss` and `tickets.ts`: header, "+ New ticket", search, filters, "Advanced search", ticket table and footer text.
- `styles.scss`: new `--primary-light` and `--status-*` colour variables. The font moved here from `login.scss` so every page uses it.

This is UI only. The tickets are 8 hardcoded rows in `tickets.ts`, and the user (Alex Morgan) is hardcoded in `dashboard.html`. Search, filters and buttons do nothing. "10,000 tickets" and the footer text about virtual scroll and server search are design text only: none of that is built yet.

This is for development only: it is not real authentication, and `/dashboard` can still be opened directly without logging in.
