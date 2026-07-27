/**
 * LIDU — shared modals
 * Add Walk-in, Add Patient, and Add Appointment all follow the same
 * pattern: they own a small overlay appended to document.body, manage
 * their own form state, save through dataService, then call back into
 * the page that opened them so it can refresh.
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  const U = window.LIDU_UTILS;
  const CL = window.LIDU_CLINICAL;
  const ICONS = window.LIDU_ICONS;
  const DATA = window.LIDU_DATA;

  let overlayEl = null;

  function closeModal() {
    if (overlayEl) { overlayEl.remove(); overlayEl = null; }
  }

  function mountOverlay(html) {
    closeModal();
    overlayEl = document.createElement("div");
    overlayEl.innerHTML = html;
    document.body.appendChild(overlayEl.firstElementChild);
    overlayEl = document.body.lastElementChild;
    overlayEl.addEventListener("click", (e) => { if (e.target === overlayEl) closeModal(); });
    return overlayEl;
  }

  // ---------------- Add walk-in ----------------
  window.LIDU_COMPONENTS.openWalkinModal = async function (onSaved) {
    const patients = await DATA.getPatients();
    const state = { query: "", matchId: null, time: U.clockTimeNow().replace(/ (AM|PM)/, ""), treatment: "", name: "", phone: "" };

    function matches() {
      if (!state.query.trim()) return [];
      const q = state.query.toLowerCase();
      return patients.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q));
    }

    function paint() {
      const m = matches();
      const el = mountOverlay(`<div class="overlay center"></div>`);
      el.innerHTML = `
        <div class="modal">
          <div class="drawer-head"><h3>Add walk-in</h3><span class="close-x" id="wkClose">${ICONS.close}</span></div>
          <div class="field"><label>Search existing patient</label><input class="input" id="wkQuery" placeholder="Search by name or phone" value="${U.escapeHtml(state.query)}"></div>
          ${state.query.trim() ? (m.length ? `<div class="treat-list" style="margin-bottom:16px;">${m.map((p) => `<div class="treat-opt ${state.matchId === p.id ? "selected" : ""}" data-match="${p.id}">${U.escapeHtml(p.name)} · ${U.escapeHtml(p.phone)}</div>`).join("")}</div>` : `<p style="font-size:13px;color:var(--text-muted);margin:0 0 14px;">No matching patient. Fill in the details below to create a new record.</p>`) : ""}
          ${state.matchId || !m.length ? `
            <div class="grid-2">
              <div class="field"><label>Appointment time</label><input type="time" class="input" id="wkTime" value="${state.time}"></div>
              <div class="field"><label>Planned treatment ${state.matchId ? "" : "(optional)"}</label>
                <select class="input" id="wkTreatment"><option value="">Select treatment</option>${CL.TREATMENTS.map((t) => `<option value="${t}" ${state.treatment === t ? "selected" : ""}>${t}</option>`).join("")}</select>
              </div>
            </div>` : ""}
          ${!state.matchId && state.query.trim() && !m.length ? `
            <div class="field"><label>Full name</label><input class="input" id="wkName" value="${U.escapeHtml(state.name)}"></div>
            <div class="field"><label>Contact number</label><input class="input" id="wkPhone" value="${U.escapeHtml(state.phone)}"></div>` : ""}
          <div class="row" style="justify-content:flex-end;margin-top:8px;">
            <button class="btn btn-secondary" id="wkCancel">Cancel</button>
            <button class="btn btn-primary" id="wkSave">Add to queue</button>
          </div>
        </div>
      `;
      el.querySelector("#wkClose").onclick = closeModal;
      el.querySelector("#wkCancel").onclick = closeModal;
      el.querySelector("#wkQuery").oninput = (e) => { state.query = e.target.value; state.matchId = null; paint(); el.querySelector("#wkQuery").focus(); };
      el.querySelectorAll("[data-match]").forEach((row) => (row.onclick = () => { state.matchId = row.dataset.match; paint(); }));
      const timeEl = el.querySelector("#wkTime"); if (timeEl) timeEl.oninput = (e) => (state.time = e.target.value);
      const treatEl = el.querySelector("#wkTreatment"); if (treatEl) treatEl.oninput = (e) => (state.treatment = e.target.value);
      const nameEl = el.querySelector("#wkName"); if (nameEl) nameEl.oninput = (e) => (state.name = e.target.value);
      const phoneEl = el.querySelector("#wkPhone"); if (phoneEl) phoneEl.oninput = (e) => (state.phone = e.target.value);
      el.querySelector("#wkSave").onclick = async () => {
        let patientId = state.matchId;
        if (!patientId) {
          if (!state.name.trim() || !state.phone.trim()) { window.LIDU_COMPONENTS.showToast("Add a name and contact number"); return; }
          const np = await DATA.addPatient({ name: state.name.trim(), phone: state.phone.trim(), age: "", gender: "", address: "" });
          patientId = np.id;
        }
        await DATA.addAppointment({ patientId, date: window.LIDU_MOCK.TODAY, time: state.time || U.clockTimeNow(), treatment: state.treatment || "Walk-in visit" });
        closeModal();
        window.LIDU_COMPONENTS.showToast("Added to today's queue");
        if (onSaved) onSaved();
      };
    }
    paint();
  };

  // ---------------- Add patient ----------------
  window.LIDU_COMPONENTS.openAddPatientModal = function (onSaved) {
    const state = { name: "", age: "", gender: "Female", phone: "", address: "", medicalAlerts: "" };
    function paint() {
      const el = mountOverlay(`<div class="overlay center"></div>`);
      el.innerHTML = `
        <div class="modal">
          <div class="drawer-head"><h3>Add patient</h3><span class="close-x" id="apClose">${ICONS.close}</span></div>
          <div class="grid-2">
            <div class="field"><label>Full name</label><input class="input" id="apName" value="${U.escapeHtml(state.name)}"></div>
            <div class="field"><label>Age</label><input type="number" min="0" class="input" id="apAge" value="${U.escapeHtml(state.age)}"></div>
          </div>
          <div class="grid-2">
            <div class="field"><label>Gender</label><select class="input" id="apGender"><option ${state.gender === "Female" ? "selected" : ""}>Female</option><option ${state.gender === "Male" ? "selected" : ""}>Male</option><option ${state.gender === "Other" ? "selected" : ""}>Other</option></select></div>
            <div class="field"><label>Contact number</label><input class="input" id="apPhone" value="${U.escapeHtml(state.phone)}"></div>
          </div>
          <div class="field"><label>Address (optional)</label><input class="input" id="apAddress" value="${U.escapeHtml(state.address)}"></div>
          <div class="field"><label>Medical alerts (optional, comma separated)</label><input class="input" id="apAlerts" value="${U.escapeHtml(state.medicalAlerts)}"></div>
          <div class="row" style="justify-content:flex-end;margin-top:8px;">
            <button class="btn btn-secondary" id="apCancel">Cancel</button>
            <button class="btn btn-primary" id="apSave">Save patient</button>
          </div>
        </div>
      `;
      el.querySelector("#apClose").onclick = closeModal;
      el.querySelector("#apCancel").onclick = closeModal;
      el.querySelector("#apName").oninput = (e) => (state.name = e.target.value);
      el.querySelector("#apAge").oninput = (e) => (state.age = e.target.value);
      el.querySelector("#apGender").oninput = (e) => (state.gender = e.target.value);
      el.querySelector("#apPhone").oninput = (e) => (state.phone = e.target.value);
      el.querySelector("#apAddress").oninput = (e) => (state.address = e.target.value);
      el.querySelector("#apAlerts").oninput = (e) => (state.medicalAlerts = e.target.value);
      el.querySelector("#apSave").onclick = async () => {
        if (!state.name.trim() || !state.phone.trim()) { window.LIDU_COMPONENTS.showToast("Name and contact number are required"); return; }
        const alerts = state.medicalAlerts.split(",").map((s) => s.trim()).filter(Boolean);
        await DATA.addPatient({ name: state.name.trim(), age: Number(state.age) || "", gender: state.gender, phone: state.phone.trim(), address: state.address.trim(), medicalAlerts: alerts });
        closeModal();
        window.LIDU_COMPONENTS.showToast("Patient added");
        if (onSaved) onSaved();
      };
    }
    paint();
  };

  // ---------------- Add appointment ----------------
  window.LIDU_COMPONENTS.openAddAppointmentModal = async function (defaultDate, onSaved) {
    const patients = await DATA.getPatients();
    const state = { query: "", matchId: null, date: defaultDate || U.todayISO(), time: "09:00", treatment: "" };

    function matches() {
      if (!state.query.trim()) return [];
      const q = state.query.toLowerCase();
      return patients.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q));
    }

    function paint() {
      const m = matches();
      const el = mountOverlay(`<div class="overlay center"></div>`);
      el.innerHTML = `
        <div class="modal">
          <div class="drawer-head"><h3>Add appointment</h3><span class="close-x" id="aaClose">${ICONS.close}</span></div>
          <div class="field"><label>Patient</label><input class="input" id="aaQuery" placeholder="Search by name or phone" value="${U.escapeHtml(state.query)}"></div>
          ${state.query.trim() ? `<div class="treat-list" style="margin-bottom:16px;">${m.length ? m.map((p) => `<div class="treat-opt ${state.matchId === p.id ? "selected" : ""}" data-match="${p.id}">${U.escapeHtml(p.name)} · ${U.escapeHtml(p.phone)}</div>`).join("") : `<div style="font-size:13px;color:var(--text-muted);padding:8px 2px;">No matching patient found.</div>`}</div>` : ""}
          <div class="grid-2">
            <div class="field"><label>Date</label><input type="date" class="input" id="aaDate" value="${state.date}"></div>
            <div class="field"><label>Time</label><input type="time" class="input" id="aaTime" value="${state.time}"></div>
          </div>
          <div class="field"><label>Planned treatment</label><select class="input" id="aaTreatment"><option value="">Select treatment</option>${CL.TREATMENTS.map((t) => `<option value="${t}" ${state.treatment === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
          <div class="row" style="justify-content:flex-end;margin-top:8px;">
            <button class="btn btn-secondary" id="aaCancel">Cancel</button>
            <button class="btn btn-primary" id="aaSave" ${state.matchId ? "" : "disabled"}>Save appointment</button>
          </div>
        </div>
      `;
      el.querySelector("#aaClose").onclick = closeModal;
      el.querySelector("#aaCancel").onclick = closeModal;
      el.querySelector("#aaQuery").oninput = (e) => { state.query = e.target.value; state.matchId = null; paint(); el.querySelector("#aaQuery").focus(); };
      el.querySelectorAll("[data-match]").forEach((row) => (row.onclick = () => { state.matchId = row.dataset.match; paint(); }));
      el.querySelector("#aaDate").oninput = (e) => (state.date = e.target.value);
      el.querySelector("#aaTime").oninput = (e) => (state.time = e.target.value);
      el.querySelector("#aaTreatment").oninput = (e) => (state.treatment = e.target.value);
      const saveBtn = el.querySelector("#aaSave");
      saveBtn.onclick = async () => {
        if (!state.matchId || !state.date || !state.time) { window.LIDU_COMPONENTS.showToast("Select a patient, date, and time"); return; }
        await DATA.addAppointment({ patientId: state.matchId, date: state.date, time: state.time, treatment: state.treatment || "Consultation" });
        if (state.date <= U.todayISO()) await DATA.updatePatientLastVisit(state.matchId, state.date);
        closeModal();
        window.LIDU_COMPONENTS.showToast("Appointment added");
        if (onSaved) onSaved();
      };
    }
    paint();
  };
})();
