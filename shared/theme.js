/**
 * LIDU — runtime theming
 * Applies config.branding colors as CSS custom property overrides so a
 * clinic can rebrand by editing config.js only — styles.css never needs
 * to change. Falls back silently to the defaults already baked into
 * styles.css if a color isn't set in config.
 */
(function () {
  const b = (window.LIDU_CONFIG && window.LIDU_CONFIG.branding) || {};
  const root = document.documentElement.style;
  if (b.primaryColor) root.setProperty("--purple", b.primaryColor);
  if (b.primaryColorHover) root.setProperty("--purple-hover", b.primaryColorHover);
  if (b.lavender) root.setProperty("--lavender", b.lavender);
})();
