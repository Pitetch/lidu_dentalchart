/**
 * LIDU — Calendar page component
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  const U = window.LIDU_UTILS;
  const CL = window.LIDU_CLINICAL;
  const ICONS = window.LIDU_ICONS;
  const DATA = window.LIDU_DATA;

  const localState = { calView: "month", calDate: new Date(), selectedMonthDay: null };

  async function paint() {
    const app = document.getElementById("pageRoot");
    const view = localState.calView;
    app.innerHTML = `
      <div class="page-head row-between">
        <div><h1 class="page-title">Calendar</h1><p class="page-sub">Your clinic's appointment book</p></div>
        <div class="row">
          <div class="cal-toggle">
            <button class="${view === "day" ? "active" : ""}" data-view="day">Day</button>
            <button class="${view === "week" ? "active" : ""}" data-view="week">Week</button>
            <button class="${view === "month" ? "active" : ""}" data-view="month">Month</button>
          </div>
          <button class="btn btn-primary" id="addApptBtn">${ICONS.plus}Add appointment</button>
        </div>
      </div>
      <div id="calBody"></div>
    `;
    document.querySelectorAll("[data-view]").forEach((btn) => (btn.onclick = () => { localState.calView = btn.dataset.view; paint(); }));
    document.getElementById("addApptBtn").onclick = () =>
      window.LIDU_COMPONENTS.openAddAppointmentModal(U.toISO(localState.calDate), paint);

    const body = document.getElementById("calBody");
    if (view === "month") body.innerHTML = await renderMonthView();
    else if (view === "week") body.innerHTML = await renderWeekView();
    else body.innerHTML = await renderDayView();
    wireBodyNav();
  }

  function wireBodyNav() {
    const monthPrev = document.getElementById("monthPrev"); if (monthPrev) monthPrev.onclick = () => { localState.calDate.setMonth(localState.calDate.getMonth() - 1); paint(); };
    const monthNext = document.getElementById("monthNext"); if (monthNext) monthNext.onclick = () => { localState.calDate.setMonth(localState.calDate.getMonth() + 1); paint(); };
    const weekPrev = document.getElementById("weekPrev"); if (weekPrev) weekPrev.onclick = () => { localState.calDate.setDate(localState.calDate.getDate() - 7); paint(); };
    const weekNext = document.getElementById("weekNext"); if (weekNext) weekNext.onclick = () => { localState.calDate.setDate(localState.calDate.getDate() + 7); paint(); };
    const dayPrev = document.getElementById("dayPrev"); if (dayPrev) dayPrev.onclick = () => { localState.calDate.setDate(localState.calDate.getDate() - 1); paint(); };
    const dayNext = document.getElementById("dayNext"); if (dayNext) dayNext.onclick = () => { localState.calDate.setDate(localState.calDate.getDate() + 1); paint(); };
    document.querySelectorAll("[data-goto-day]").forEach((cell) => {
      cell.onclick = (e) => {
        if (e.target.closest("[data-patient-link]")) return; // let event chip links navigate normally
        localState.selectedMonthDay = cell.dataset.gotoDay;
        paint();
      };
    });
  }

  async function renderMonthView() {
    const patients = await DATA.getPatients();
    const byId = Object.fromEntries(patients.map((p) => [p.id, p]));
    const TODAY = U.todayISO();
    const d = localState.calDate;
    const year = d.getFullYear(), month = d.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: prevDays - i, other: true, iso: null });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, other: false, iso: U.toISO(new Date(year, month, i)) });
    while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ day: "", other: true, iso: null });
    const monthLabel = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const cellsHtml = await Promise.all(cells.map(async (c) => {
      const appts = c.iso ? await DATA.getAppointmentsForDate(c.iso) : [];
      const isToday = c.iso === TODAY;
      const isSelected = c.iso && c.iso === localState.selectedMonthDay;
      const shown = appts.slice(0, 3);
      const overflow = appts.length - shown.length;
      return `<div class="month-cell ${c.other ? "other" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}" ${c.iso ? `data-goto-day="${c.iso}"` : ""}>
        <div class="month-daynum">${c.day}</div>
        ${shown.length ? `<div class="month-events">
          ${shown.map((a) => {
            const p = byId[a.patientId];
            return `<a class="month-event-chip" data-patient-link href="patient-workspace.html?id=${a.patientId}" style="border-left-color:${CL.getCalColor(a.treatment)};text-decoration:none;" title="${U.escapeHtml(U.fmtTime12(a.time) + " · " + (p ? p.name : "") + " · " + a.treatment)}">${U.fmtTime12(a.time)} ${p ? U.escapeHtml(p.name.split(" ")[0]) : ""}</a>`;
          }).join("")}
          ${overflow > 0 ? `<div class="month-more">+${overflow} more</div>` : ""}
        </div>` : ""}
      </div>`;
    }));

    const selectedIso = localState.selectedMonthDay;
    const selectedAppts = selectedIso ? await DATA.getAppointmentsForDate(selectedIso) : [];

    return `
      <div class="card">
        <div class="row-between" style="margin-bottom:6px;">
          <h3 class="card-title">${monthLabel}</h3>
          <div class="row"><button class="btn btn-secondary btn-sm" id="monthPrev">← Prev</button><button class="btn btn-secondary btn-sm" id="monthNext">Next →</button></div>
        </div>
        <div class="month-grid">${dow.map((x) => `<div class="month-dow">${x}</div>`).join("")}${cellsHtml.join("")}</div>
      </div>
      ${selectedIso ? `
      <div class="card">
        <div class="card-head"><h3 class="card-title">${U.fmtDateLong(selectedIso)}</h3><span class="card-count">${selectedAppts.length} scheduled</span></div>
        ${selectedAppts.length
          ? selectedAppts.map((a) => window.LIDU_COMPONENTS.renderAppointmentRow(a, byId[a.patientId])).join("")
          : `<div class="empty-row">Nothing on the books for this day.</div>`}
      </div>` : ""}`;
  }

  async function renderWeekView() {
    const patients = await DATA.getPatients();
    const byId = Object.fromEntries(patients.map((p) => [p.id, p]));
    const base = localState.calDate;
    const dow = base.getDay();
    const monday = new Date(base); monday.setDate(base.getDate() - dow);
    const days = [];
    for (let i = 0; i < 7; i++) { const dd = new Date(monday); dd.setDate(monday.getDate() + i); days.push(dd); }
    const TODAY = U.todayISO();

    const colsHtml = await Promise.all(days.map(async (dd) => {
      const iso = U.toISO(dd);
      const appts = await DATA.getAppointmentsForDate(iso);
      const isToday = iso === TODAY;
      return `<div class="week-col">
        <div class="week-col-head" ${isToday ? 'style="color:var(--purple);"' : ""}>${dd.toLocaleDateString("en-US", { weekday: "short" })}<br>${dd.getDate()}</div>
        ${appts.map((a) => {
          const p = byId[a.patientId];
          return `<a class="week-appt" style="border-left-color:${CL.getCalColor(a.treatment)};text-decoration:none;color:inherit;display:block;" href="patient-workspace.html?id=${a.patientId}">
            <div class="week-appt-time">${U.fmtTime12(a.time)}</div>
            <div class="week-appt-name">${p ? U.escapeHtml(p.name) : ""}</div>
            <div class="week-appt-treat">${U.escapeHtml(a.treatment)}</div>
          </a>`;
        }).join("")}
      </div>`;
    }));

    return `
      <div class="card">
        <div class="row-between" style="margin-bottom:10px;">
          <h3 class="card-title">Week of ${days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}</h3>
          <div class="row"><button class="btn btn-secondary btn-sm" id="weekPrev">← Prev</button><button class="btn btn-secondary btn-sm" id="weekNext">Next →</button></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);">${colsHtml.join("")}</div>
      </div>`;
  }

  async function renderDayView() {
    const patients = await DATA.getPatients();
    const byId = Object.fromEntries(patients.map((p) => [p.id, p]));
    const iso = U.toISO(localState.calDate);
    const appts = await DATA.getAppointmentsForDate(iso);
    return `
      <div class="card">
        <div class="row-between" style="margin-bottom:10px;">
          <h3 class="card-title">${U.fmtDateLong(iso)}</h3>
          <div class="row"><button class="btn btn-secondary btn-sm" id="dayPrev">← Prev</button><button class="btn btn-secondary btn-sm" id="dayNext">Next →</button></div>
        </div>
        ${appts.length ? appts.map((a) => {
          const p = byId[a.patientId]; if (!p) return "";
          return `<a class="day-slot" style="border-left-color:${CL.getCalColor(a.treatment)};text-decoration:none;color:inherit;" href="patient-workspace.html?id=${p.id}">
            <div class="queue-time">${U.fmtTime12(a.time)}</div>
            <div class="avatar">${U.initials(p.name)}</div>
            <div class="queue-info"><div class="queue-name">${U.escapeHtml(p.name)}</div><div class="queue-treat">${U.escapeHtml(a.treatment)}</div></div>
          </a>`;
        }).join("") : `<div class="empty-row">No appointments on this day.</div>`}
      </div>`;
  }

  window.LIDU_COMPONENTS.initCalendarPage = paint;
})();
