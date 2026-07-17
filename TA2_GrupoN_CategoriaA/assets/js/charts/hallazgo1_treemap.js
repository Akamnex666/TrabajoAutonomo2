/* ============================================================
   Hallazgo 1 — Treemap jerárquico provincia -> cantón (Plotly)
   Scrollytelling: 0) país  1) resalta Guayas  2) zoom a Guayaquil
   Filtro libre: dropdown de provincia para hacer zoom
   ============================================================ */
(function () {
  var SA = window.SA;
  var ids = [], valById = {}, colorNormal = [], colorGuayas = [], colorGye = [];
  var el0 = null;
  var provTot = {};

  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

  function blue(t) {
    t = Math.max(0, Math.min(1, t));
    var s = [[0, [26, 10, 14]], [0.5, [127, 29, 45]], [1, [239, 68, 68]]];
    var i = 0;
    while (i < s.length - 1 && t > s[i + 1][0]) i++;
    var c0 = s[i][1], c1 = s[Math.min(i + 1, s.length - 1)][1];
    var t0 = s[i][0], t1 = s[Math.min(i + 1, s.length - 1)][0];
    var f = (t1 === t0) ? 0 : (t - t0) / (t1 - t0);
    return 'rgb(' + lerp(c0[0], c1[0], f) + ',' + lerp(c0[1], c1[1], f) + ',' + lerp(c0[2], c1[2], f) + ')';
  }

  function isGuayas(id) { return id === 'GUAYAS' || id.indexOf('GUAYAS||') === 0; }

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1';
    el0 = el;
    var tm = window.SA_DATA.treemap;
    provTot = {};
    tm.forEach(function (r) { provTot[r.prov] = (provTot[r.prov] || 0) + r.valor; });
    var grand = Object.values(provTot).reduce(function (a, b) { return a + b; }, 0);

    var labels = ['Ecuador'], parents = [''], values = [grand];
    ids = ['Ecuador'];
    valById = { 'Ecuador': grand };
    Object.keys(provTot).forEach(function (p) {
      ids.push(p); labels.push(p); parents.push('Ecuador');
      values.push(provTot[p]); valById[p] = provTot[p];
    });
    tm.forEach(function (r) {
      var id = r.prov + '||' + r.canton;
      ids.push(id); labels.push(r.canton); parents.push(r.prov);
      values.push(r.valor); valById[id] = r.valor;
    });

    var maxV = Math.max.apply(null, ids.filter(function (i) { return i !== 'Ecuador'; }).map(function (i) { return valById[i]; }));
    var bl = function (id) { return blue(Math.sqrt(valById[id] / maxV)); };
    colorNormal = ids.map(function (id) { return id === 'Ecuador' ? '#0d1b2a' : bl(id); });
    colorGuayas = ids.map(function (id) { return id === 'Ecuador' ? '#0d1b2a' : (isGuayas(id) ? bl(id) : '#1a2332'); });
    colorGye = ids.map(function (id) { return id === 'GUAYAS||GUAYAQUIL' ? '#f59e0b' : (isGuayas(id) ? bl(id) : '#1a2332'); });

    var trace = {
      type: 'treemap', ids: ids, labels: labels, parents: parents, values: values,
      branchvalues: 'total', maxdepth: 2, level: 'Ecuador',
      marker: { colors: colorNormal, line: { color: '#0a1628', width: 2 } },
      tiling: { pad: 2 },
      pathbar: { visible: true, thickness: 22, textfont: { color: '#7d8590', size: 12 } },
      texttemplate: '<b>%{label}</b><br>%{value}',
      textfont: { color: '#ffffff', size: 13, family: 'system-ui, sans-serif' },
      hovertemplate: '<b>%{label}</b><br>%{value} homicidios<br>%{percentRoot} del país<extra></extra>'
    };
    Plotly.newPlot(el, [trace], SA.baseLayout({ margin: { l: 4, r: 4, t: 4, b: 4 } }), SA.config);
    SA.plots.treemap = el;

    /* Poblar dropdown de provincia */
    var sel = document.getElementById('sel-treemap-prov');
    if (sel && !sel.dataset.built) {
      sel.dataset.built = '1';
      var provs = Object.keys(provTot).sort();
      sel.innerHTML = '<option value="TODAS">Todas las provincias</option>' +
        provs.map(function (p) { return '<option value="' + p + '">' + p + ' (' + provTot[p] + ')</option>'; }).join('');
      sel.addEventListener('change', function () {
        zoomToProvince(sel.value);
      });
    }
  }

  /* Zoom a una provincia específica */
  function zoomToProvince(prov) {
    if (!el0 || !el0.dataset.built) return;
    if (prov === 'TODAS') {
      Plotly.restyle(el0, { level: ['Ecuador'], 'marker.colors': [colorNormal] });
    } else {
      /* Crear colores que resalten solo la provincia seleccionada */
      var maxV = Math.max.apply(null, ids.filter(function (i) { return i !== 'Ecuador'; }).map(function (i) { return valById[i]; }));
      var bl = function (id) { return blue(Math.sqrt(valById[id] / maxV)); };
      var provColors = ids.map(function (id) {
        if (id === 'Ecuador' || id === prov || id.indexOf(prov + '||') === 0) {
          return id === 'Ecuador' ? '#0d1b2a' : bl(id);
        }
        return '#111827';
      });
      Plotly.restyle(el0, { level: [prov], 'marker.colors': [provColors] });
    }
  }

  function step(el, k) {
    if (!el.dataset.built) return;
    var sel = document.getElementById('sel-treemap-prov');
    if (k <= 0) {
      if (sel) sel.value = 'TODAS';
      Plotly.restyle(el, { level: ['Ecuador'], 'marker.colors': [colorNormal] });
    } else if (k === 1) {
      if (sel) sel.value = 'TODAS';
      Plotly.restyle(el, { level: ['Ecuador'], 'marker.colors': [colorGuayas] });
    } else {
      if (sel) sel.value = 'GUAYAS';
      Plotly.restyle(el, { level: ['GUAYAS'], 'marker.colors': [colorGye] });
    }
  }

  SA.charts.treemap = { render: render, step: step };
})();
