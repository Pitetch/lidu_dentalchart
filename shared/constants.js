/**
 * LIDU — shared constants
 * Clinical vocabulary (treatments, surfaces) and icon set shared by every
 * component. Nothing clinic-specific here — that belongs in config.js.
 */
window.LIDU_ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  patients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M8 8h8M8 16h5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
};

window.LIDU_CLINICAL = {
  TREATMENTS: ["Cleaning", "Composite Filling", "Temporary Filling", "Extraction", "Root Canal Treatment", "Crown", "Bridge", "Implant", "Sealant", "Fluoride Treatment"],
  SURFACES: ["Mesial", "Distal", "Occlusal", "Buccal / Facial", "Lingual / Palatal"],
  // Maps the SVG's short surface keys (data-surface="mesial" etc.) to the
  // display/storage label used in patient.chart records.
  SURFACE_KEY_TO_LABEL: { mesial: "Mesial", distal: "Distal", occlusal: "Occlusal", buccal: "Buccal / Facial", lingual: "Lingual / Palatal" },
  TREATMENT_TONE: { "Cleaning": "success", "Fluoride Treatment": "success", "Sealant": "success", "Extraction": "gray", "Root Canal Treatment": "orange", "Crown": "tpurple", "Bridge": "tpurple", "Implant": "tpurple", "Composite Filling": "blue", "Temporary Filling": "blue" },
  TREATMENT_FILL: { "Composite Filling": "#3B7DED", "Temporary Filling": "#7FA8F2", "Root Canal Treatment": "#E08A1E", "Crown": "#8B5CF6", "Bridge": "#8B5CF6", "Implant": "#8B5CF6", "Extraction": "#9CA3AF" },
  CAL_COLOR: { "Cleaning": "#1FAA59", "Sealant": "#1FAA59", "Fluoride Treatment": "#1FAA59", "Composite Filling": "#3B7DED", "Temporary Filling": "#3B7DED", "Root Canal Treatment": "#E08A1E", "Crown": "#8B5CF6", "Bridge": "#8B5CF6", "Implant": "#8B5CF6", "Extraction": "#9CA3AF" },
  TONE_PRIORITY: ["Extraction", "Root Canal Treatment", "Crown", "Bridge", "Implant", "Composite Filling", "Temporary Filling"],

  APPT_STATUSES: [
    { key: "confirmed", label: "Confirmed", cls: "status-scheduled" },
    { key: "checked-in", label: "Checked In", cls: "status-active" },
    { key: "completed", label: "Completed", cls: "status-inactive" },
    { key: "cancelled", label: "Cancelled", cls: "status-cancelled" },
  ],
  apptStatusInfo(key) {
    return this.APPT_STATUSES.find((s) => s.key === key) || this.APPT_STATUSES[0];
  },

  FILE_CATEGORIES: ["X-ray", "Intraoral photo", "Treatment document", "Prescription", "Other"],
  UPPER_TEETH: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  LOWER_TEETH: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
  get ALL_TEETH() { return this.UPPER_TEETH.concat(this.LOWER_TEETH); },

  treatTone(t) { return this.TREATMENT_TONE[t] || "purple"; },
  getCalColor(t) { return this.CAL_COLOR[t] || window.LIDU_CONFIG.branding.primaryColor; },
  toothStatus(patient, toothNum) {
    const surfaces = patient.chart[toothNum];
    if (!surfaces || !Object.keys(surfaces).length) return null;
    let best = null, bestRank = Infinity;
    Object.values(surfaces).forEach((rec) => {
      const rank = this.TONE_PRIORITY.indexOf(rec.treatment);
      if (rank !== -1 && rank < bestRank) { bestRank = rank; best = rec; }
    });
    return best;
  },
};
