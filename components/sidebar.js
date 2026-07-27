/**
 * LIDU — sidebar component
 * Reusable across every page. Reads clinic name/logo from config so no
 * page markup ever hardcodes branding.
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

window.LIDU_COMPONENTS.renderSidebar = function (activePage) {
  const ICONS = window.LIDU_ICONS;
  const cfg = window.LIDU_CONFIG;
  const items = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard, href: "dashboard.html" },
    { id: "patients", label: "Patients", icon: ICONS.patients, href: "patients.html" },
    { id: "calendar", label: "Calendar", icon: ICONS.calendar, href: "calendar.html" },
    { id: "settings", label: "Settings", icon: ICONS.settings, href: "settings.html" },
  ];
  return `
  <div class="sidebar">
    <div class="logo"><img src="${cfg.branding.logoUrl}" alt="${cfg.clinic.name}" class="logo-img"></div>
    ${items
      .map(
        (it) => `
      <a class="nav-item ${activePage === it.id ? "active" : ""}" href="${it.href}">${it.icon}<span>${it.label}</span></a>
    `
      )
      .join("")}
    <div class="sidebar-footer">${window.LIDU_UTILS.escapeHtml(cfg.clinic.name)}</div>
  </div>`;
};
