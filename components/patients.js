/**
 * LIDU — Patients page component
 * Renders patients as a responsive data table (name, age, contact,
 * last visit, next appointment, status, actions) instead of cards, so
 * more patients are scannable at once.
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  const U = window.LIDU_UTILS;
  const ICONS = window.LIDU_ICONS;
  const DATA = window.LIDU_DATA;

  const localState = { search: "" };

  function statusFor(patient, nextAppt) {
    if (nextAppt) return { label: "Scheduled", cls: "status-scheduled" };
    if (!patient.lastVisit) return { label: "New", cls: "status-new" };
    const monthsSince = (Date.now() - new Date(patient.lastVisit + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSince <= 6) return { label: "Active", cls: "status-active" };
    return { label: "Inactive", cls: "status-inactive" };
  }

  async function paint() {
    const app = document.getElementById("pageRoot");
    const patients = await DATA.getPatients();
    const q = localState.search.toLowerCase();
    const list = patients.filter((p) => !q || p.name.toLowerCase().includes(q) || p.phone.includes(q)).sort((a, b) => a.name.localeCompare(b.name));

    const rowsWithNext = await Promise.all(
      list.map(async (p) => ({ patient: p, next: await DATA.getNextAppointmentForPatient(p.id) }))
    );

    app.innerHTML = `
      <div class="page-head row-between">
        <div><h1 class="page-title">Patients</h1><p class="page-sub">${patients.length} patients on file</p></div>
      </div>
      <div class="row" style="margin-bottom:18px;">
        <div class="search-wrap">${ICONS.search}<input class="input" id="patientSearchInput" placeholder="Search by name or phone" value="${U.escapeHtml(localState.search)}"></div>
        <button class="btn btn-primary" id="addPatientBtn">${ICONS.plus}Add patient</button>
      </div>
      ${list.length ? `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Contact number</th>
              <th>Last visit</th>
              <th>Next appointment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rowsWithNext.map(({ patient: p, next }) => {
              const status = statusFor(p, next);
              return `
              <tr>
                <td>
                  <div class="dt-patient">
                    <div class="avatar">${U.initials(p.name)}</div>
                    <div class="dt-name">${U.escapeHtml(p.name)}</div>
                  </div>
                </td>
                <td>${p.age || "—"}</td>
                <td>${U.escapeHtml(p.phone || "—")}</td>
                <td class="${p.lastVisit ? "" : "dt-muted"}">${p.lastVisit ? U.fmtDateShort(p.lastVisit) : "—"}</td>
                <td class="${next ? "" : "dt-muted"}">${next ? U.fmtDateShort(next.date) + " · " + U.fmtTime12(next.time) : "None scheduled"}</td>
                <td><span class="status-pill ${status.cls}">${status.label}</span></td>
                <td><a class="btn btn-secondary btn-sm" href="patient-workspace.html?id=${encodeURIComponent(p.id)}" style="text-decoration:none;">View</a></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
      ` : `<div class="empty-state">${ICONS.empty}<p>No patients match "${U.escapeHtml(localState.search)}".</p></div>`}
    `;

    const searchInput = document.getElementById("patientSearchInput");
    searchInput.oninput = (e) => { localState.search = e.target.value; paint(); searchInput.focus(); const v = searchInput.value; searchInput.value = ""; searchInput.value = v; };
    document.getElementById("addPatientBtn").onclick = () => window.LIDU_COMPONENTS.openAddPatientModal(paint);
  }

  window.LIDU_COMPONENTS.initPatientsPage = paint;
})();
