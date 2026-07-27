/**
 * LIDU — Patient Workspace page component
 * Reached via patient-workspace.html?id=<patientId>
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  const U = window.LIDU_UTILS;
  const CL = window.LIDU_CLINICAL;
  const ICONS = window.LIDU_ICONS;
  const DATA = window.LIDU_DATA;

  const localState = {
    selectedTooth: null,
    selectedSurfaceKey: null,
    selectedSurfaceLabel: null,
    selectedDisplayLabel: null,
    formMode: null, // null | "add" | "edit"
    formTreatment: null,
    formNotes: "",
    generalNoteDraft: "",
  };

  async function paint() {
    const app = document.getElementById("pageRoot");
    const patientId = U.qs("id");
    const patient = patientId && (await DATA.getPatientById(patientId));
    if (!patient) {
      app.innerHTML = `<div class="empty-state">${ICONS.empty}<p>Patient not found.</p></div><a class="btn btn-secondary" href="patients.html" style="margin-top:12px;display:inline-flex;">${ICONS.back}Back to patients</a>`;
      return;
    }
    const next = await DATA.getNextAppointmentForPatient(patient.id);
    const apptHistory = await DATA.getAppointmentsForPatient(patient.id);
    const currentTreatment = latestTreatment(patient);
    const assignedDentist = patient.assignedDentist || window.LIDU_CONFIG.clinic.dentistName;

    app.innerHTML = `
      <a class="btn btn-ghost btn-sm back-btn" href="patients.html" style="text-decoration:none;display:inline-flex;">${ICONS.back}Back to patients</a>

      <div class="summary-card">
        <div class="summary-top">
          <div class="avatar">${U.initials(patient.name)}</div>
          <div>
            <h2 class="summary-name">${U.escapeHtml(patient.name)}</h2>
            <div class="summary-tags">${U.escapeHtml(patient.address || "No address on file")}</div>
          </div>
        </div>

        <div class="summary-grid" style="grid-template-columns:repeat(4,1fr);">
          <div class="summary-item"><div class="k">Sex</div><div class="v">${U.escapeHtml(patient.gender || "—")}</div></div>
          <div class="summary-item"><div class="k">Age</div><div class="v">${patient.age || "—"}</div></div>
          <div class="summary-item"><div class="k">Birthday</div><div class="v">${patient.birthDate ? U.fmtBirthday(patient.birthDate) : "—"}</div></div>
          <div class="summary-item"><div class="k">Contact number</div><div class="v">${U.escapeHtml(patient.phone || "—")}</div></div>
        </div>

        <div class="summary-grid" style="grid-template-columns:repeat(4,1fr);">
          <div class="summary-item"><div class="k">Email address</div><div class="v">${patient.email ? U.escapeHtml(patient.email) : "—"}</div></div>
          <div class="summary-item"><div class="k">Last visit</div><div class="v">${patient.lastVisit ? U.fmtDateFull(patient.lastVisit) : "—"}</div></div>
          <div class="summary-item"><div class="k">Next appointment</div><div class="v">${next ? U.fmtDateShort(next.date) + " · " + U.fmtTime12(next.time) : "None scheduled"}</div></div>
          <div class="summary-item"><div class="k">Current treatment</div><div class="v">${currentTreatment ? U.escapeHtml(currentTreatment) : '<span style="color:var(--text-muted);font-weight:500;">None active</span>'}</div></div>
        </div>

        <div class="summary-grid" style="grid-template-columns:repeat(2,1fr);">
          <div class="summary-item"><div class="k">Assigned dentist</div><div class="v">${U.escapeHtml(assignedDentist)}</div></div>
          <div class="summary-item"><div class="k">Medical alerts</div><div class="v">${patient.medicalAlerts && patient.medicalAlerts.length ? patient.medicalAlerts.map((a) => `<span class="alert-pill">${ICONS.alert}${U.escapeHtml(a)}</span>`).join(" ") : '<span style="color:var(--text-muted);font-weight:500;">None on file</span>'}</div></div>
        </div>

        <div class="files-section">
          <div class="row-between" style="margin-bottom:10px;">
            <div class="k" style="margin:0;">Patient files</div>
            <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
              ${ICONS.plus}Upload file
              <input type="file" id="fileUploadInput" style="display:none;">
            </label>
          </div>
          <div id="filesList">${renderFilesList(patient)}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3 class="card-title">Interactive dental chart</h3><span class="card-count">FDI numbering</span></div>
        <div class="chart-flex-wrap">
          <div class="hero-chart-wrap">
            <div class="hero-chart-svg-holder" id="toothChartHolder"></div>
            <div class="chart-legend">
              <div class="legend-item"><span class="legend-dot" style="background:#D9DBE1;"></span>Healthy</div>
              <div class="legend-item"><span class="legend-dot" style="background:#3B7DED;"></span>Composite filling</div>
              <div class="legend-item"><span class="legend-dot" style="background:#E08A1E;"></span>Root canal</div>
              <div class="legend-item"><span class="legend-dot" style="background:#8B5CF6;"></span>Crown / bridge / implant</div>
              <div class="legend-item"><span class="legend-dot" style="background:#9CA3AF;"></span>Extraction</div>
            </div>
          </div>
          <div class="tooth-panel-box" id="toothPanelBox">
            <div class="tooth-panel" id="toothPanel"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3 class="card-title">Treatment timeline</h3></div>
        <div id="timelineHolder">${renderTimeline(patient)}</div>
      </div>

      <div class="card">
        <div class="card-head"><h3 class="card-title">Clinical notes</h3></div>
        <textarea class="input" id="generalNoteInput" placeholder="Add a general note, treatment comment, or tooth note...">${U.escapeHtml(localState.generalNoteDraft)}</textarea>
        <div style="margin-top:10px;margin-bottom:14px;"><button class="btn btn-primary btn-sm" id="saveNoteBtn">Save note</button></div>
        <div id="notesHolder">${renderNotesList(patient)}</div>
      </div>

      <div class="card">
        <div class="card-head"><h3 class="card-title">Appointment history</h3><span class="card-count">${apptHistory.length} total</span></div>
        ${renderApptHistory(apptHistory)}
      </div>
    `;

    paintToothPanel(patient);
    mountChart(patient);

    document.getElementById("generalNoteInput").oninput = (e) => (localState.generalNoteDraft = e.target.value);
    document.getElementById("saveNoteBtn").onclick = async () => {
      if (!localState.generalNoteDraft.trim()) return;
      await DATA.addNote(patient.id, localState.generalNoteDraft.trim());
      localState.generalNoteDraft = "";
      window.LIDU_COMPONENTS.showToast("Note saved");
      paint();
    };

    document.getElementById("fileUploadInput").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const category = guessFileCategory(file);
      await DATA.addPatientFile(patient.id, { category, fileName: file.name, mimeType: file.type || "application/octet-stream" });
      window.LIDU_COMPONENTS.showToast(window.LIDU_CONFIG.dataSource === "mock" ? "File recorded (connect Google Drive to store the actual file)" : "File uploaded to Google Drive");
      paint();
    };
  }

  function guessFileCategory(file) {
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    if (type.startsWith("image/") && /xray|x-ray|rad/.test(name)) return "X-ray";
    if (type.startsWith("image/")) return "Intraoral photo";
    if (/prescription|rx/.test(name)) return "Prescription";
    if (type === "application/pdf" || /doc|report|treatment/.test(name)) return "Treatment document";
    return "Other";
  }

  function mountChart(patient) {
    const holder = document.getElementById("toothChartHolder");
    window.LIDU_COMPONENTS.mountToothChart(holder, patient, {
      selectedTooth: localState.selectedTooth,
      selectedSurfaceKey: localState.selectedSurfaceKey,
      onSelectSurface: (num, surfaceKey, surfaceLabel, displayLabel) => {
        localState.selectedTooth = num;
        localState.selectedSurfaceKey = surfaceKey;
        localState.selectedSurfaceLabel = surfaceLabel;
        localState.selectedDisplayLabel = displayLabel;
        localState.formMode = null;
        localState.formTreatment = null;
        localState.formNotes = "";
        paintToothPanel(patient);
        mountChart(patient); // repaint chart to reflect new selection highlight
      },
    });
  }

  function paintToothPanel(patient) {
    const panel = document.getElementById("toothPanel");
    const box = document.getElementById("toothPanelBox");
    const tooth = localState.selectedTooth;
    const surfaceLabel = localState.selectedSurfaceLabel;
    if (box) box.classList.toggle("open", tooth != null);
    if (tooth == null) {
      panel.innerHTML = `<div class="tooth-panel-empty">Select a tooth surface on the chart to review or record a treatment.</div>`;
      return;
    }
    const rec = patient.chart[tooth] && patient.chart[tooth][surfaceLabel];

    let formHtml = "";
    if (localState.formMode) {
      const editing = localState.formMode === "edit";
      formHtml = `
        <div class="inline-form">
          <div class="field" style="margin-bottom:12px;">
            <label>Treatment</label>
            <div class="treat-chip-list">
              ${CL.TREATMENTS.map((t) => `<div class="treat-chip ${localState.formTreatment === t ? "selected" : ""}" data-treatment="${U.escapeHtml(t)}">${t}</div>`).join("")}
            </div>
          </div>
          <div class="field"><label>Clinical notes (optional)</label><textarea class="input" id="formNotesInput" placeholder="Add clinical notes...">${U.escapeHtml(localState.formNotes)}</textarea></div>
          <div class="row" style="justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" id="cancelFormBtn">Cancel</button>
            <button class="btn btn-primary btn-sm" id="saveFormBtn" ${localState.formTreatment ? "" : "disabled"}>${editing ? "Update treatment" : "Save treatment"}</button>
          </div>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="tooth-head">
        <h4>Tooth ${tooth} · ${U.escapeHtml(localState.selectedDisplayLabel)}</h4>
        <button class="btn btn-ghost btn-sm" id="deselectToothBtn">${ICONS.close}Deselect</button>
      </div>
      ${rec ? `
        <div class="tooth-record">
          <div class="tr-top">
            <div class="tr-surface">${U.escapeHtml(localState.selectedDisplayLabel)}</div>
            <div class="tr-date">${U.fmtDateShort(rec.date)}</div>
          </div>
          <div class="tr-treatment">
            <span class="badge badge-${CL.treatTone(rec.treatment)}">${U.escapeHtml(rec.treatment)}</span>
            ${rec.notes ? `<div style="font-size:12.5px;color:var(--text-muted);margin-top:4px;">${U.escapeHtml(rec.notes)}</div>` : ""}
          </div>
          <div class="tr-actions"><button class="btn btn-secondary btn-sm" id="editTreatmentBtn">${ICONS.edit}Edit</button></div>
        </div>
      ` : `<p style="color:var(--text-muted);font-size:13px;margin:4px 0 0;">No treatment recorded on this surface yet.</p>`}

      ${!localState.formMode && !rec ? `<div style="margin-top:14px;"><button class="btn btn-primary btn-sm" id="startFormBtn">${ICONS.plus}Add treatment</button></div>` : ""}
      ${formHtml}
    `;

    panel.querySelector("#deselectToothBtn").onclick = () => {
      localState.selectedTooth = null; localState.selectedSurfaceKey = null; localState.formMode = null;
      paint();
    };
    const startBtn = panel.querySelector("#startFormBtn");
    if (startBtn) startBtn.onclick = () => {
      localState.formMode = "add"; localState.formTreatment = null; localState.formNotes = "";
      paintToothPanel(patient);
    };
    const editBtn = panel.querySelector("#editTreatmentBtn");
    if (editBtn) editBtn.onclick = () => {
      localState.formMode = "edit"; localState.formTreatment = rec.treatment; localState.formNotes = rec.notes || "";
      paintToothPanel(patient);
    };
    panel.querySelectorAll("[data-treatment]").forEach((btn) => {
      btn.onclick = () => { localState.formTreatment = btn.dataset.treatment; paintToothPanel(patient); };
    });
    const cancelBtn = panel.querySelector("#cancelFormBtn");
    if (cancelBtn) cancelBtn.onclick = () => { localState.formMode = null; paintToothPanel(patient); };
    const notesInput = panel.querySelector("#formNotesInput");
    if (notesInput) notesInput.oninput = (e) => (localState.formNotes = e.target.value);
    const saveBtn = panel.querySelector("#saveFormBtn");
    if (saveBtn) saveBtn.onclick = async () => {
      if (!localState.formTreatment) return;
      await DATA.saveTreatment(patient.id, tooth, surfaceLabel, { treatment: localState.formTreatment, notes: localState.formNotes, date: U.todayISO() });
      localState.formMode = null; localState.formTreatment = null; localState.formNotes = "";
      window.LIDU_COMPONENTS.showToast("Treatment saved");
      paint();
    };
  }

  function latestTreatment(patient) {
    let latest = null;
    Object.values(patient.chart).forEach((surfaces) => {
      Object.values(surfaces).forEach((rec) => {
        if (!latest || rec.date > latest.date) latest = rec;
      });
    });
    return latest ? latest.treatment : null;
  }

  function renderFilesList(patient) {
    const files = patient.files || [];
    if (!files.length) return `<p style="color:var(--text-muted);font-size:13px;margin:0;">No files uploaded yet.</p>`;
    return files
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(
        (f) => `
        <div class="file-row">
          <div class="file-icon">${ICONS.empty}</div>
          <div class="file-info">
            <div class="file-name">${U.escapeHtml(f.fileName)}</div>
            <div class="file-meta">${U.escapeHtml(f.category)} · ${U.fmtDateShort(f.date)}${f.driveUrl ? "" : " · pending Google Drive connection"}</div>
          </div>
          ${f.driveUrl ? `<a class="btn btn-secondary btn-sm" href="${f.driveUrl}" target="_blank" rel="noopener">Open</a>` : ""}
        </div>`
      )
      .join("");
  }

  function renderTimeline(patient) {
    const entries = [];
    Object.entries(patient.chart).forEach(([tooth, surfaces]) => {
      Object.entries(surfaces).forEach(([surf, rec]) => {
        entries.push({ date: rec.date, text: rec.treatment, sub: `Tooth ${tooth} · ${surf}` });
      });
    });
    entries.sort((a, b) => b.date.localeCompare(a.date));
    if (!entries.length) return `<div class="empty-row">No treatments recorded yet for this patient.</div>`;
    let html = "", lastYear = null;
    entries.forEach((e) => {
      const y = U.yearOf(e.date);
      if (y !== lastYear) { html += `<div class="timeline-year">${y}</div>`; lastYear = y; }
      html += `<div class="timeline-item"><div class="timeline-date">${U.fmtDateShort(e.date)}</div><div><div class="timeline-text">${U.escapeHtml(e.text)}</div><div class="timeline-sub">${U.escapeHtml(e.sub)}</div></div></div>`;
    });
    return html;
  }

  function renderNotesList(patient) {
    const notes = (patient.notes || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    if (!notes.length) return `<div class="empty-row">No notes yet for this patient.</div>`;
    return notes.map((n) => `<div class="note-item"><div class="note-date">${U.fmtDateFull(n.date)}</div><div class="note-text">${U.escapeHtml(n.text)}</div></div>`).join("");
  }

  function renderApptHistory(appts) {
    if (!appts.length) return `<div class="empty-row">No appointments recorded yet.</div>`;
    const TODAY = U.todayISO();
    return appts.map((a) => {
      const upcoming = a.date >= TODAY;
      return `<div class="appt-row">
        <div class="queue-time">${U.fmtDateShort(a.date)}</div>
        <div class="queue-info"><div class="queue-name">${U.fmtTime12(a.time)} · ${U.escapeHtml(a.treatment)}</div></div>
        <span class="badge ${upcoming ? "badge-purple" : "badge-success"}">${upcoming ? "Upcoming" : "Completed"}</span>
      </div>`;
    }).join("");
  }

  window.LIDU_COMPONENTS.initPatientWorkspacePage = paint;
})();
