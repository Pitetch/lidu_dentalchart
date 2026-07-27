/**
 * LIDU — toast notifications
 * A single toast element reused across every page.
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  let toastEl = null;
  let timer = null;

  window.LIDU_COMPONENTS.showToast = function (message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = `${window.LIDU_ICONS.check}${window.LIDU_UTILS.escapeHtml(message)}`;
    toastEl.style.display = "flex";
    clearTimeout(timer);
    timer = setTimeout(() => { toastEl.style.display = "none"; }, 2200);
  };
})();
