/**
 * LIDU — bundled demo data
 * Used only when config.dataSource === "mock". This lets a fresh clone of
 * the project run and look complete before a clinic's Google Sheet is
 * connected. Real clinics should switch config.dataSource to
 * "googleSheets" — see /services/googleSheetsService.js.
 *
 * Data is persisted to localStorage under a namespaced key so demo edits
 * (a new walk-in, a saved treatment) survive navigating between pages,
 * the same way a real API-backed app would keep state on the server.
 */
window.LIDU_MOCK = (function () {
  const U = window.LIDU_UTILS;
  const STORAGE_KEY = "lidu_mock_store_v1";

  const TODAY = U.todayISO();
  const TOM = U.tomorrowISO();

  function seedPatients() {
    return [
      { id: "p1", name: "Maria Santos", age: 34, gender: "Female", birthDate: "1992-03-14", email: "maria.santos@gmail.com", phone: "0917-123-4567", address: "21 Kalayaan Ave, Quezon City", medicalAlerts: [], lastVisit: "2026-06-10", files: [],
        chart: { 16: { "Occlusal": { treatment: "Composite Filling", notes: "Mild sensitivity, resolved after filling.", date: "2026-06-10" } } },
        notes: [{ date: "2026-06-10", text: "Reports occasional sensitivity to cold on upper right molars." }] },
      { id: "p2", name: "John Cruz", age: 45, gender: "Male", birthDate: "1980-11-02", email: "john.cruz@yahoo.com", phone: "0918-234-5678", address: "88 Rizal St, Makati City", medicalAlerts: ["Hypertension"], lastVisit: "2026-05-22", files: [],
        chart: { 46: { "Occlusal": { treatment: "Root Canal Treatment", notes: "Second session, canal cleaned. One more visit for crown.", date: "2026-05-22" } } }, notes: [] },
      { id: "p3", name: "Anna Reyes", age: 29, gender: "Female", birthDate: "1996-09-21", email: "anna.reyes@gmail.com", phone: "0919-345-6789", address: "12 Maginhawa St, Quezon City", medicalAlerts: [], lastVisit: "2026-07-01", chart: {}, notes: [], files: [] },
      { id: "p4", name: "Miguel Torres", age: 52, gender: "Male", birthDate: "1973-06-30", email: "miguel.torres@outlook.com", phone: "0920-456-7890", address: "5 Aguinaldo Hwy, Imus, Cavite", medicalAlerts: ["Diabetic"], lastVisit: "2026-04-15", files: [],
        chart: { 36: { "Occlusal": { treatment: "Crown", notes: "Crown fitted, checked bite alignment.", date: "2026-04-15" } } }, notes: [] },
      { id: "p5", name: "Sofia Delgado", age: 8, gender: "Female", birthDate: "2017-12-05", email: "liza.delgado@gmail.com", phone: "0921-567-8901", address: "40 Katipunan Ave, Quezon City", medicalAlerts: [], lastVisit: "2026-06-28", chart: {}, notes: [], files: [] },
      { id: "p6", name: "Carlos Bautista", age: 61, gender: "Male", birthDate: "1965-01-17", email: "carlos.bautista@gmail.com", phone: "0922-678-9012", address: "3 Session Rd, Baguio City", medicalAlerts: ["Denture wearer"], lastVisit: "2026-03-30", files: [],
        chart: { 26: { "Occlusal": { treatment: "Extraction", notes: "Extracted due to advanced decay.", date: "2026-03-30" } } }, notes: [] },
      { id: "p7", name: "Elena Rivera", age: 19, gender: "Female", birthDate: "2007-04-09", email: "elena.rivera@gmail.com", phone: "0923-789-0123", address: "77 Taft Ave, Manila", medicalAlerts: [], lastVisit: "2026-07-15", files: [],
        chart: { 11: { "Mesial": { treatment: "Sealant", notes: "Preventive sealant applied.", date: "2026-07-15" } } }, notes: [] },
      { id: "p8", name: "Rafael Ocampo", age: 38, gender: "Male", birthDate: "1988-08-23", email: "rafael.ocampo@gmail.com", phone: "0924-890-1234", address: "19 Osmeña Blvd, Cebu City", medicalAlerts: [], lastVisit: "2026-02-18", chart: {}, notes: [], files: [] },
    ];
  }

  function dentistName() {
    return (window.LIDU_CONFIG && window.LIDU_CONFIG.clinic.dentistName) || "Dr. Maria Santos-Reyes";
  }

  function seedAppointments() {
    const D = dentistName();
    return [
      { id: U.uid(), patientId: "p1", date: TODAY, time: "09:00", treatment: "Cleaning", dentist: D, status: "confirmed" },
      { id: U.uid(), patientId: "p2", date: TODAY, time: "10:00", treatment: "Composite Filling", dentist: D, status: "checked-in" },
      { id: U.uid(), patientId: "p3", date: TODAY, time: "11:00", treatment: "Extraction", dentist: D, status: "confirmed" },
      { id: U.uid(), patientId: "p5", date: TODAY, time: "14:00", treatment: "Fluoride Treatment", dentist: D, status: "confirmed" },
      { id: U.uid(), patientId: "p4", date: TOM, time: "09:30", treatment: "Crown Fitting", dentist: D, status: "confirmed" },
      { id: U.uid(), patientId: "p6", date: TOM, time: "11:00", treatment: "Denture Check", dentist: D, status: "confirmed" },
      { id: U.uid(), patientId: "p1", date: "2026-06-10", time: "10:00", treatment: "Composite Filling", dentist: D, status: "completed" },
      { id: U.uid(), patientId: "p2", date: "2026-05-22", time: "13:00", treatment: "Root Canal Treatment", dentist: D, status: "completed" },
      { id: U.uid(), patientId: "p7", date: "2026-07-15", time: "15:00", treatment: "Sealant", dentist: D, status: "completed" },
      { id: U.uid(), patientId: "p4", date: "2026-04-15", time: "09:00", treatment: "Crown", dentist: D, status: "completed" },
      { id: U.uid(), patientId: "p6", date: "2026-03-30", time: "09:00", treatment: "Extraction", dentist: D, status: "completed" },
      { id: U.uid(), patientId: "p8", date: U.addDaysISO(TODAY, 3), time: "10:00", treatment: "Cleaning", dentist: D, status: "confirmed" },
      { id: U.uid(), patientId: "p3", date: U.addDaysISO(TODAY, 5), time: "13:30", treatment: "Follow-up", dentist: D, status: "confirmed" },
    ];
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore corrupt storage */ }
    const fresh = { patients: seedPatients(), appointments: seedAppointments() };
    save(fresh);
    return fresh;
  }

  function save(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* storage unavailable */ }
  }

  function reset() {
    const fresh = { patients: seedPatients(), appointments: seedAppointments() };
    save(fresh);
    return fresh;
  }

  return { load, save, reset, TODAY, TOM };
})();
