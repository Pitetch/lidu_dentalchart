/**
 * LIDU — patient card component
 * One patient tile in the Patients grid. Clicking opens that patient's
 * workspace.
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

window.LIDU_COMPONENTS.renderPatientCard = function (patient) {
  const U = window.LIDU_UTILS;
  return `
    <a class="patient-card" href="patient-workspace.html?id=${encodeURIComponent(patient.id)}" style="text-decoration:none;color:inherit;display:block;">
      <div class="avatar">${U.initials(patient.name)}</div>
      <div class="pname">${U.escapeHtml(patient.name)}</div>
      <div class="pphone">${U.escapeHtml(patient.phone)}</div>
      <div class="plast">Last visit ${patient.lastVisit ? U.fmtDateShort(patient.lastVisit) : "—"}</div>
    </a>`;
};
