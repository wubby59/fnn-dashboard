// Theme manager: light / dark / auto + animation toggle
const Theme = (() => {
  const STORAGE_KEY = 'fnn-theme';
  const ANIM_KEY = 'fnn-anim';
  const MODES = ['light', 'dark', 'auto'];
  const ICONS = { light: '\u2600\uFE0F', dark: '\uD83C\uDF19', auto: '\uD83D\uDCBB' };

  let currentMode = localStorage.getItem(STORAGE_KEY) || 'auto';
  // Default: respect OS prefers-reduced-motion, but let user override via toggle
  const storedAnim = localStorage.getItem(ANIM_KEY);
  let animOn = storedAnim !== null
    ? storedAnim !== 'off'
    : !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function apply() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = currentMode === 'dark' || (currentMode === 'auto' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
    updateButton();
  }

  function updateButton() {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = ICONS[currentMode];
      btn.title = `Theme: ${currentMode}`;
      btn.setAttribute('aria-label', `Current theme: ${currentMode}. Click to switch.`);
    }
  }

  function applyAnim() {
    document.documentElement.classList.toggle('no-anim', !animOn);
    const btn = document.getElementById('anim-toggle');
    if (btn) {
      btn.textContent = animOn ? '\u26A1' : '\u23F8';
      btn.title = animOn ? 'Animations: on' : 'Animations: off';
      btn.setAttribute('aria-label', animOn ? 'Animations on. Click to pause.' : 'Animations off. Click to resume.');
    }
    // Stop/start bg lightning
    if (typeof BgLightning !== 'undefined') {
      animOn ? BgLightning.start() : BgLightning.stop();
    }
    if (typeof Lightning !== 'undefined') {
      // Only start Lightning from toggle clicks (orbs already in DOM).
      // Initial start is handled by app.js after orbs render.
      if (!animOn) Lightning.stop();
      else if (document.querySelectorAll('.service-orb').length > 0) Lightning.start();
    }
  }

  function toggleAnim() {
    animOn = !animOn;
    localStorage.setItem(ANIM_KEY, animOn ? 'on' : 'off');
    applyAnim();
  }

  function cycle() {
    const idx = MODES.indexOf(currentMode);
    currentMode = MODES[(idx + 1) % MODES.length];
    localStorage.setItem(STORAGE_KEY, currentMode);
    apply();
  }

  function init() {
    apply();
    applyAnim();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', cycle);
    const animBtn = document.getElementById('anim-toggle');
    if (animBtn) animBtn.addEventListener('click', toggleAnim);
  }

  return { init, apply, cycle, isAnimOn: () => animOn };
})();
