/* ============================================================
   theme.js — paleta compartida, defaults de Plotly y helpers
   Paleta oscura validada con la skill dataviz (modo dark).
   ============================================================ */
(function () {
  const C = {
    ink:   '#ffffff',
    ink2:  '#c3c2b7',
    muted: '#898781',
    grid:  '#2c2c2a',
    line:  '#383835',
    surface: '#16161a',
    // Series categóricas (orden CVD-seguro)
    blue: '#3987e5', aqua: '#199e70', yellow: '#c98500', green: '#008300',
    violet: '#9085e9', red: '#e66767', magenta: '#d55181', orange: '#d95926',
    accent: '#e35555',
    // Estado / nivel de riesgo
    critical: '#d03b3b', serious: '#ec835a', warning: '#fab219', good: '#0ca30c',
    // Rampa secuencial azul (magnitud) 100 -> 700
    seq: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'],
    // Rampa "calor" para intensidad de homicidios (un solo tono, oscuro->cálido)
    heat: [
      [0.0, '#1b1b20'], [0.2, '#3a2233'], [0.4, '#6e2740'],
      [0.6, '#a83346'], [0.8, '#d9563f'], [1.0, '#f0a33c']
    ]
  };

  const categorical = [C.blue, C.aqua, C.yellow, C.green, C.violet, C.red, C.magenta, C.orange];

  // Color por nivel de riesgo (estado, nunca serie)
  function riskColor(nivel) {
    if (/alto/i.test(nivel)) return C.critical;
    if (/medio/i.test(nivel)) return C.warning;
    return C.aqua; // Bajo
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
        bgcolor: '#26262c', bordercolor: C.line,
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
