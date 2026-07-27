/**
 * LIDU — Google Sheets backend adapter
 * =============================================================
 * This is the ONLY file that talks to Google. It reads the deployed Apps
 * Script Web App URL from config.js and exposes the same method shape as
 * every other adapter (see dataService.js), so swapping backends later
 * never touches components or pages.
 *
 * Expected Apps Script Web App contract
 * --------------------------------------
 * The companion Apps Script (deployed as a Web App, "Execute as: Me",
 * "Who has access: Anyone with the link") should read/write the sheet's
 * Patients, Appointments, Chart, and Notes tabs and respond to requests
 * shaped like:
 *
 *   GET  {webAppUrl}?action=getPatients
 *   GET  {webAppUrl}?action=getAppointments
 *   POST {webAppUrl}   body: { action: "addPatient",      payload: {...} }
 *   POST {webAppUrl}   body: { action: "addAppointment",  payload: {...} }
 *   POST {webAppUrl}   body: { action: "saveTreatment",   payload: {...} }
 *   POST {webAppUrl}   body: { action: "addNote",         payload: {...} }
 *   POST {webAppUrl}   body: { action: "updateAppointmentStatus", payload: {...} }
 *   POST {webAppUrl}   body: { action: "uploadPatientFile", payload: {...} }
 *      uploadPatientFile expects { patientId, fileMeta: { category, fileName,
 *      mimeType, dataBase64 } }. The Apps Script should decode the base64,
 *      write it to config.googleDrive.folderUrl, then append a row to the
 *      sheet's Files tab with patient, upload date, file type, and the
 *      resulting Drive share link — returning that link as `data.driveUrl`.
 *
 * Every response is JSON: { ok: true, data: ... } or { ok: false, error }.
 * =============================================================
 */
window.LIDU_GOOGLE_SHEETS = (function () {
  function webAppUrl() {
    const url = window.LIDU_CONFIG.googleSheets.appsScriptWebAppUrl;
    if (!url) {
      throw new Error(
        "LIDU is set to dataSource: 'googleSheets' but config.googleSheets.appsScriptWebAppUrl is empty. " +
        "Deploy the Apps Script Web App and paste its URL into config.js."
      );
    }
    return url;
  }

  async function callGet(action, params) {
    const url = new URL(webAppUrl());
    url.searchParams.set("action", action);
    if (params) Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));
    const res = await fetch(url.toString());
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || ("Request failed: " + action));
    return json.data;
  }

  async function callPost(action, payload) {
    const res = await fetch(webAppUrl(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids a CORS preflight against Apps Script
      body: JSON.stringify({ action, payload }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || ("Request failed: " + action));
    return json.data;
  }

  return {
    getPatients: () => callGet("getPatients"),
    getAppointments: () => callGet("getAppointments"),
    addPatient: (patient) => callPost("addPatient", patient),
    addAppointment: (appt) => callPost("addAppointment", appt),
    saveTreatment: (patientId, tooth, surface, record) => callPost("saveTreatment", { patientId, tooth, surface, record }),
    addNote: (patientId, note) => callPost("addNote", { patientId, note }),
    updatePatient: (patientId, changes) => callPost("updatePatient", { patientId, changes }),
    updateAppointmentStatus: (apptId, status) => callPost("updateAppointmentStatus", { apptId, status }),
    // Uploads a file to the clinic's configured Google Drive folder and logs
    // its metadata (patient, upload date, file type, Drive link) to the
    // sheet. fileMeta: { category, fileName, mimeType, dataBase64 }.
    uploadPatientFile: (patientId, fileMeta) => callPost("uploadPatientFile", { patientId, fileMeta }),
  };
})();
