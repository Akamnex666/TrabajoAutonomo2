/* ============================================================
   Hallazgo 2 — Sankey: tipo de muerte -> arma -> lugar -> franja
   Scrollytelling: 0) todo  1) arma de fuego  2) público  3) noche
   ============================================================ */
(function () {
  const SA = window.SA, C = SA.C;
  let S = null, nodeColor = [], baseLink = [], el0 = null;

  function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const idxOf = name => S.nodes.indexOf(name);

  // Colores de enlace resaltando los que llegan a ciertos nodos destino
  function linkColors(targets, hi) {
    return S.links.map(l => targets.indexOf(l.target) >= 0 ? hexToRgba(hi, 0.72) : 'rgba(150,150,160,0.06)');
  }

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1'; el0 = el; S = window.SA_DATA.sankey;
    nodeColor = [
      C.red, C.orange, C.magenta, C.orange, C.blue, C.muted,
      C.yellow, C.aqua, C.violet, C.blue, C.magenta, C.aqua
    ];
    baseLink = S.links.map(l => hexToRgba(nodeColor[l.source], 0.32));
    const nodeX = [0.001, 0.001, 0.001, 0.34, 0.34, 0.34, 0.66, 0.66, 0.999, 0.999, 0.999, 0.999];

    const trace = {
      type: 'sankey', arrangement: 'snap', orientation: 'h',
      node: {
        pad: 16, thickness: 20, line: { color: '#120a1f', width: 1 },
        label: S.nodes, color: nodeColor, x: nodeX,
        hovertemplate: '<b>%{label}</b><br>%{value} casos<extra></extra>'
      },
      link: {
        source: S.links.map(l => l.source), target: S.links.map(l => l.target),
        value: S.links.map(l => l.value), color: baseLink,
        hovertemplate: '%{source.label} → %{target.label}<br><b>%{value} casos</b><extra></extra>'
      }
    };
    Plotly.newPlot(el, [trace], SA.baseLayout({
      margin: { l: 6, r: 6, t: 10, b: 10 }, font: { color: '#ffffff', size: 13, family: 'system-ui, sans-serif' }
    }), SA.config);
    SA.plots.sankey = el;
  }

  function step(el, k) {
    if (!el.dataset.built) return;
    let colors;
    if (k <= 0) colors = baseLink;
    else if (k === 1) colors = linkColors([idxOf('Arma de fuego')], C.orange);
    else if (k === 2) colors = linkColors([idxOf('Público')], C.yellow);
    else colors = linkColors([idxOf('Noche'), idxOf('Madrugada')], C.violet);
    Plotly.restyle(el, { 'link.color': [colors] });
  }

  SA.charts.sankey = { render, step };
})();
