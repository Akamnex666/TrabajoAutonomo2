/* ============================================================
   theme.js — Paleta criminalística sobria + defaults Plotly
   Carbón, blanco roto, carmesí, plomo/gris metálico.
   ============================================================ */
(function () {
  var C = {
    ink:   '#e0e0e0',
    ink2:  '#b8b8b8',
    muted: '#6b7280',
    grid:  'rgba(139, 144, 154, 0.1)',
    line:  'rgba(139, 144, 154, 0.22)',
    surface: '#1a1b20',
    /* Acentos */
    crimson: '#d90429', red: '#ef233c', amber: '#9ca3af', yellow: '#c5c9d0',
    blue: '#4a5568', emerald: '#6b7280', cyan: '#8b909a', orange: '#8b909a',
    /* Alias compatibilidad */
    pink: '#d90429', magenta: '#ef233c', purple: '#4a5568', aqua: '#8b909a',
    accent: '#d90429', green: '#6b7280', violet: '#4a5568', lead: '#8b909a',
    /* Riesgo */
    critical: '#d90429', serious: '#ef233c', warning: '#9ca3af', good: '#6b7280',
    /* Rampas */
    seq: ['#1a0a0e', '#3b0a14', '#6b0f1a', '#a11324', '#d90429', '#ef233c', '#f87171'],
    heat: [
      [0.0,  '#0b0c10'], [0.28, '#1a1b20'], [0.55, '#6b0f1a'],
      [0.78, '#d90429'], [1.0,  '#ef233c']
    ]
  };

  var categorical = [C.crimson, C.lead, C.slate || C.blue, C.muted, C.red, C.amber, C.cyan, C.violet];

  function riskColor(nivel) {
    if (/alto/i.test(nivel)) return C.critical;
    if (/medio/i.test(nivel)) return C.warning;
    return C.good;
  }

  function baseLayout(extra) {
    var base = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: '"Segoe UI", system-ui, -apple-system, sans-serif', color: C.ink2, size: 13 },
      margin: { l: 56, r: 20, t: 12, b: 44 },
      colorway: categorical,
      hoverlabel: {
        bgcolor: '#1a1b20', bordercolor: 'rgba(217, 4, 41, 0.35)',
        font: { color: C.ink, family: 'system-ui, sans-serif', size: 13 }
      },
      xaxis: { gridcolor: C.grid, zerolinecolor: C.line, linecolor: C.line, tickfont: { color: C.muted } },
      yaxis: { gridcolor: C.grid, zerolinecolor: C.line, linecolor: C.line, tickfont: { color: C.muted } },
      legend: { font: { color: C.ink2 }, bgcolor: 'rgba(0,0,0,0)' }
    };
    return Object.assign(base, extra || {});
  }

  var config = { displayModeBar: false, responsive: true, doubleClick: 'reset' };

  window.SA = { C: C, categorical: categorical, riskColor: riskColor, baseLayout: baseLayout, config: config, charts: {}, plots: {} };
})();
