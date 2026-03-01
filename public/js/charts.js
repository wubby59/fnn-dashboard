// Chart.js archive and VPN chart rendering
const Charts = (() => {
  const archiveCharts = {};
  const vpnCharts = {};
  let lastArchiveTheme = null;
  let lastVpnTheme = null;

  // Set Inter as default chart font
  Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";

  function getChartColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      isDark,
      text: isDark ? 'rgba(226, 232, 240, 0.8)' : 'rgba(15, 23, 42, 0.7)',
      grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      primary: '#0EA5E9',
      primaryLight: '#38BDF8',
      sent: '#EF4444',
      received: '#10B981'
    };
  }

  function tooltipColors(isDark) {
    return {
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      titleColor: isDark ? '#E0F2FE' : 'rgb(15, 23, 42)',
      bodyColor: isDark ? '#CBD5E1' : 'rgb(100, 116, 139)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      borderWidth: 1,
      cornerRadius: 10,
      padding: 12,
      titleFont: { weight: 600, size: 12 },
      bodyFont: { size: 11 },
      displayColors: true,
      boxPadding: 4
    };
  }

  function baseChartOptions(colors) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: { size: 12, weight: 500 },
            usePointStyle: true,
            pointStyleWidth: 8
          }
        },
        tooltip: tooltipColors(colors.isDark)
      },
      scales: {
        x: {
          ticks: { color: colors.text, maxRotation: 45, font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: colors.text, font: { size: 11 } },
          grid: { color: colors.grid },
          beginAtZero: true
        }
      }
    };
  }

  function updateChartTheme(chart, colors) {
    chart.options.scales.x.ticks.color = colors.text;
    chart.options.scales.x.grid.display = false;
    chart.options.scales.y.ticks.color = colors.text;
    chart.options.scales.y.grid.color = colors.grid;
    chart.options.plugins.legend.labels.color = colors.text;
    Object.assign(chart.options.plugins.tooltip, tooltipColors(colors.isDark));
  }

  function formatDate(dateStr) {
    const ts = String(dateStr);
    const d = ts.includes('Z') || ts.includes('+') ? ts : ts + 'Z';
    const date = new Date(d);
    if (isNaN(date.getTime())) return dateStr;
    return `${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
  }

  // Palette for archive lines
  const ARCHIVE_PALETTE = [
    '#0EA5E9', '#22C55E', '#EAB308', '#EF4444',
    '#A855F7', '#F97316', '#06B6D4', '#EC4899'
  ];

  function formatDay(dateStr) {
    const ts = String(dateStr);
    const d = ts.includes('Z') || ts.includes('+') ? ts : ts + 'Z';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return (date.getMonth()+1).toString().padStart(2,'0') + '/' + date.getDate().toString().padStart(2,'0');
  }

  function shortName(name) {
    return name.replace(/\.(tar\.gz|zip|gz|bz2)$/, '').replace(/^backup-/, '');
  }

  function makeGradientFill(ctx, color, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color.replace(')', ', 0.12)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
    return gradient;
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function renderArchive(files) {
    const container = document.getElementById('archive-charts');
    if (!container) return;

    const fileNames = Object.keys(files);
    if (fileNames.length === 0) {
      container.innerHTML = '<div class="charts-empty">No archive data available</div>';
      return;
    }

    const colors = getChartColors();
    const themeSwitch = lastArchiveTheme !== colors.isDark;
    if (themeSwitch) lastArchiveTheme = colors.isDark;

    // Day labels from first file's dates
    const labels = files[fileNames[0]].map(d => formatDay(d.date));

    const canvasId = 'archive-combined-chart';

    // Build datasets - one line per file with gradient fills
    const buildDatasets = (canvas) => {
      const ctx = canvas.getContext('2d');
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 200;
      return fileNames.map((name, i) => {
        const color = ARCHIVE_PALETTE[i % ARCHIVE_PALETTE.length];
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, hexToRgba(color, 0.1));
        gradient.addColorStop(1, hexToRgba(color, 0));
        return {
          label: shortName(name),
          data: files[name].map(d => d.size_mb),
          borderColor: color,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 1.5
        };
      });
    };

    if (archiveCharts[canvasId]) {
      const canvas = document.getElementById(canvasId);
      const datasets = buildDatasets(canvas);
      archiveCharts[canvasId].data.labels = labels;
      datasets.forEach((ds, i) => {
        if (archiveCharts[canvasId].data.datasets[i]) {
          archiveCharts[canvasId].data.datasets[i].data = ds.data;
          archiveCharts[canvasId].data.datasets[i].backgroundColor = ds.backgroundColor;
        }
      });
      if (themeSwitch) updateChartTheme(archiveCharts[canvasId], colors);
      archiveCharts[canvasId].update('none');
    } else {
      container.innerHTML = '';
      const card = document.createElement('div');
      card.className = 'glass-card-secondary archive-chart-single';

      const wrapper = document.createElement('div');
      wrapper.className = 'archive-chart-single__canvas';

      const canvas = document.createElement('canvas');
      canvas.id = canvasId;
      wrapper.appendChild(canvas);
      card.appendChild(wrapper);
      container.appendChild(card);

      const datasets = buildDatasets(canvas);
      const base = baseChartOptions(colors);
      archiveCharts[canvasId] = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
          ...base,
          plugins: {
            ...base.plugins,
            legend: {
              position: 'bottom',
              labels: {
                color: colors.text,
                font: { size: 10, weight: 500 },
                usePointStyle: true,
                pointStyleWidth: 6,
                boxWidth: 6,
                padding: 8
              }
            },
            tooltip: {
              ...tooltipColors(colors.isDark),
              callbacks: {
                label: function(ctx) {
                  const mb = ctx.parsed.y;
                  const val = mb >= 1000 ? (mb / 1024).toFixed(1) + ' GB' : Math.round(mb) + ' MB';
                  return ctx.dataset.label + ': ' + val;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { color: colors.text, font: { size: 9 }, maxRotation: 0 },
              grid: { display: false }
            },
            y: {
              ticks: {
                color: colors.text,
                font: { size: 9 },
                callback: function(v) { return v >= 1000 ? (v / 1024).toFixed(0) + 'G' : v + 'M'; }
              },
              grid: { color: colors.grid },
              beginAtZero: false
            }
          }
        }
      });
    }
  }

  function renderVpn(connections) {
    const container = document.getElementById('vpn-charts');
    if (!container) return;

    const clientNames = Object.keys(connections);
    if (clientNames.length === 0) {
      container.innerHTML = '<div class="charts-empty">No VPN data available</div>';
      return;
    }

    const colors = getChartColors();

    if (container.children.length === 0 || container.querySelector('.charts-empty')) {
      container.innerHTML = '';
      clientNames.forEach(name => {
        const card = document.createElement('div');
        card.className = 'glass-card-secondary chart-card';
        card.dataset.chartVpn = name;

        const title = document.createElement('div');
        title.className = 'chart-card__title';
        title.textContent = name;

        const wrapper = document.createElement('div');
        wrapper.className = 'chart-card__canvas-wrapper';

        const canvas = document.createElement('canvas');
        canvas.id = `vpn-chart-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;

        wrapper.appendChild(canvas);
        card.appendChild(title);
        card.appendChild(wrapper);
        container.appendChild(card);
      });
    }

    const vpnThemeSwitch = lastVpnTheme !== colors.isDark;
    if (vpnThemeSwitch) lastVpnTheme = colors.isDark;

    clientNames.forEach(name => {
      const canvasId = `vpn-chart-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const dataPoints = connections[name];
      const labels = dataPoints.map(d => formatDate(d.date));
      const sentData = dataPoints.map(d => d.sent);
      const recvData = dataPoints.map(d => d.received);

      const sentColor = colors.isDark ? '#38BDF8' : '#0369A1';
      const recvColor = colors.isDark ? '#FBBF24' : '#D97706';

      // Create gradient fills
      const ctx = canvas.getContext('2d');
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 140;
      const sentGradient = ctx.createLinearGradient(0, 0, 0, height);
      sentGradient.addColorStop(0, hexToRgba(sentColor, 0.12));
      sentGradient.addColorStop(1, hexToRgba(sentColor, 0));
      const recvGradient = ctx.createLinearGradient(0, 0, 0, height);
      recvGradient.addColorStop(0, hexToRgba(recvColor, 0.08));
      recvGradient.addColorStop(1, hexToRgba(recvColor, 0));

      if (vpnCharts[canvasId]) {
        vpnCharts[canvasId].data.labels = labels;
        vpnCharts[canvasId].data.datasets[0].data = sentData;
        vpnCharts[canvasId].data.datasets[1].data = recvData;
        if (vpnThemeSwitch) {
          updateChartTheme(vpnCharts[canvasId], colors);
          vpnCharts[canvasId].data.datasets[0].borderColor = sentColor;
          vpnCharts[canvasId].data.datasets[0].backgroundColor = sentGradient;
          vpnCharts[canvasId].data.datasets[1].borderColor = recvColor;
          vpnCharts[canvasId].data.datasets[1].backgroundColor = recvGradient;
        }
        vpnCharts[canvasId].update('none');
      } else {
        vpnCharts[canvasId] = new Chart(canvas, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Sent',
                data: sentData,
                borderColor: sentColor,
                backgroundColor: sentGradient,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2
              },
              {
                label: 'Received',
                data: recvData,
                borderColor: recvColor,
                backgroundColor: recvGradient,
                borderDash: [5, 3],
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2
              }
            ]
          },
          options: {
            ...baseChartOptions(colors),
            plugins: {
              ...baseChartOptions(colors).plugins,
              legend: { ...baseChartOptions(colors).plugins.legend, position: 'bottom' }
            }
          }
        });
      }
    });
  }

  return { renderArchive, renderVpn };
})();
