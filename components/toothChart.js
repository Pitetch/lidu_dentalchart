/**
 * LIDU — interactive dental chart component
 * Fetches the shared anatomical SVG (see /assets/svg/tooth-chart.svg),
 * injects it into a holder element, colors each of the 5 anatomical
 * surfaces per tooth (mesial, distal, buccal/labial, lingual/palatal,
 * occlusal/incisal) by its recorded treatment, and wires up
 * click/hover behavior at the surface level.
 *
 * Usage:
 *   LIDU_COMPONENTS.mountToothChart(holderEl, patient, {
 *     selectedTooth, selectedSurfaceKey,
 *     onSelectSurface: (toothNumber, surfaceKey, surfaceLabel) => { ... }
 *   });
 */
window.LIDU_COMPONENTS = window.LIDU_COMPONENTS || {};

(function () {
  let svgMarkupCache = null;
  let tooltipEl = null;

  async function loadSvgMarkup() {
    if (svgMarkupCache) return svgMarkupCache;
    const url = window.LIDU_CONFIG.assets.toothChartSvgUrl;
    const res = await fetch(url);
    svgMarkupCache = await res.text();
    return svgMarkupCache;
  }

  function ensureTooltip() {
    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "tooth-tooltip";
      document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
  }

  function showTooltip(e, patient, num, displaySurfaceLabel, surfaceLabel) {
    const U = window.LIDU_UTILS;
    const CL = window.LIDU_CLINICAL;
    const el = ensureTooltip();
    const toothChart = patient.chart[num] || {};
    const rec = toothChart[surfaceLabel];
    const isExtracted = Object.values(toothChart).some((r) => r.treatment === "Extraction");
    let body;
    if (rec) {
      body = `<div>${U.escapeHtml(rec.treatment)}</div><div class="tt-sub">Last treatment · ${U.fmtDateFull(rec.date)}</div>`;
    } else if (isExtracted) {
      body = `<div>Tooth extracted</div><div class="tt-sub">No treatment recorded on this surface</div>`;
    } else {
      body = `<div class="tt-sub">No treatment recorded</div>`;
    }
    el.innerHTML = `<div class="tt-title">Tooth ${num} · ${displaySurfaceLabel}</div>` + body;
    el.classList.add("show");
    moveTooltip(e);
  }
  function moveTooltip(e) {
    if (!tooltipEl) return;
    tooltipEl.style.left = e.clientX + "px";
    tooltipEl.style.top = e.clientY + "px";
  }
  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove("show");
  }

  /**
   * @param {HTMLElement} holder - empty container to render the chart into
   * @param {object} patient - patient record (needs .chart)
   * @param {object} opts - { selectedTooth, selectedSurfaceKey, onSelectSurface(tooth, surfaceKey, surfaceLabel, displayLabel) }
   */
  window.LIDU_COMPONENTS.mountToothChart = async function (holder, patient, opts) {
    opts = opts || {};
    const CL = window.LIDU_CLINICAL;
    const markup = await loadSvgMarkup();
    holder.innerHTML = markup;
    const svgNode = holder.querySelector("svg");
    if (!svgNode) return;

    CL.ALL_TEETH.forEach((num) => {
      const g = svgNode.querySelector('[data-tooth="' + num + '"]');
      if (!g) return;
      const occlusalLabel = g.getAttribute("data-occlusal-label") || "Occlusal";
      const toothChart = patient.chart[num] || {};
      const isExtracted = Object.values(toothChart).some((r) => r.treatment === "Extraction");

      Object.keys(CL.SURFACE_KEY_TO_LABEL).forEach((surfaceKey) => {
        const el = g.querySelector('.tooth-surface[data-surface="' + surfaceKey + '"]');
        if (!el) return;
        const surfaceLabel = CL.SURFACE_KEY_TO_LABEL[surfaceKey];
        const rec = toothChart[surfaceLabel];
        // Extraction always covers the whole tooth — you can't extract just one surface —
        // so it overrides whatever this specific surface's own recorded treatment/color is.
        if (isExtracted) {
          el.style.fill = CL.TREATMENT_FILL["Extraction"];
        } else {
          el.style.fill = rec && CL.TREATMENT_FILL[rec.treatment] ? CL.TREATMENT_FILL[rec.treatment] : "";
        }

        const isSelected = String(opts.selectedTooth) === String(num) && opts.selectedSurfaceKey === surfaceKey;
        el.classList.toggle("selected", isSelected);

        // Display label: use "Incisal" wording for anterior teeth on hover/tooltips only —
        // the underlying stored surface key/label stays "Occlusal" for data consistency.
        const displaySurfaceLabel = surfaceKey === "occlusal" ? occlusalLabel : surfaceLabel;

        el.onclick = () => opts.onSelectSurface && opts.onSelectSurface(num, surfaceKey, surfaceLabel, displaySurfaceLabel);
        el.onmouseenter = (e) => showTooltip(e, patient, num, displaySurfaceLabel, surfaceLabel);
        el.onmousemove = (e) => moveTooltip(e);
        el.onmouseleave = () => hideTooltip();
      });
    });
  };
})();
