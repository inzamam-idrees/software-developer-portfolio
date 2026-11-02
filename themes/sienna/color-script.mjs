export const COLOR_STORAGE_KEY = "sienna-color";

// ── Pre-paint color mode ──
// Runs inline as the theme root's first child, before the page paints: applies
// the stored mode (default dark, as the reference) and marks JS as available so
// progressive styles apply. Static string with no interpolated data; if a CSP is
// added, allow it by hash (see docs/multi-theme/phase-22-sienna-result.md).

export const COLOR_SCRIPT =
  '(function(){var r=document.currentScript.parentElement;try{var m=localStorage.getItem("' +
  COLOR_STORAGE_KEY +
  '");if(m==="light"||m==="dark")r.setAttribute("data-mode",m)}catch(e){}r.classList.add("js-ready")})()';
