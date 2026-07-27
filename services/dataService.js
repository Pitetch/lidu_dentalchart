/**
 * LIDU — data service
 * =============================================================
 * Every page and component talks to data ONLY through this file.
 * Nothing else should import mockData.js or googleSheetsService.js
 * directly, and nothing else should contain a Google Sheets URL,
 * sheet ID, or fetch() call.
 *
 * This is also the seam for future backends. To add Firebase,
 * Supabase, MySQL, Postgres, or a custom REST API:
 *   1. Write a new adapter file, e.g. /services/firebaseService.js,
 *      exposing the same method names as googleSheetsService.js.
 *   2. Add a branch for it below (like the "googleSheets" branch).
 *   3. Set config.dataSource to the new adapter's name.
 * No component or page has to change.
 * =============================================================
 */
window.LIDU_DATA = (function () {
  const config = window.LIDU_CONFIG;
  const mock = window.LIDU_MOCK;
  const sheets = window.LIDU_GOOGLE_SHEETS;

  const usingMock = config.dataSource === "mock";

  // In-memory cache for the "mock" adapter only, loaded from localStorage.
  let store = usingMock ? mock.load() : null;

  function persist() {
    if (usingMock) mock.save(store);
  }

  // ---- reads ----
  async function getPatients() {
    if (usingMock) return store.patients;
    return sheets.getPatients();
  }

  async function getAppointments() {
    if (usingMock) return store.appointments;
    return sheets.getAppointments();
  }

  async function getPatientById(id) {
    const patients = await getPatients();
    return patients.find((p) => p.id === id) || null;
  }

  async function getAppointmentsForDate(iso) {
    const appts = await getAppointments();
    return appts.filter((a) => a.date === iso).sort((a, b) => a.time.localeCompare(b.time));
  }

  async function getAppointmentsForPatient(id) {
    const appts = await getAppointments();
    return appts
      .filter((a) => a.patientId === id)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }

  async function getNextAppointmentForPatient(id) {
    const today = window.LIDU_UTILS.todayISO();
    const appts = await getAppointments();
    return appts
      .filter((a) => a.patientId === id && a.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  }

  // ---- writes ----
  async function addPatient(patient) {
    if (usingMock) {
      const record = Object.assign(
        { id: window.LIDU_UTILS.uid(), chart: {}, notes: [], medicalAlerts: [], lastVisit: "" },
        patient
      );
      store.patients.push(record);
      persist();
      return record;
    }
    return sheets.addPatient(patient);
  }

  async function addAppointment(appt) {
    if (usingMock) {
      const record = Object.assign({ id: window.LIDU_UTILS.uid() }, appt);
      store.appointments.push(record);
      persist();
      return record;
    }
    return sheets.addAppointment(appt);
  }

  async function saveTreatment(patientId, tooth, surface, record) {
    if (usingMock) {
      const patient = store.patients.find((p) => p.id === patientId);
      if (!patient) throw new Error("Unknown patient: " + patientId);
      if (!patient.chart[tooth]) patient.chart[tooth] = {};
      patient.chart[tooth][surface] = record;
      patient.lastVisit = window.LIDU_UTILS.todayISO();
      persist();
      return patient;
    }
    return sheets.saveTreatment(patientId, tooth, surface, record);
  }

  async function addNote(patientId, text) {
    if (usingMock) {
      const patient = store.patients.find((p) => p.id === patientId);
      if (!patient) throw new Error("Unknown patient: " + patientId);
      patient.notes = patient.notes || [];
      const note = { date: window.LIDU_UTILS.todayISO(), text };
      patient.notes.push(note);
      persist();
      return note;
    }
    return sheets.addNote(patientId, { date: window.LIDU_UTILS.todayISO(), text });
  }

  async function updatePatientLastVisit(patientId, iso) {
    if (usingMock) {
      const patient = store.patients.find((p) => p.id === patientId);
      if (patient) { patient.lastVisit = iso; persist(); }
      return patient;
    }
    return sheets.updatePatient(patientId, { lastVisit: iso });
  }

  async function updateAppointmentStatus(apptId, status) {
    if (usingMock) {
      const appt = store.appointments.find((a) => a.id === apptId);
      if (appt) { appt.status = status; persist(); }
      return appt;
    }
    return sheets.updateAppointmentStatus(apptId, status);
  }

  // Records a file's metadata against a patient. In "googleSheets" mode the
  // adapter uploads the file to the clinic's Google Drive folder (see
  // config.googleDrive.folderUrl) and logs the metadata row to the sheet;
  // in "mock" mode we just keep the metadata locally so the UI has
  // something real to show before a Drive connection exists.
  async function addPatientFile(patientId, fileMeta) {
    if (usingMock) {
      const patient = store.patients.find((p) => p.id === patientId);
      if (!patient) throw new Error("Unknown patient: " + patientId);
      patient.files = patient.files || [];
      const record = Object.assign({ id: window.LIDU_UTILS.uid(), date: window.LIDU_UTILS.todayISO(), driveUrl: null }, fileMeta);
      patient.files.push(record);
      persist();
      return record;
    }
    return sheets.uploadPatientFile(patientId, fileMeta);
  }

  return {
    getPatients, getAppointments, getPatientById,
    getAppointmentsForDate, getAppointmentsForPatient, getNextAppointmentForPatient,
    addPatient, addAppointment, saveTreatment, addNote, updatePatientLastVisit,
    updateAppointmentStatus, addPatientFile,
  };
})();
