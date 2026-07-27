/**
 * LIDU — appointment row component
 * One appointment, rendered consistently everywhere it appears (Today's
 * Queue, Tomorrow's Appointments, mini calendar day list, Calendar page
 * day view). Clicking navigates to that patient's workspace.
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

window.LIDU_COMPONENTS.renderAppointmentRow = function (appt, patient) {
  const U = window.LIDU_UTILS;
  const CL = window.LIDU_CLINICAL;
  if (!patient) return "";
  return `<a class="queue-row" href="patient-workspace.html?id=${encodeURIComponent(patient.id)}" style="border-left:3px solid ${CL.getCalColor(appt.treatment)};padding-left:9px;text-decoration:none;color:inherit;">
    <div class="queue-time">${U.fmtTime12(appt.time)}</div>
    <div class="avatar">${U.initials(patient.name)}</div>
    <div class="queue-info"><div class="queue-name">${U.escapeHtml(patient.name)}</div><div class="queue-treat">${U.escapeHtml(appt.treatment)}</div></div>
  </a>`;
};
