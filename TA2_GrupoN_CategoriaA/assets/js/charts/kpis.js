/* ============================================================
   kpis.js — KPI scorecard con contadores animados (GSAP)
   render() pinta los valores finales; animate() dispara el conteo
   cuando el usuario llega al panel.
   ============================================================ */
(function () {
  const SA = window.SA;

  function fmt(v, decimals, thousand) {
    if (thousand) return Math.round(v).toLocaleString('es-EC');
    return v.toLocaleString('es-EC', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function cards() {
    const k = window.SA_DATA.kpis;
    return [
      { value: k.total,          decimals: 0, unit: '',  thousand: true,  accent: SA.C.accent, label: 'Muertes violentas registradas', sub: 'Enero – mayo 2026 · 23 provincias' },
      { value: k.pct_arma_fuego, decimals: 1, unit: '%', thousand: false, accent: SA.C.orange, label: 'Cometidos con arma de fuego',    sub: 'La pistola es el arma dominante' },
      { value: k.pct_noche,      decimals: 1, unit: '%', thousand: false, accent: SA.C.violet, label: 'Ocurren de noche o madrugada',   sub: 'Pico en fines de semana' },
      { value: k.pct_guayas,     decimals: 1, unit: '%', thousand: false, accent: SA.C.blue,   label: 'Concentrados en Guayas',        sub: '1 de cada 4 solo en Guayaquil' }
    ];
  }

  function render(el) {
    if (el.dataset.built) return;
    el.dataset.built = '1';
    const cs = cards();
    el.innerHTML = cs.map(c => `
      <div class="kpi-card" style="--kpi-accent:${c.accent}">
        <div class="kpi-value" data-target="${c.value}" data-dec="${c.decimals}" data-thousand="${c.thousand}" data-unit="${c.unit}">
          ${fmt(c.value, c.decimals, c.thousand)}<span class="unit">${c.unit}</span>
        </div>
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-sub">${c.sub}</div>
      </div>`).join('');
  }

  function animate(el) {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = '1';
    if (!window.gsap) return;
    el.querySelectorAll('.kpi-value').forEach((node, i) => {
      const target = parseFloat(node.dataset.target);
      const dec = parseInt(node.dataset.dec, 10);
      const thousand = node.dataset.thousand === 'true';
      const unit = '<span class="unit">' + node.dataset.unit + '</span>';
      const obj = { v: 0 };
      node.innerHTML = fmt(0, dec, thousand) + unit;
      gsap.to(obj, {
        v: target, duration: 1.6, delay: 0.12 * i, ease: 'power2.out',
        onUpdate: () => { node.innerHTML = fmt(obj.v, dec, thousand) + unit; }
      });
    });
  }

  SA.charts.kpis = { render, animate };
})();
