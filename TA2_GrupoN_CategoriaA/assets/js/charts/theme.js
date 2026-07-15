/* ============================================================
   theme.js — paleta compartida, defaults de Plotly y helpers
   Paleta oscura validada con la skill dataviz (modo dark).
   ============================================================ */
(function () {
  const C = {
    ink:   '#ffffff',
    ink2:  '#e6d5f0',
    muted: '#a892bf',
    grid:  'rgba(255,90,168,0.10)',
    line:  'rgba(255,120,200,0.20)',
    surface: '#1c102a',
    // Neón Miami (estilo GTA VI)
    pink: '#ff2e93', magenta: '#ff5aa8', purple: '#9b5cff', orange: '#ff6a2a',
    yellow: '#ffc93f', cyan: '#16e0c8', red: '#ff3b6b', blue: '#5c8bff',
    aqua: '#16e0c8', green: '#16e0c8', violet: '#9b5cff',
    accent: '#ff2e93',
    // Estado / nivel de riesgo (neón)
    critical: '#ff2e93', serious: '#ff6a2a', warning: '#ffb020', good: '#16e0c8',
    // Rampa secuencial rosa (magnitud) tenue -> brillante
    seq: ['#2a0f22', '#5c1740', '#8f1d5e', '#c22579', '#e83b93', '#ff5aa8', '#ff8cc4'],
    // Rampa "atardecer Miami" (púrpura -> magenta -> naranja -> amarillo)
    heat: [
      [0.0, '#180a26'], [0.28, '#5e1a55'], [0.55, '#b02a6a'],
      [0.78, '#ff5a3c'], [1.0, '#ffc93f']
    ]
  };

  const categorical = [C.pink, C.cyan, C.yellow, C.orange, C.purple, C.magenta, C.blue, C.red];

  // Color por nivel de riesgo (estado, nunca serie)
  function riskColor(nivel) {
    if (/alto/i.test(nivel)) return C.critical;
    if (/medio/i.test(nivel)) return C.warning;
    return C.cyan; // Bajo
  }

  // Layout base de Plotly para modo oscuro
  function baseLayout(extra) {
    const base = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'system-ui, -apple-system, Segoe UI, sans-serif', color: C.ink2, size: 13 },
      margin: { l: 56, r: 20, t: 12, b: 44 },
      colorway: categorical,
      hoverlabel: {
        bgcolor: '#241333', bordercolor: 'rgba(255,120,200,0.4)',
        font: { color: C.ink, family: 'system-ui, sans-serif', size: 13 }
      },
      xaxis: { gridcolor: C.grid, zerolinecolor: C.line, linecolor: C.line, tickfont: { color: C.muted } },
      yaxis: { gridcolor: C.grid, zerolinecolor: C.line, linecolor: C.line, tickfont: { color: C.muted } },
      legend: { font: { color: C.ink2 }, bgcolor: 'rgba(0,0,0,0)' }
    };
    return Object.assign(base, extra || {});
  }

  const config = { displayModeBar: false, responsive: true, doubleClick: 'reset' };

  window.SA = { C, categorical, riskColor, baseLayout, config, charts: {}, plots: {} };
})();
