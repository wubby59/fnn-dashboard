// Canvas lightning sparks between nearby orbs
const Lightning = (() => {
  let canvas, ctx;
  let animFrameId = null;
  let bolts = [];
  let lastSpawn = 0;

  const BOLT_COLOR = '#38BDF8';
  const CORE_COLOR = '#E0F2FE';
  const GLOW_COLOR = '#0EA5E9';
  const MAX_DIST = 800;
  const SPAWN_MIN = 800;
  const SPAWN_MAX = 2300;
  const LIFE_MIN = 150;
  const LIFE_MAX = 350;

  function getOrbPositions() {
    const orbs = document.querySelectorAll('.service-orb-wrapper:not(.service-orb-wrapper--clone) .service-orb');
    const canvasRect = canvas?.getBoundingClientRect();
    if (!canvasRect || orbs.length === 0) return [];

    return Array.from(orbs)
      .map(orb => {
        const rect = orb.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - canvasRect.left,
          y: rect.top + rect.height / 2 - canvasRect.top
        };
      })
      .filter(pos => pos.x >= -50 && pos.x <= canvasRect.width + 50);
  }

  function createBolt(positions) {
    if (positions.length < 2) return null;

    let attempts = 0;
    while (attempts < 20) {
      const a = Math.floor(Math.random() * positions.length);
      let b = Math.floor(Math.random() * positions.length);
      if (a === b) { attempts++; continue; }

      const dx = positions[b].x - positions[a].x;
      const dy = positions[b].y - positions[a].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DIST) {
        return {
          start: positions[a],
          end: positions[b],
          life: LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN),
          born: performance.now(),
          segments: generateSegments(positions[a], positions[b])
        };
      }
      attempts++;
    }

    // Fallback: find closest pair
    if (positions.length >= 2) {
      let minDist = Infinity, bestA = 0, bestB = 1;
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[j].x - positions[i].x;
          const dy = positions[j].y - positions[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist) { minDist = d; bestA = i; bestB = j; }
        }
      }
      return {
        start: positions[bestA],
        end: positions[bestB],
        life: LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN),
        born: performance.now(),
        segments: generateSegments(positions[bestA], positions[bestB])
      };
    }
    return null;
  }

  function generateSegments(start, end) {
    const segments = [{ x: start.x, y: start.y }];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = 5 + Math.floor(Math.random() * 4);

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const jitter = 15 + Math.random() * 20;
      segments.push({
        x: start.x + dx * t + (Math.random() - 0.5) * jitter,
        y: start.y + dy * t + (Math.random() - 0.5) * jitter
      });
    }
    segments.push({ x: end.x, y: end.y });
    return segments;
  }

  function drawBolt(bolt, alpha) {
    const { segments } = bolt;
    if (segments.length < 2) return;

    // Glow
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = GLOW_COLOR;
    ctx.lineWidth = 6;
    ctx.shadowColor = GLOW_COLOR;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // Main bolt
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = BOLT_COLOR;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // Core
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = CORE_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function animate(now) {
    if (!canvas || !ctx) return;

    // Stop if reduced motion is preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animFrameId = null;
      return;
    }

    // Pause when tab is hidden
    if (document.hidden) {
      animFrameId = requestAnimationFrame(animate);
      return;
    }

    const container = document.getElementById('orbs-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    // DPI-aware canvas sizing
    const dpr = window.devicePixelRatio || 1;
    const displayW = rect.width;
    const displayH = rect.height;
    if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = displayW + 'px';
      canvas.style.height = displayH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.clearRect(0, 0, displayW, displayH);

    // Spawn new bolts
    const spawnInterval = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    if (now - lastSpawn > spawnInterval) {
      const positions = getOrbPositions();
      const bolt = createBolt(positions);
      if (bolt) bolts.push(bolt);
      lastSpawn = now;
    }

    // Draw and prune bolts
    bolts = bolts.filter(bolt => {
      const age = now - bolt.born;
      if (age > bolt.life) return false;

      const alpha = 1 - (age / bolt.life);
      drawBolt(bolt, alpha);
      return true;
    });

    animFrameId = requestAnimationFrame(animate);
  }

  function start() {
    canvas = document.getElementById('lightning-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (animFrameId) return; // already running
    requestAnimationFrame(() => {
      animFrameId = requestAnimationFrame(animate);
    });
  }

  function stop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  // Pause/resume on visibility change
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      if (!animFrameId && canvas && typeof Theme !== 'undefined' && Theme.isAnimOn()) start();
    });
  }

  return { start, stop };
})();
