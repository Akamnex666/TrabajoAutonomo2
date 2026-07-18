/* ============================================================
   Hallazgo 4 — Bubble tipo Gapminder: riesgo provincial (Plotly)
   Scrollytelling: 0) letalidad  1) resalta Guayas  2) variación mensual
   Filtro libre: dropdown de métrica del eje Y (además de los pasos).
   x = total (log) · tamaño = cantones · color = nivel de riesgo
   ============================================================ */
(function () {
  const SA = window.SA, C = SA.C;
  let el0 = null;

  const METRICS = {
    pct_arma_fuego: { label: '% con arma de fuego', suffix: '%' },
    indice_riesgo:  { label: 'Índice de riesgo', suffix: '' },
    variacion:      { label: 'Variación mensual', suffix: '%' },
    edad_promedio:  { label: 'Edad promedio de la víctima', suffix: ' años' },
    ultimo_mes:     { label: 'Homicidios en el último mes', suffix: '' }
  };
  const NIVELES = [
    { key: 'Alto',  color: C.critical },
    { key: 'Medio', color: C.warning },
    { key: 'Bajo',  color: C.aqua }
  ];
  const LABEL_POS = {
    'GUAYAS': 'bottom center',
    'MANABÍ': 'top center',
    'EL ORO': 'middle left',
    'LOS RÍOS': 'bottom center',
    'ESMERALDAS': 'top right',
    'PICHINCHA': 'top right'
  };

  function traces(metric) {
    const P = window.SA_DATA.provincias;
    const maxCant = Math.max.apply(null, P.map(p => p.cantones || 1));
    return NIVELES.map(nv => {
      const rows = P.filter(p => (p.nivel || '').toLowerCase() === nv.key.toLowerCase());
      return {
        type: 'scatter', mode: 'markers+text', name: 'Riesgo ' + nv.key,
        x: rows.map(r => r.total), y: rows.map(r => r[metric]),
        text: rows.map(r => r.provincia),
        textposition: rows.map(r => LABEL_POS[r.provincia] || 'top center'),
        textfont: { color: '#c3c2b7', size: 10 },
        customdata: rows.map(r => [r.provincia, r.cantones, r.nivel]),
        marker: {
          size: rows.map(r => r.cantones || 1), sizemode: 'area',
          sizeref: 2.0 * maxCant / (52 * 52), sizemin: 6,
          color: nv.color, opacity: 0.85, line: { color: '#120a1f', width: 1.5 }
        },
        hovertemplate: '<b>%{customdata[0]}</b><br>Total: %{x} homicidios<br>' +
          METRICS[metric].label + ': %{y}' + (METRICS[metric].suffix || '') + '<br>' +
          'Cantones afectados: %{customdata[1]}<br>Nivel de riesgo: %{customdata[2]}<extra></extra>'
      };
    });
  }

  function layout(metric, annotations) {
    return SA.baseLayout({
      margin: { l: 62, r: 16, t: 10, b: 50 },
      xaxis: { type: 'log', range: [0.45, 3.35], autorange: false, title: { text: 'Total de homicidios (escala log)', font: { color: '#898781', size: 12 } }, gridcolor: C.grid, linecolor: C.line, tickfont: { color: '#898781' } },
      yaxis: { title: { text: METRICS[metric].label, font: { color: '#898781', size: 12 } }, gridcolor: C.grid, linecolor: C.line, tickfont: { color: '#898781' } },
      legend: { orientation: 'h', y: 1.08, x: 0, font: { color: '#c3c2b7', size: 12 } },
      showlegend: true, annotations: annotations || []
    });
  }

  function ann(x, y, text, ax, ay) {
    return { x: x, y: y, xref: 'x', yref: 'y', text: text, showarrow: true, arrowhead: 3,
      arrowcolor: '#ffc93f', ax: ax || -50, ay: ay || -34,
      font: { color: '#ffc93f', size: 12.5, family: 'system-ui, sans-serif' },
      bgcolor: 'rgba(22,22,26,0.85)', bordercolor: '#ffc93f', borderpad: 4, borderwidth: 1 };
  }

  function draw(el, metric, annotations) {
    Plotly.react(el, traces(metric), layout(metric, annotations), SA.config);
    const note = document.getElementById('bubble-note');
    if (note) note.textContent = 'Y = ' + METRICS[metric].label + ' · X = total (log)';
    const sel = document.getElementById('sel-metric');
    if (sel) sel.value = metric;
  }

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1'; el0 = el;
    const sel = document.getElementById('sel-metric');
    if (sel && !sel.dataset.built) {
      sel.dataset.built = '1';
      sel.innerHTML = Object.keys(METRICS).map(k => `<option value="${k}">${METRICS[k].label}</option>`).join('');
      sel.addEventListener('change', () => draw(el, sel.value));
    }
    draw(el, 'pct_arma_fuego');
    SA.plots.bubble = el;
  }

  function step(el, k) {
    if (!el.dataset.built) return;
    if (k <= 0) {
      draw(el, 'pct_arma_fuego');
    } else if (k === 1) {
      draw(el, 'pct_arma_fuego', [ann(1521, 91.2, 'Guayas: volumen + letalidad', -70, -30)]);
    } else {
      draw(el, 'variacion', [
        ann(31, 400, 'STO DGO +400%', -20, -30),
        ann(7, 300, 'BOLÍVAR +300%', -10, 34)
      ]);
    }
  }

  SA.charts.bubble = { render, step };
})();
