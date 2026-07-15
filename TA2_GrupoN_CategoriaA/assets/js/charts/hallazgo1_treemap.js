/* ============================================================
   Hallazgo 1 — Treemap jerárquico provincia -> cantón (Plotly)
   Scrollytelling: 0) país  1) resalta Guayas  2) zoom a Guayaquil
   ============================================================ */
(function () {
  const SA = window.SA;
  let ids = [], valById = {}, colorNormal = [], colorGuayas = [], colorGye = [], el0 = null;

  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function blue(t) {
    t = Math.max(0, Math.min(1, t));
    const s = [[0, [21, 52, 83]], [0.5, [47, 122, 214]], [1, [159, 198, 246]]];
    let i = 0; while (i < s.length - 1 && t > s[i + 1][0]) i++;
    const c0 = s[i][1], c1 = s[Math.min(i + 1, s.length - 1)][1];
    const t0 = s[i][0], t1 = s[Math.min(i + 1, s.length - 1)][0];
    const f = (t1 === t0) ? 0 : (t - t0) / (t1 - t0);
    return 'rgb(' + lerp(c0[0], c1[0], f) + ',' + lerp(c0[1], c1[1], f) + ',' + lerp(c0[2], c1[2], f) + ')';
  }
  const isGuayas = id => id === 'GUAYAS' || id.indexOf('GUAYAS||') === 0;

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1'; el0 = el;
    const tm = window.SA_DATA.treemap;
    const provTot = {};
    tm.forEach(r => { provTot[r.prov] = (provTot[r.prov] || 0) + r.valor; });
    const grand = Object.values(provTot).reduce((a, b) => a + b, 0);

    const labels = ['Ecuador'], parents = [''], values = [grand];
    ids = ['Ecuador']; valById = { 'Ecuador': grand };
    Object.keys(provTot).forEach(p => { ids.push(p); labels.push(p); parents.push('Ecuador'); values.push(provTot[p]); valById[p] = provTot[p]; });
    tm.forEach(r => { const id = r.prov + '||' + r.canton; ids.push(id); labels.push(r.canton); parents.push(r.prov); values.push(r.valor); valById[id] = r.valor; });

    const maxV = Math.max.apply(null, ids.filter(i => i !== 'Ecuador').map(i => valById[i]));
    const bl = id => blue(Math.sqrt(valById[id] / maxV));
    colorNormal = ids.map(id => id === 'Ecuador' ? '#12233a' : bl(id));
    colorGuayas = ids.map(id => id === 'Ecuador' ? '#12233a' : (isGuayas(id) ? bl(id) : '#34343d'));
    colorGye = ids.map(id => id === 'GUAYAS||GUAYAQUIL' ? '#f0a33c' : (isGuayas(id) ? bl(id) : '#34343d'));

    const trace = {
      type: 'treemap', ids: ids, labels: labels, parents: parents, values: values,
      branchvalues: 'total', maxdepth: 2, level: 'Ecuador',
      marker: { colors: colorNormal, line: { color: '#16161a', width: 2 } },
      tiling: { pad: 2 },
      pathbar: { visible: true, thickness: 22, textfont: { color: '#c3c2b7', size: 12 } },
      texttemplate: '<b>%{label}</b><br>%{value}',
      textfont: { color: '#ffffff', size: 13, family: 'system-ui, sans-serif' },
      hovertemplate: '<b>%{label}</b><br>%{value} homicidios<br>%{percentRoot} del país<extra></extra>'
    };
    Plotly.newPlot(el, [trace], SA.baseLayout({ margin: { l: 4, r: 4, t: 4, b: 4 } }), SA.config);
    SA.plots.treemap = el;
  }

  function step(el, k) {
    if (!el.dataset.built) return;
    if (k <= 0) Plotly.restyle(el, { level: ['Ecuador'], 'marker.colors': [colorNormal] });
    else if (k === 1) Plotly.restyle(el, { level: ['Ecuador'], 'marker.colors': [colorGuayas] });
    else Plotly.restyle(el, { level: ['GUAYAS'], 'marker.colors': [colorGye] });
  }

  SA.charts.treemap = { render, step };
})();
