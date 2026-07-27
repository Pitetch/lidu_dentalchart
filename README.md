# LIDU

A modern digital dental chart and clinic command center. This build is
structured so the same codebase can be deployed for many different dental
clinics — onboarding a new clinic means editing one configuration file,
not the application.

## Running it locally

The app fetches its SVG dental chart via `fetch()`, which browsers block
under the `file://` protocol. Serve the folder over HTTP instead:

```bash
# any of these work
npx serve .
python3 -m http.server 8080
```

Then open `http://localhost:PORT/` (or `.../pages/dashboard.html`).

## Project structure

```
/config
    config.js              ← the ONLY file you edit to onboard a new clinic

/services
    mockData.js             bundled demo data (used when dataSource: "mock")
    googleSheetsService.js   talks to the Apps Script Web App (real backend)
    dataService.js           the single interface every page/component uses

/shared
    utils.js                date/text formatting helpers
    constants.js             icon set + clinical vocabulary (treatments, surfaces, colors)
    theme.js                 applies config.branding colors at runtime
    styles.css               all styling

/components
    sidebar.js, toast.js, patientCard.js, appointmentCard.js, toothChart.js, modals.js
    dashboard.js, patients.js, patientWorkspace.js, calendar.js, settings.js

/pages
    dashboard.html, patients.html, patient-workspace.html, calendar.html, settings.html

/assets
    svg/tooth-chart.svg      shared anatomical chart artwork
    images/logo-default.png  default LIDU logo (swap per clinic via config)
```

### Data flow

```
config.js
   ↓
dataService.js  ──── mock ────→ mockData.js
   │
   └──── googleSheets ────→ googleSheetsService.js ──→ Apps Script Web App ──→ Google Sheet
   ↓
Dashboard · Patients · Calendar · Patient Workspace · Settings
```

Every page/component calls `window.LIDU_DATA.getPatients()`,
`.getAppointments()`, `.saveTreatment()`, etc. None of them know or care
whether the data came from the bundled mock dataset or a live Google
Sheet — that decision is made in one place: `config.dataSource`.

## Deploying

This is a static site — any static host works. A few easy options:

- **GitHub Pages**: push this folder to a repo, enable Pages, point it at
  the root (or `/pages` if you set up a redirect). `index.html` already
  redirects to `pages/dashboard.html`.
- **Firebase Hosting**: `firebase init hosting` (set the public directory
  to this folder), then `firebase deploy`.
- **Netlify / Vercel**: drag-and-drop the folder or connect the repo —
  no build step is required.

Whichever host you pick, onboarding a new clinic afterward is still just
step 3 below: edit `config/config.js` and redeploy (or, if you're
hosting per-clinic branches/sites, keep one `config.js` per clinic and
otherwise share the same codebase).

## Onboarding a new clinic

1. **Create a new Google Sheet** from the LIDU template (Patients,
   Appointments, Chart, Notes tabs).
2. **Copy the LIDU Apps Script** into that sheet's Apps Script editor and
   deploy it as a Web App (Execute as: Me, Access: Anyone with the link).
   See the contract documented at the top of
   `services/googleSheetsService.js`.
3. **Edit `config/config.js`**:
   - `dataSource: "googleSheets"`
   - `googleSheets.sheetUrl`, `sheetId`, `appsScriptWebAppUrl`
   - `googleDrive.folderUrl`
   - `clinic.name`, `address`, `phone`, `email`, `dentistName`, etc.
   - `branding.logoUrl`, `primaryColor` (optional)
4. **Drop the clinic's logo** into `/assets/images` and point
   `branding.logoUrl` at it.

No other file should need to change. If a new clinic ever requires
editing a component or page to work correctly, that's a sign the value
belongs in `config.js` instead — please fix it there rather than in the
component.

## Swapping the backend later

Google Sheets is meant to be a starting point, not a permanent ceiling.
To move to Firebase, Supabase, MySQL, Postgres, or a custom REST API:

1. Write a new adapter, e.g. `services/firebaseService.js`, exposing the
   same method names as `googleSheetsService.js`
   (`getPatients`, `getAppointments`, `addPatient`, `addAppointment`,
   `saveTreatment`, `addNote`, `updatePatient`).
2. Add a branch for it in `services/dataService.js` alongside the
   existing `"mock"` / `"googleSheets"` branches.
3. Set `config.dataSource` to the new adapter's name.

No component or page needs to change — they only ever talk to
`dataService.js`.
