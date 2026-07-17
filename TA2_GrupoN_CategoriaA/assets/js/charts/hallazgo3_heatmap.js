/* ============================================================
   Hallazgo 3 — Heatmap día de semana x franja horaria (Plotly)
   Scrollytelling: 0) país  1) resalta la noche  2) filtra Guayas
   Filtro libre: dropdown de provincia (además de los pasos).
   ============================================================ */
(function () {
  const SA = window.SA;
  const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const DIAS_LBL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const FRANJAS = ['Madrugada', 'Mañana', 'Tarde', 'Noche'];
  const scale = SA.C.heat; // azul oscuro -> carmesí -> ámbar

  function matrix(prov) {
    const z = FRANJAS.map(() => DIAS.map(() => 0));
    let total = 0;
    window.SA_DATA.slim.forEach(r => {
      if (prov !== 'TODAS' && r.p !== prov) return;
      const fi = FRANJAS.indexOf(r.f), di = DIAS.indexOf(r.d);
      if (fi < 0 || di < 0) return;
      z[fi][di] += 1; total += 1;
    });
    return { z, total };
  }

  function rect(x0, x1, y0, y1) {
    return { type: 'rect', xref: 'x', yref: 'y', x0: x0, x1: x1, y0: y0, y1: y1,
      line: { color: '#f59e0b', width: 3 }, fillcolor: 'rgba(0,0,0,0)', layer: 'above' };
  }
  function note(x, y, text) {
    return { x: x, y: y, xref: 'x', yref: 'y', text: text, showarrow: true, arrowhead: 3,
      arrowcolor: '#f59e0b', ax: -46, ay: -40, font: { color: '#f59e0b', size: 13, family: 'system-ui, sans-serif' },
      bgcolor: 'rgba(13,27,42,0.85)', bordercolor: '#f59e0b', borderpad: 4, borderwidth: 1 };
  }

  function draw(el, prov, shapes, annotations) {
    const m = matrix(prov);
    const trace = {
      type: 'heatmap', x: DIAS_LBL, y: FRANJAS, z: m.z, colorscale: scale, zmin: 0,
      xgap: 3, ygap: 3,
      colorbar: { title: { text: 'casos', font: { color: '#7d8590', size: 11 } }, tickfont: { color: '#7d8590', size: 11 }, thickness: 12, len: 0.9, outlinewidth: 0 },
      hovertemplate: '%{y} · %{x}<br><b>%{z} homicidios</b><extra></extra>'
    };
    const layout = SA.baseLayout({
      margin: { l: 84, r: 10, t: 6, b: 40 },
      yaxis: { autorange: 'reversed', tickfont: { color: '#7d8590', size: 12 }, gridcolor: 'rgba(0,0,0,0)' },
      xaxis: { tickfont: { color: '#7d8590', size: 12 }, gridcolor: 'rgba(0,0,0,0)' },
      shapes: shapes || [], annotations: annotations || []
    });
    Plotly.react(el, [trace], layout, SA.config);
    const tag = document.getElementById('prov-total');
    if (tag) tag.textContent = m.total.toLocaleString('es-EC') + ' homicidios';
  }

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1';
    const sel = document.getElementById('sel-prov');
    if (sel && !sel.dataset.built) {
      sel.dataset.built = '1';
      const provs = window.SA_DATA.provincias.map(p => p.provincia);
      sel.innerHTML = '<option value="TODAS">Todas las provincias</option>' + provs.map(p => `<option value="${p}">${p}</option>`).join('');
      sel.addEventListener('change', () => draw(el, sel.value));
    }
    draw(el, 'TODAS');
    SA.plots.heatmap = el;
  }

  // Noche es la última franja (índice 3). Sáb=5, Dom=6.
  function step(el, k) {
    if (!el.dataset.built) return;
    const sel = document.getElementById('sel-prov');
    if (k <= 0) {
      if (sel) sel.value = 'TODAS';
      draw(el, 'TODAS');
    } else if (k === 1) {
      if (sel) sel.value = 'TODAS';
      draw(el, 'TODAS', [rect(-0.5, 6.5, 2.5, 3.5)], [note(6, 3, '60% de noche')]);
    } else {
      if (sel) sel.value = 'GUAYAS';
      draw(el, 'GUAYAS', [rect(4.5, 6.5, 2.5, 3.5)], [note(6, 3, 'Pico: fin de semana')]);
    }
  }

  SA.charts.heatmap = { render, step };
})();
