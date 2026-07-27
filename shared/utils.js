/**
 * LIDU — shared utilities
 * Pure helper functions used by every page/component. No clinic-specific
 * data or config lives here — see /config/config.js for that.
 */
window.LIDU_UTILS = (function () {
  function uid() {
    return "id_" + Math.random().toString(36).slice(2, 10);
  }
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function toISO(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function todayISO() {
    return toISO(new Date());
  }
  function tomorrowISO() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISO(d);
  }
  function addDaysISO(iso, n) {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + n);
    return toISO(d);
  }
  function fmtDateLong(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
  function fmtDateShort(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function fmtDateFull(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function fmtBirthday(iso) {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  function yearOf(iso) {
    return iso.slice(0, 4);
  }
  function fmtTime12(t) {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return hr + ":" + pad(m) + " " + period;
  }
  function clockTimeNow() {
    const d = new Date();
    const h = d.getHours();
    const period = h >= 12 ? "PM" : "AM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return hr + ":" + pad(d.getMinutes()) + " " + period;
  }
  function clockDateNow() {
    const d = new Date();
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
  function initials(name) {
    return (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }
  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function navigateTo(page, params) {
    const url = new URL(page, window.location.href);
    if (params) Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));
    window.location.href = url.toString();
  }

  return {
    uid, pad, toISO, todayISO, tomorrowISO, addDaysISO,
    fmtDateLong, fmtDateShort, fmtDateFull, fmtBirthday, yearOf,
    fmtTime12, clockTimeNow, clockDateNow, initials, escapeHtml,
    qs, navigateTo,
  };
})();
