/**
 * LIDU — Settings page component
 *
 * Note: production clinic values (name, address, Google Sheets links,
 * branding) live in /config/config.js and should be set once at
 * onboarding time. The fields below are shown for convenience and quick
 * demo edits; they're stored in localStorage as a local override layer
 * and never modify config.js itself.
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  const U = window.LIDU_UTILS;
  const ICONS = window.LIDU_ICONS;
  const STORAGE_KEY = "lidu_settings_override_v1";

  function loadOverrides() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveOverrides(o) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ }
  }

  function currentSettings() {
    const cfg = window.LIDU_CONFIG.clinic;
    return Object.assign({}, cfg, { googleConnected: false, googleEmail: "" }, loadOverrides());
  }

  function paint() {
    const app = document.getElementById("pageRoot");
    const s = currentSettings();
    app.innerHTML = `
      <div class="page-head"><h1 class="page-title">Settings</h1><p class="page-sub">Clinic and account preferences</p></div>
      <div class="card settings-sec">
        <div class="card-head"><h3 class="card-title">Clinic information</h3></div>
        <div class="grid-2">
          <div class="field"><label>Clinic name</label><input class="input" data-field="name" value="${U.escapeHtml(s.name)}"></div>
          <div class="field"><label>Clinic phone</label><input class="input" data-field="phone" value="${U.escapeHtml(s.phone)}"></div>
        </div>
        <div class="field"><label>Address</label><input class="input" data-field="address" value="${U.escapeHtml(s.address)}"></div>
      </div>
      <div class="card settings-sec">
        <div class="card-head"><h3 class="card-title">Dentist information</h3></div>
        <div class="grid-2">
          <div class="field"><label>Name</label><input class="input" data-field="dentistName" value="${U.escapeHtml(s.dentistName)}"></div>
          <div class="field"><label>Specialty</label><input class="input" data-field="dentistSpecialty" value="${U.escapeHtml(s.dentistSpecialty)}"></div>
        </div>
      </div>
      <div class="card settings-sec">
        <div class="card-head"><h3 class="card-title">Working hours</h3></div>
        <div class="grid-2">
          <div class="field"><label>Opens at</label><input type="time" class="input" data-field="hoursStart" value="${s.hoursStart}"></div>
          <div class="field"><label>Closes at</label><input type="time" class="input" data-field="hoursEnd" value="${s.hoursEnd}"></div>
        </div>
      </div>
      <div class="card settings-sec">
        <div class="card-head"><h3 class="card-title">Google account</h3></div>
        ${s.googleConnected ? `
          <div class="row-between">
            <div class="row"><span class="badge badge-success">${ICONS.check} Connected</span><span style="font-size:13.5px;color:var(--text-muted);">${U.escapeHtml(s.googleEmail)}</span></div>
            <button class="btn btn-secondary btn-sm" id="disconnectGoogleBtn">Disconnect</button>
          </div>` : `
          <p style="color:var(--text-muted);font-size:13.5px;margin:0 0 12px;">Connect your Google account to back up appointments and patient records to Drive.</p>
          <button class="btn btn-secondary" id="connectGoogleBtn">Connect Google account</button>`}
      </div>
      <div class="card settings-sec">
        <div class="card-head"><h3 class="card-title">Data source</h3></div>
        <p style="color:var(--text-muted);font-size:13.5px;margin:0;">Currently running on <strong>${window.LIDU_CONFIG.dataSource === "mock" ? "bundled demo data" : "Google Sheets"}</strong>. To connect a live Google Sheet, set the Sheet ID and Apps Script Web App URL in <code>config/config.js</code> and set <code>dataSource: "googleSheets"</code>.</p>
      </div>
    `;

    app.querySelectorAll("[data-field]").forEach((input) => {
      input.onchange = () => {
        const o = loadOverrides();
        o[input.dataset.field] = input.value;
        saveOverrides(o);
        window.LIDU_COMPONENTS.showToast("Saved");
      };
    });
    const connectBtn = document.getElementById("connectGoogleBtn");
    if (connectBtn) connectBtn.onclick = () => {
      const o = loadOverrides();
      o.googleConnected = true;
      o.googleEmail = s.dentistName.toLowerCase().replace(/[^a-z]/g, ".") + "@gmail.com";
      saveOverrides(o);
      window.LIDU_COMPONENTS.showToast("Google account connected");
      paint();
    };
    const disconnectBtn = document.getElementById("disconnectGoogleBtn");
    if (disconnectBtn) disconnectBtn.onclick = () => {
      const o = loadOverrides();
      o.googleConnected = false;
      saveOverrides(o);
      window.LIDU_COMPONENTS.showToast("Google account disconnected");
      paint();
    };
  }

  window.LIDU_COMPONENTS.initSettingsPage = paint;
})();
