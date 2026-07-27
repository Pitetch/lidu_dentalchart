/**
 * LIDU — Clinic configuration
 * =============================================================
 * THIS IS THE ONLY FILE YOU SHOULD NEED TO EDIT TO ONBOARD A NEW CLINIC.
 *
 * Onboarding checklist for a new clinic:
 *   1. Create a new Google Sheet from the LIDU template.
 *   2. Copy the LIDU Google Apps Script into that sheet's Apps Script
 *      editor and deploy it as a Web App (see /services/googleSheetsService.js
 *      for the request shape it expects).
 *   3. Paste the resulting Sheet ID, Sheet URL, and Web App URL below.
 *   4. Drop the clinic's logo into /assets/images and point `logoUrl` at it.
 *   5. Update clinic name, address, contact info, and brand color.
 *
 * No other file in this project should ever need to change for a
 * new client. If you find yourself editing a component or service
 * to make a new clinic work, that's a sign the value belongs here
 * instead.
 * =============================================================
 */

window.LIDU_CONFIG = {

  /* ---------------- Data source ----------------
   * dataSource selects which backend the data service talks to.
   * Supported today: "mock" (bundled demo data) and "googleSheets".
   * Future adapters (firebase / supabase / rest) plug into the same
   * dataService interface — see /services/dataService.js.
   */
  dataSource: "mock", // "mock" | "googleSheets"

  googleSheets: {
    sheetUrl: "", // e.g. "https://docs.google.com/spreadsheets/d/XXXXXXXX/edit"
    sheetId: "", // e.g. "XXXXXXXX" (the ID portion of the sheet URL)
    appsScriptWebAppUrl: "", // e.g. "https://script.google.com/macros/s/XXXXXXXX/exec"
  },

  googleDrive: {
    folderUrl: "", // e.g. "https://drive.google.com/drive/folders/XXXXXXXX"
  },

  /* ---------------- Clinic information ---------------- */
  clinic: {
    name: "Sunshine Smiles Dental Clinic",
    address: "21 Kalayaan Ave, Quezon City",
    phone: "0917-000-1234",
    email: "hello@sunshinesmiles.example",
    dentistName: "Dr. Maria Santos-Reyes",
    dentistSpecialty: "General & Cosmetic Dentistry",
    hoursStart: "09:00",
    hoursEnd: "18:00",
  },

  /* ---------------- Branding ---------------- */
  branding: {
    logoUrl: "../assets/images/logo-default.png",
    primaryColor: "#6C4CF5",
    primaryColorHover: "#5A3FE5",
    lavender: "#ECE8FF",
  },

  /* ---------------- Assets ----------------
   * Almost never needs changing per clinic — the anatomical chart is
   * shared. Overridable here only if a clinic supplies its own artwork.
   */
  assets: {
    toothChartSvgUrl: "../assets/svg/tooth-chart.svg",
  },
};
