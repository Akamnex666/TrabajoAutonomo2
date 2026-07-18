/* ============================================================
   Hallazgo 3 — Scatter 3D interactivo (Plotly.js)
   Ejes: Hora del día (x) × Edad de víctima (y) × Franja horaria (z)
   Color = franja horaria. Arrastrable, zoom, interactivo.
   Scrollytelling: 0) todos  1) resalta noche  2) filtra Guayas
   ============================================================ */
(function () {
  var SA = window.SA;
  var FRANJAS = ['Madrugada', 'Mañana', 'Tarde', 'Noche'];
  var FRANJA_Z = { Madrugada: 0, Mañana: 1, Tarde: 2, Noche: 3 };
  var FRANJA_COLORS = {
    Madrugada: '#6366f1',
    Mañana:    '#22d3ee',
    Tarde:     '#f59e0b',
    Noche:     '#dc2626'
  };

  function buildTraces(prov) {
    var groups = {};
    FRANJAS.forEach(function (f) { groups[f] = { x: [], y: [], z: [], text: [], color: FRANJA_COLORS[f] }; });

    window.SA_DATA.slim.forEach(function (r) {
      if (prov !== 'TODAS' && r.p !== prov) return;
      var g = groups[r.f];
      if (!g) return;
      g.x.push(r.a);
      g.y.push(r.e);
      g.z.push(FRANJA_Z[r.f]);
      g.text.push(r.p + '<br>' + r.d + ' · ' + r.f + '<br>Edad: ' + r.e + ' · Hora: ' + r.a + ':00');
    });

    return FRANJAS.map(function (f) {
      var g = groups[f];
      return {
        type: 'scatter3d',
        mode: 'markers',
        name: f,
        x: g.x, y: g.y, z: g.z,
        text: g.text,
        hovertemplate: '%{text}<extra></extra>',
        marker: {
          size: 3.5,
          color: g.color,
          opacity: 0.7,
          line: { color: 'rgba(255,255,255,0.15)', width: 0.5 }
        }
      };
    });
  }

  function draw(el, prov, cameraEye) {
    var traces = buildTraces(prov);
    var count = 0;
    traces.forEach(function (t) { count += t.x.length; });

    var layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: '"Segoe UI", system-ui, sans-serif', color: '#c9d1d9', size: 11 },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        xaxis: {
          title: { text: 'Hora del día', font: { color: '#7d8590', size: 11 } },
          gridcolor: 'rgba(59,130,246,0.08)',
          backgroundcolor: 'rgba(0,0,0,0)',
          range: [-0.5, 23.5],
          dtick: 4,
          tickfont: { color: '#7d8590', size: 10 },
          showspikes: false
        },
        yaxis: {
          title: { text: 'Edad', font: { color: '#7d8590', size: 11 } },
          gridcolor: 'rgba(59,130,246,0.08)',
          backgroundcolor: 'rgba(0,0,0,0)',
          range: [0, 90],
          tickfont: { color: '#7d8590', size: 10 },
          showspikes: false
        },
        zaxis: {
          title: { text: 'Franja', font: { color: '#7d8590', size: 11 } },
          gridcolor: 'rgba(59,130,246,0.08)',
          backgroundcolor: 'rgba(0,0,0,0)',
          range: [-0.5, 3.5],
          tickvals: [0, 1, 2, 3],
          ticktext: ['Madru.', 'Mañ.', 'Tarde', 'Noche'],
          tickfont: { color: '#7d8590', size: 10 },
          showspikes: false
        },
        bgcolor: 'rgba(0,0,0,0)',
        camera: {
          eye: cameraEye || { x: 1.6, y: -1.8, z: 1.0 }
        },
        aspectmode: 'manual',
        aspectratio: { x: 1.2, y: 1, z: 0.7 }
      },
      legend: {
        x: 0.01, y: 0.99,
        bgcolor: 'rgba(13,27,42,0.85)',
        bordercolor: 'rgba(59,130,246,0.15)',
        borderwidth: 1,
        font: { color: '#c9d1d9', size: 11 }
      },
      showlegend: true
    };

    var config = {
      displayModeBar: true,
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
      displaylogo: false,
      responsive: true,
      scrollZoom: true
    };

    Plotly.react(el, traces, layout, config);

    var tag = document.getElementById('scatter-total');
    if (tag) tag.textContent = count.toLocaleString('es-EC') + ' puntos';
  }

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1';

    var sel = document.getElementById('sel-scatter-prov');
    if (sel && !sel.dataset.built) {
      sel.dataset.built = '1';
      var provs = window.SA_DATA.provincias.map(function (p) { return p.provincia; });
      sel.innerHTML = '<option value="TODAS">Todas las provincias</option>' +
        provs.map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join('');
      sel.addEventListener('change', function () { draw(el, sel.value); });
    }

    draw(el, 'TODAS');
    SA.plots.scatter3d = el;
  }

  /* Scrollytelling steps:
     0) vista general
     1) resaltar noche (cámara se acerca a z=3)
     2) filtrar Guayas (cámara en ángulo alto) */
  function step(el, k) {
    if (!el.dataset.built) return;
    var sel = document.getElementById('sel-scatter-prov');
    if (k <= 0) {
      if (sel) sel.value = 'TODAS';
      draw(el, 'TODAS', { x: 1.6, y: -1.8, z: 1.0 });
    } else if (k === 1) {
      if (sel) sel.value = 'TODAS';
      draw(el, 'TODAS', { x: 0.5, y: -2.2, z: 1.6 });
    } else {
      if (sel) sel.value = 'GUAYAS';
      draw(el, 'GUAYAS', { x: 1.2, y: -2.0, z: 1.2 });
    }
  }

  SA.charts.scatter3d = { render: render, step: step };
})();
