// Main app initialization and polling loop
const App = (() => {
  const POLL_INTERVAL = 15000;
  let pollTimer = null;
  let isFetching = false;

  async function fetchAndRender() {
    if (isFetching) return;
    isFetching = true;

    try {
      // Use allSettled so partial failures don't black out the entire UI
      const [dashResult, archiveResult, vpnResult, countsResult] = await Promise.allSettled([
        API.dashboard(),
        API.archive(),
        API.vpn(),
        API.counts()
      ]);

      // Update nav badges if counts succeeded
      if (countsResult.status === 'fulfilled') {
        const counts = countsResult.value;
        document.getElementById('count-services').textContent = counts.services;
        document.getElementById('count-devices').textContent = counts.devices;
        document.getElementById('count-files').textContent = counts.files;
      }

      // Render sections that succeeded
      if (dashResult.status === 'fulfilled') {
        const dashboard = dashResult.value;
        Orbs.render(dashboard.devices);
        Stats.render(dashboard.devices);
        Legend.render(dashboard.devices);
        if (Theme.isAnimOn()) Lightning.start();
      }

      if (archiveResult.status === 'fulfilled') {
        Charts.renderArchive(archiveResult.value.files);
      }

      if (vpnResult.status === 'fulfilled') {
        Charts.renderVpn(vpnResult.value.connections);
      }

      // Update timestamp
      const now = new Date();
      document.getElementById('last-update').textContent =
        `Updated: ${now.toLocaleTimeString()}`;

      // Log any failures
      [dashResult, archiveResult, vpnResult, countsResult].forEach(r => {
        if (r.status === 'rejected') console.error('API error:', r.reason);
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      isFetching = false;
    }
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(fetchAndRender, POLL_INTERVAL);
  }

  async function init() {
    Theme.init();
    await fetchAndRender();
    startPolling();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, fetchAndRender };
})();
