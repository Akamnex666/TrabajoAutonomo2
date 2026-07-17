/* ============================================================
   Hallazgo 2 — Sankey: tipo de muerte -> arma -> lugar -> franja
   Scrollytelling: 0) todo  1) arma de fuego  2) público  3) noche
   Filtro libre: dropdown que resalta flujos por dimensión
   ============================================================ */
(function () {
  var SA = window.SA, C = SA.C;
  var S = null, nodeColor = [], baseLink = [], el0 = null;

  function hexToRgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function idxOf(name) { return S.nodes.indexOf(name); }

  function linkColors(targets, hi) {
    return S.links.map(function (l) {
      return targets.indexOf(l.target) >= 0 ? hexToRgba(hi, 0.72) : 'rgba(150,150,160,0.06)';
    });
  }

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1';
    el0 = el;
    S = window.SA_DATA.sankey;

    nodeColor = [
      C.red, C.orange, C.magenta, C.orange, C.blue, C.muted,
      C.yellow, C.aqua, C.violet, C.blue, C.magenta, C.aqua
    ];
    baseLink = S.links.map(function (l) { return hexToRgba(nodeColor[l.source], 0.32); });
    var nodeX = [0.001, 0.001, 0.001, 0.34, 0.34, 0.34, 0.66, 0.66, 0.999, 0.999, 0.999, 0.999];

    var trace = {
      type: 'sankey', arrangement: 'snap', orientation: 'h',
      node: {
        pad: 16, thickness: 20, line: { color: '#0a1628', width: 1 },
        label: S.nodes, color: nodeColor, x: nodeX,
        hovertemplate: '<b>%{label}</b><br>%{value} casos<extra></extra>'
      },
      link: {
        source: S.links.map(function (l) { return l.source; }),
        target: S.links.map(function (l) { return l.target; }),
        value: S.links.map(function (l) { return l.value; }),
        color: baseLink,
        hovertemplate: '%{source.label} → %{target.label}<br><b>%{value} casos</b><extra></extra>'
      }
    };
    Plotly.newPlot(el, [trace], SA.baseLayout({
      margin: { l: 6, r: 6, t: 10, b: 10 },
      font: { color: '#ffffff', size: 13, family: 'system-ui, sans-serif' }
    }), SA.config);
    SA.plots.sankey = el;

    /* Poblar dropdown de filtro */
    var sel = document.getElementById('sel-sankey-filter');
    if (sel && !sel.dataset.built) {
      sel.dataset.built = '1';
      sel.addEventListener('change', function () {
        applyFilter(sel.value);
      });
    }
  }

  /* Aplicar filtro del dropdown (independiente de los pasos) */
  function applyFilter(filter) {
    if (!el0 || !el0.dataset.built) return;
    var colors;
    if (filter === 'all') {
      colors = baseLink;
    } else if (filter === 'weapon') {
      colors = linkColors([idxOf('Arma de fuego')], C.orange);
    } else if (filter === 'public') {
      colors = linkColors([idxOf('Público')], C.yellow);
    } else if (filter === 'night') {
      colors = linkColors([idxOf('Noche'), idxOf('Madrugada')], C.violet);
    } else {
      colors = baseLink;
    }
    Plotly.restyle(el0, { 'link.color': [colors] });
  }

  function step(el, k) {
    if (!el.dataset.built) return;
    var sel = document.getElementById('sel-sankey-filter');
    var colors;
    if (k <= 0) {
      if (sel) sel.value = 'all';
      colors = baseLink;
    } else if (k === 1) {
      if (sel) sel.value = 'weapon';
      colors = linkColors([idxOf('Arma de fuego')], C.orange);
    } else if (k === 2) {
      if (sel) sel.value = 'public';
      colors = linkColors([idxOf('Público')], C.yellow);
    } else {
      if (sel) sel.value = 'night';
      colors = linkColors([idxOf('Noche'), idxOf('Madrugada')], C.violet);
    }
    Plotly.restyle(el, { 'link.color': [colors] });
  }

  SA.charts.sankey = { render: render, step: step };
})();
