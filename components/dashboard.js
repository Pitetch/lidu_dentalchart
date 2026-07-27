/**
 * LIDU — Dashboard page component
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  const U = window.LIDU_UTILS;
  const ICONS = window.LIDU_ICONS;
  const DATA = window.LIDU_DATA;
  const cfg = window.LIDU_CONFIG;

  const localState = {
    dashboardSearch: "",
    miniCalDate: new Date(),
    dashSelectedDay: window.LIDU_UTILS.tomorrowISO(),
  };

  async function paint() {
    const app = document.getElementById("pageRoot");
    const TODAY = U.todayISO();

    const [patients, queue, selectedDayAppts] = await Promise.all([
      DATA.getPatients(),
      DATA.getAppointmentsForDate(TODAY),
      DATA.getAppointmentsForDate(localState.dashSelectedDay),
    ]);
    const byId = Object.fromEntries(patients.map((p) => [p.id, p]));

    const todaysPatients = new Set(queue.map((a) => a.patientId)).size;
    const totalPatients = patients.length;
    const weekStart = U.addDaysISO(TODAY, -6);
    const allAppts = await DATA.getAppointments();
    const treatmentsThisWeek = allAppts.filter((a) => a.date >= weekStart && a.date <= TODAY).length;

    app.innerHTML = `
      <div class="dash-head-row">
        <div class="greet-block">
          <div class="greet-hi">Hi, ${U.escapeHtml(cfg.clinic.dentistName)}!</div>
          <div class="greet-time" id="dashClock">${U.clockTimeNow()}</div>
          <div class="greet-date" id="dashDate">${U.clockDateNow()}</div>
        </div>
        <div class="dash-search-wrap">
          <div class="dash-search-box">
            ${ICONS.search}
            <input id="dashSearchInput" placeholder="Search patients, appointments, or treatments..." value="${U.escapeHtml(localState.dashboardSearch)}">
            ${localState.dashboardSearch ? `<span class="search-clear" id="dashSearchClear">${ICONS.close}</span>` : `<span class="search-kbd">⌘K</span>`}
          </div>
          <div id="dashSearchResults"></div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom:20px;">
        <div class="stat-card"><div class="num">${todaysPatients}</div><div class="label">Today's patients</div></div>
        <div class="stat-card"><div class="num">${totalPatients}</div><div class="label">Total patients</div></div>
        <div class="stat-card"><div class="num">${treatmentsThisWeek}</div><div class="label">Treatments this week</div></div>
      </div>

      <div class="dash-grid">
        <div>
          <div class="card">
            <div class="card-head"><h3 class="card-title">Today's queue</h3><button class="btn btn-primary btn-sm" id="addWalkinBtn">${ICONS.plus}Add walk-in</button></div>
            ${queue.length ? queue.map((a) => window.LIDU_COMPONENTS.renderAppointmentRow(a, byId[a.patientId])).join("") : `<div class="empty-row">No patients queued for today yet. Add a walk-in to get started.</div>`}
          </div>

          <div class="card">
            <div class="card-head">
              <h3 class="card-title">${localState.dashSelectedDay === TODAY ? "Today's appointments" : localState.dashSelectedDay === U.tomorrowISO() ? "Tomorrow's appointments" : U.fmtDateLong(localState.dashSelectedDay)}</h3>
              <span class="card-count">${selectedDayAppts.length} scheduled</span>
            </div>
            <div id="selectedDayList">${renderRichApptList(selectedDayAppts, byId)}</div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card-head"><h3 class="card-title">Calendar overview</h3></div>
            <div id="miniCalHolder"></div>
          </div>
        </div>
      </div>
    `;

    paintMiniCalendar(allAppts);
    wireSearch(patients);
    wireRichApptList(byId);

    document.getElementById("addWalkinBtn").onclick = () => window.LIDU_COMPONENTS.openWalkinModal(paint);
  }

  function renderRichApptList(appts, byId) {
    if (!appts.length) return `<div class="empty-row">Nothing on the books for this day.</div>`;
    const CL = window.LIDU_CLINICAL;
    return appts.map((a) => {
      const p = byId[a.patientId];
      if (!p) return "";
      const status = CL.apptStatusInfo(a.status || "confirmed");
      return `<div class="rich-appt-row" data-appt-id="${a.id}">
        <div class="rich-appt-time">${U.fmtTime12(a.time)}</div>
        <div class="rich-appt-main">
          <div class="avatar">${U.initials(p.name)}</div>
          <div><div class="rich-appt-name">${U.escapeHtml(p.name)}</div><div class="rich-appt-sub">${U.escapeHtml(a.treatment)}</div></div>
        </div>
        <div class="rich-appt-dentist">${U.escapeHtml(a.dentist || cfg.clinic.dentistName)}</div>
        <span class="status-pill ${status.cls}">${status.label}</span>
        <div class="rich-appt-actions">
          <a class="btn btn-secondary btn-sm" href="patient-workspace.html?id=${encodeURIComponent(p.id)}" style="text-decoration:none;">View</a>
          <button class="btn btn-secondary btn-sm" data-edit-appt="${a.id}">Edit</button>
          ${a.status === "confirmed" ? `<button class="btn btn-primary btn-sm" data-checkin-appt="${a.id}">Check In</button>` : ""}
        </div>
      </div>`;
    }).join("");
  }

  function wireRichApptList() {
    const holder = document.getElementById("selectedDayList");
    if (!holder) return;
    holder.querySelectorAll("[data-edit-appt]").forEach((btn) => {
      btn.onclick = () => window.LIDU_COMPONENTS.showToast("Editing appointments is coming soon");
    });
    holder.querySelectorAll("[data-checkin-appt]").forEach((btn) => {
      btn.onclick = async () => {
        await DATA.updateAppointmentStatus(btn.dataset.checkinAppt, "checked-in");
        window.LIDU_COMPONENTS.showToast("Patient checked in");
        paint();
      };
    });
  }

  function wireSearch(patients) {
    const input = document.getElementById("dashSearchInput");
    const resultsHolder = document.getElementById("dashSearchResults");
    const clearBtn = document.getElementById("dashSearchClear");

    function paintResults() {
      const q = localState.dashboardSearch.trim().toLowerCase();
      if (!q) { resultsHolder.innerHTML = ""; return; }
      const m = patients.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q)).slice(0, 6);
      resultsHolder.innerHTML = `
        <div class="search-results">
          <div class="search-section-label">Patients</div>
          ${m.length ? m.map((p) => `
            <a class="search-result-row" href="patient-workspace.html?id=${encodeURIComponent(p.id)}" style="text-decoration:none;color:inherit;">
              <div class="avatar">${U.initials(p.name)}</div>
              <div><div class="search-result-name">${U.escapeHtml(p.name)}</div><div class="search-result-sub">${U.escapeHtml(p.phone)}</div></div>
            </a>`).join("") : `<div class="search-empty">No matching patients.</div>`}
        </div>`;
    }

    input.oninput = (e) => {
      localState.dashboardSearch = e.target.value;
      paintResults();
      const wrap = input.closest(".dash-search-box");
      const existingClear = wrap.querySelector(".search-clear");
      const existingKbd = wrap.querySelector(".search-kbd");
      if (localState.dashboardSearch && existingKbd) {
        existingKbd.outerHTML = `<span class="search-clear" id="dashSearchClear">${ICONS.close}</span>`;
        wrap.querySelector("#dashSearchClear").onclick = () => { localState.dashboardSearch = ""; paint(); };
      } else if (!localState.dashboardSearch && existingClear) {
        existingClear.outerHTML = `<span class="search-kbd">⌘K</span>`;
      }
    };
    if (clearBtn) clearBtn.onclick = () => { localState.dashboardSearch = ""; paint(); };
    paintResults();
  }

  function paintMiniCalendar(allAppts) {
    const holder = document.getElementById("miniCalHolder");
    const TODAY = U.todayISO();
    const d = localState.miniCalDate;
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
    const dow = ["S", "M", "T", "W", "T", "F", "S"];
    const apptDaySet = new Set(allAppts.map((a) => a.date));

    holder.innerHTML = `
      <div class="mini-cal-head">
        <div class="mini-cal-title">${monthLabel}</div>
        <div class="mini-cal-nav">
          <button id="miniCalPrev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
          <button id="miniCalNext"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
        </div>
      </div>
      <div class="mini-cal-grid">
        ${dow.map((x) => `<div class="mini-cal-dow">${x}</div>`).join("")}
        ${cells.map((c) => {
          if (c.other) return `<div class="mini-cal-cell other">${c.day}</div>`;
          const isToday = c.iso === TODAY;
          const isSelected = c.iso === localState.dashSelectedDay;
          const hasAppts = apptDaySet.has(c.iso);
          return `<div class="mini-cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}" data-iso="${c.iso}">${c.day}${hasAppts ? '<span class="mini-cal-dot"></span>' : ""}</div>`;
        }).join("")}
      </div>
      <div class="mini-cal-footer"><a href="calendar.html">View full calendar →</a></div>
    `;
    holder.querySelector("#miniCalPrev").onclick = () => { localState.miniCalDate.setMonth(localState.miniCalDate.getMonth() - 1); paint(); };
    holder.querySelector("#miniCalNext").onclick = () => { localState.miniCalDate.setMonth(localState.miniCalDate.getMonth() + 1); paint(); };
    holder.querySelectorAll("[data-iso]").forEach((cell) => {
      cell.onclick = () => { localState.dashSelectedDay = cell.dataset.iso; paint(); };
    });
  }

  window.LIDU_COMPONENTS.initDashboardPage = paint;

  setInterval(() => {
    const clockEl = document.getElementById("dashClock");
    const dateEl = document.getElementById("dashDate");
    if (clockEl) clockEl.textContent = U.clockTimeNow();
    if (dateEl) dateEl.textContent = U.clockDateNow();
  }, 15000);
})();
