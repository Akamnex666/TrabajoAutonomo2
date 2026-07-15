/* ============================================================
   main.js — Scrollytelling con scroll horizontal (GSAP).
   Línea de tiempo maestra: se desplaza entre paneles y, en cada
   hallazgo, PAUSA mientras los pasos transforman el gráfico fijo.
   ============================================================ */
(function () {
  const SA = window.SA;
  const PX_PER_UNIT = 360; // px de scroll por unidad de tiempo de la timeline

  // Contenedores de gráfico -> módulo
  const CHART_RENDERERS = [
    ['kpi-grid', 'kpis'], ['chart-treemap', 'treemap'], ['chart-sankey', 'sankey'],
    ['chart-heatmap', 'heatmap'], ['chart-bubble', 'bubble']
  ];

  function renderPanelCharts(panel) {
    CHART_RENDERERS.forEach(function (pair) {
      const el = panel.querySelector('#' + pair[0]);
      if (el && SA.charts[pair[1]]) {
        try { SA.charts[pair[1]].render(el); } catch (e) { console.error('Chart', pair[1], e); }
      }
    });
  }

  function resizeAllPlots() {
    Object.keys(SA.plots).forEach(function (k) {
      const el = SA.plots[k];
      if (el && window.Plotly) { try { Plotly.Plots.resize(el); } catch (e) {} }
    });
  }

  function setActiveStep(panel, k) {
    const steps = panel.querySelectorAll('.step');
    steps.forEach(function (s, j) { s.classList.toggle('active', j === k); });
    const dots = panel.querySelectorAll('.step-dots span');
    dots.forEach(function (d, j) { d.classList.toggle('on', j === k); });
    const count = panel.querySelector('.step-count');
    if (count) count.textContent = 'Paso ' + (k + 1) + ' / ' + steps.length;
  }

  function boot() {
    if (!window.SA_DATA) { console.error('No se cargó dataset.js'); return; }
    const panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
    buildNav(panels);

    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    if (isMobile || !window.gsap || !window.ScrollTrigger) setupFallback(panels);
    else setupHorizontal(panels);

    let t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        const nowMobile = window.matchMedia('(max-width: 820px)').matches;
        if (nowMobile !== isMobile) location.reload();
        else resizeAllPlots();
      }, 250);
    });
  }

  /* ---------- Scrollytelling horizontal (desktop) ---------- */
  function setupHorizontal(panels) {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const track = document.getElementById('track');
    const xOf = function (i) { return -i * window.innerWidth; };

    // Renderiza todos los gráficos primero (los pasos necesitan datos listos)
    panels.forEach(renderPanelCharts);

    const MARKS = [];          // { t, apply } cambios de paso, ordenados por tiempo
    const labelTime = [];      // tiempo de llegada de cada panel
    let lastMark = -1;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#scroll-container', start: 'top top', pin: true, scrub: 1,
        anticipatePin: 1, invalidateOnRefresh: true,
        end: function () { return '+=' + Math.max(1, tl.duration() * PX_PER_UNIT); },
        onUpdate: function (self) { onUpdate(self); }
      }
    });

    // Panel 0 (portada) ya está en x=0
    labelTime[0] = 0;

    function moveTo(i) { tl.to(track, { x: function () { return xOf(i); }, duration: 1 }); labelTime[i] = tl.duration(); }

    function addStory(panelIndex) {
      const panel = panels[panelIndex];
      const storyId = panel.getAttribute('data-story');
      const nSteps = parseInt(panel.getAttribute('data-steps'), 10) || 1;
      const el = document.getElementById(storyId);
      const key = (CHART_RENDERERS.find(function (p) { return p[0] === storyId; }) || [])[1];
      for (var k = 0; k < nSteps; k++) {
        (function (kk) {
          MARKS.push({
            t: tl.duration(),
            apply: function () {
              setActiveStep(panel, kk);
              if (key && SA.charts[key] && SA.charts[key].step) {
                try { SA.charts[key].step(el, kk); } catch (e) { console.error('step', key, e); }
              }
            }
          });
        })(k);
        tl.to({}, { duration: k === 0 ? 0.7 : 1.1 }); // "dwell": tiempo de lectura de cada paso
      }
    }

    // Secuencia narrativa
    moveTo(1); moveTo(2); moveTo(3);          // contexto, objetivos, KPIs
    moveTo(4); addStory(4);                    // Hallazgo 1
    moveTo(5); addStory(5);                    // Hallazgo 2
    moveTo(6); addStory(6);                    // Hallazgo 3
    moveTo(7); addStory(7);                    // Hallazgo 4
    moveTo(8); moveTo(9); moveTo(10);          // conclusiones, recomendaciones, créditos

    // Reveal suave del contenido de cada panel al llegar
    panels.forEach(function (panel, i) {
      const items = panel.querySelectorAll('.reveal');
      if (items.length && labelTime[i] != null) {
        tl.from(items, { opacity: 0, y: 26, stagger: 0.08, duration: 0.5 }, Math.max(0, labelTime[i]));
      }
    });

    const D = tl.duration();

    function onUpdate(self) {
      document.getElementById('progress').style.width = (self.progress * 100) + '%';
      const curT = self.progress * D;
      // Panel activo (para los dots de navegación)
      var pi = 0;
      for (var i = 0; i < labelTime.length; i++) { if (labelTime[i] != null && labelTime[i] <= curT + 0.001) pi = i; }
      setActiveDot(pi, panels.length);
      // Dispara el conteo de KPIs al llegar al panel de cifras
      if (pi >= 3 && SA.charts.kpis && SA.charts.kpis.animate) {
        SA.charts.kpis.animate(document.getElementById('kpi-grid'));
      }
      // Paso activo (transforma el gráfico)
      var idx = -1;
      for (var m = 0; m < MARKS.length; m++) { if (MARKS[m].t <= curT + 0.001) idx = m; }
      var eff = Math.max(0, idx);
      if (eff !== lastMark) { lastMark = eff; MARKS[eff].apply(); }
    }

    // Navegación por índice de panel
    window.__goTo = function (i) {
      const st = tl.scrollTrigger;
      const y = st.start + (labelTime[i] / D) * (st.end - st.start);
      gsap.to(window, { duration: 0.9, ease: 'power2.inOut', scrollTo: { y: y, autoKill: true } });
    };

    ScrollTrigger.addEventListener('refresh', resizeAllPlots);
    ScrollTrigger.refresh();
    if (MARKS.length) MARKS[0].apply();
  }

  /* ---------- Fallback vertical (móvil / sin GSAP) ---------- */
  function setupFallback(panels) {
    panels.forEach(function (panel) {
      renderPanelCharts(panel);
      // Aplica el último paso (estado final) de cada hallazgo
      const storyId = panel.getAttribute('data-story');
      if (storyId) {
        const key = (CHART_RENDERERS.find(function (p) { return p[0] === storyId; }) || [])[1];
        const n = parseInt(panel.getAttribute('data-steps'), 10) || 1;
        const el = document.getElementById(storyId);
        if (key && SA.charts[key] && SA.charts[key].step) {
          try { SA.charts[key].step(el, n - 1); } catch (e) {}
        }
      }
    });
    window.__goTo = function (i) { if (panels[i]) panels[i].scrollIntoView({ behavior: 'smooth' }); };
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setActiveDot(panels.indexOf(e.target), panels.length); });
      }, { threshold: 0.5 });
      panels.forEach(function (p) { obs.observe(p); });
    }
  }

  /* ---------- Navegación: dots, flechas, progreso ---------- */
  let current = 0;
  function buildNav(panels) {
    const dots = document.getElementById('nav-dots');
    dots.innerHTML = panels.map(function (p, i) {
      const title = p.getAttribute('data-title') || ('Sección ' + (i + 1));
      return '<button data-i="' + i + '" aria-label="' + title + '"><span class="tip">' + title + '</span></button>';
    }).join('');
    dots.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { window.__goTo(parseInt(b.dataset.i, 10)); });
    });
    document.getElementById('nav-prev').addEventListener('click', function () { window.__goTo(Math.max(0, current - 1)); });
    document.getElementById('nav-next').addEventListener('click', function () { window.__goTo(Math.min(panels.length - 1, current + 1)); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') window.__goTo(Math.min(panels.length - 1, current + 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') window.__goTo(Math.max(0, current - 1));
    });
    setActiveDot(0, panels.length);
  }

  function setActiveDot(i, n) {
    current = i;
    document.querySelectorAll('#nav-dots button').forEach(function (b, j) { b.classList.toggle('active', j === i); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
