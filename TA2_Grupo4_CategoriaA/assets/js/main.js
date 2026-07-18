/* ============================================================
   main.js — Sin solapamiento: 100vh + fade in/out + pin hallazgos
   Lenis ↔ GSAP · timeline de pasos · créditos
   ============================================================ */
(function () {
  'use strict';

  var SA = window.SA;
  var lenisInstance = null;

  var CHART_RENDERERS = [
    ['kpi-grid',      'kpis'],
    ['chart-treemap', 'treemap'],
    ['chart-sankey',  'sankey'],
    ['chart-heatmap', 'heatmap'],
    ['chart-bubble',  'bubble']
  ];

  function renderPanelCharts(panel) {
    CHART_RENDERERS.forEach(function (pair) {
      var el = panel.querySelector('#' + pair[0]);
      if (el && SA.charts[pair[1]]) {
        try { SA.charts[pair[1]].render(el); } catch (e) { console.error('Chart', pair[1], e); }
      }
    });
  }

  function resizeAllPlots() {
    Object.keys(SA.plots).forEach(function (k) {
      var el = SA.plots[k];
      if (el && window.Plotly) { try { Plotly.Plots.resize(el); } catch (e) {} }
    });
  }

  function chartKeyForStory(storyId) {
    var found = CHART_RENDERERS.find(function (p) { return p[0] === storyId; });
    return found ? found[1] : null;
  }

  function setActiveStep(panel, k) {
    var steps = panel.querySelectorAll('.step');
    steps.forEach(function (s, j) { s.classList.toggle('active', j === k); });
    var dots = panel.querySelectorAll('.step-dots span');
    dots.forEach(function (d, j) { d.classList.toggle('on', j === k); });
    var count = panel.querySelector('.step-count');
    if (count) count.textContent = 'Paso ' + (k + 1) + ' / ' + steps.length;
  }

  function fireChartStep(panel, storyId, stepIdx) {
    var key = chartKeyForStory(storyId);
    var el = document.getElementById(storyId);
    if (key && el && SA.charts[key] && SA.charts[key].step) {
      try { SA.charts[key].step(el, stepIdx); } catch (e) { console.error('step', key, e); }
    }
  }

  /* ── Lenis + GSAP ── */
  function setupLenis() {
    if (typeof Lenis === 'undefined') return null;

    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 0.9,
      autoRaf: false
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    lenisInstance = lenis;
    return lenis;
  }

  function setupProgress() {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        var bar = document.getElementById('progress');
        if (bar) bar.style.width = (self.progress * 100) + '%';
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     1) FADE IN / FADE OUT por panel (sin amontonar textos)
     El bloque completo aparece al centro y desaparece al salir.
     ══════════════════════════════════════════════════════════ */
  function setupPanelFades(panels) {
    panels.forEach(function (panel, idx) {
      if (panel.classList.contains('story')) return; /* hallazgos: pin aparte */

      var inner = panel.querySelector('.panel-inner');
      var anims = panel.querySelectorAll('.anim');
      var kpis = panel.querySelectorAll('.kpi-card');
      var charts = panel.querySelectorAll('.chart-card');

      if (!inner) return;

      /* ── Portada ── */
      if (idx === 0) {
        gsap.set(inner, { autoAlpha: 1, y: 0 });
        gsap.fromTo(anims,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 0.1,
            onComplete: function () {
              anims.forEach(function (el) { el.classList.add('revealed'); });
            }
          }
        );
        gsap.to(inner, {
          autoAlpha: 0,
          y: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'bottom 55%',
            end: 'bottom 10%',
            scrub: true,
            invalidateOnRefresh: true
          }
        });
        return;
      }

      /* ── Estado inicial oculto ── */
      gsap.set(inner, { autoAlpha: 0, y: 60 });
      gsap.set(anims, { autoAlpha: 0, y: 40 });
      if (kpis.length) gsap.set(kpis, { autoAlpha: 0, y: 36 });
      if (charts.length) gsap.set(charts, { autoAlpha: 0, y: 50, rotateX: -10 });

      /* ── Timeline scrub: entra → hold → sale ── */
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: panel,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      tl.to(inner, { autoAlpha: 1, y: 0, duration: 0.25 }, 0);
      tl.to(anims, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.03 }, 0.02);
      if (kpis.length) tl.to(kpis, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.04 }, 0.05);
      if (charts.length) {
        tl.to(charts, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.28 }, 0.06);
      }

      tl.to({}, { duration: 0.4 });

      if (idx < panels.length - 1) {
        tl.to(inner, { autoAlpha: 0, y: -50, duration: 0.35 }, 0.65);
      }

      /* ── Reveal class + KPI animate ── */
      ScrollTrigger.create({
        trigger: panel,
        start: 'top 65%',
        once: true,
        onEnter: function () {
          anims.forEach(function (el) { el.classList.add('revealed'); });
          charts.forEach(function (c) {
            c.classList.add('is-revealed');
            resizeAllPlots();
          });
          if (idx === 1 && SA.charts.kpis && SA.charts.kpis.animate) {
            SA.charts.kpis.animate(document.getElementById('kpi-grid'));
          }
        }
      });

      /* ────────────────────────────────────────────────────────
         SAFETY NET: paneles DESPUÉS de un story pinado
         El pin-spacer desplaza las posiciones y el scrub puede
         nunca alcanzar su rango → forzar autoAlpha + limpiar
         transform inline que GSAP ya fijó en 0.
         ──────────────────────────────────────────────────────── */
      var afterStory = false;
      for (var j = 0; j < idx; j++) {
        if (panels[j].classList.contains('story')) { afterStory = true; break; }
      }
      if (afterStory) {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 92%',
          once: true,
          invalidateOnRefresh: true,
          onEnter: function () {
            gsap.set(inner, { autoAlpha: 1, y: 0, clearProps: 'transform' });
            gsap.set(anims, { autoAlpha: 1, y: 0, clearProps: 'transform' });
            if (kpis.length) gsap.set(kpis, { autoAlpha: 1, y: 0, clearProps: 'transform' });
            if (charts.length) {
              gsap.set(charts, { autoAlpha: 1, y: 0, rotateX: 0, clearProps: 'transform' });
              charts.forEach(function (c) { c.classList.add('is-revealed'); });
              resizeAllPlots();
            }
            anims.forEach(function (el) { el.classList.add('revealed'); });
            if (idx === 1 && SA.charts.kpis && SA.charts.kpis.animate) {
              SA.charts.kpis.animate(document.getElementById('kpi-grid'));
            }
          }
        });
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     2) HALLAZGOS — pin:true + timeline de pasos (1 → 2 → 3)
     ══════════════════════════════════════════════════════════ */
  function setupStoryPanels(panels) {
    var isMobile = window.matchMedia('(max-width: 820px)').matches;

    panels.forEach(function (panel) {
      if (!panel.classList.contains('story')) return;

      var storyId = panel.getAttribute('data-story');
      var nSteps = parseInt(panel.getAttribute('data-steps'), 10) || 1;
      var steps = panel.querySelectorAll('.step');
      var fill = panel.querySelector('.step-track-fill');
      var inner = panel.querySelector('.panel-inner');
      var charts = panel.querySelectorAll('.chart-card');
      var headerAnims = panel.querySelectorAll('.sec-index.anim, .controls.anim');

      if (!steps.length) return;

      /* Estado inicial pasos */
      steps.forEach(function (s, j) {
        gsap.set(s, {
          autoAlpha: j === 0 ? 1 : 0,
          y: j === 0 ? 0 : 40,
          visibility: j === 0 ? 'visible' : 'hidden'
        });
      });
      setActiveStep(panel, 0);
      if (fill) gsap.set(fill, { width: (nSteps > 1 ? 0 : 100) + '%' });
      fireChartStep(panel, storyId, 0);

      if (charts.length) gsap.set(charts, { autoAlpha: 0, y: 50, rotateX: -10 });
      if (headerAnims.length) gsap.set(headerAnims, { autoAlpha: 0, y: 24 });
      if (inner) gsap.set(inner, { autoAlpha: 1 });

      if (isMobile) {
        steps.forEach(function (s) { gsap.set(s, { clearProps: 'all' }); });
        gsap.set(charts, { clearProps: 'all' });
        gsap.set(headerAnims, { clearProps: 'all' });
        fireChartStep(panel, storyId, nSteps - 1);
        return;
      }

      var pinEnd = Math.max(1800, nSteps * 900);

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: panel,
          pin: true,
          scrub: true,
          start: 'top top',
          end: '+=' + pinEnd,
          anticipatePin: 1,
          pinType: 'transform', /* compatible con Lenis */
          invalidateOnRefresh: true,
          onEnter: function () { resizeAllPlots(); },
          onRefresh: function () { resizeAllPlots(); }
        }
      });

      /* Entrada del bloque + gráfico */
      if (headerAnims.length) {
        tl.to(headerAnims, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05 }, 0);
      }
      if (charts.length) {
        tl.to(charts, {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.45,
          onComplete: function () {
            charts.forEach(function (c) { c.classList.add('is-revealed'); });
            resizeAllPlots();
          }
        }, 0.05);
      }

      /* Hold paso 1 legible */
      tl.to({}, { duration: 0.55 });

      /* Secuencia: paso N desaparece → paso N+1 aparece */
      for (var k = 1; k < nSteps; k++) {
        (function (stepIdx, prevIdx) {
          var label = 'paso-' + stepIdx;
          tl.addLabel(label);

          tl.to(steps[prevIdx], {
            autoAlpha: 0,
            y: -36,
            visibility: 'hidden',
            duration: 0.35
          }, label);

          tl.fromTo(steps[stepIdx],
            { autoAlpha: 0, y: 44, visibility: 'hidden' },
            { autoAlpha: 1, y: 0, visibility: 'visible', duration: 0.4 },
            label + '+=0.2'
          );

          if (fill && nSteps > 1) {
            tl.to(fill, {
              width: ((stepIdx / (nSteps - 1)) * 100) + '%',
              duration: 0.45
            }, label);
          }

          tl.call(function () {
            setActiveStep(panel, stepIdx);
            fireChartStep(panel, storyId, stepIdx);
            resizeAllPlots();
          }, null, label + '+=0.35');

          /* Tiempo de lectura del paso actual */
          tl.to({}, { duration: 0.65 });
        })(k, k - 1);
      }

      /* Hold final del último paso → suelta el pin */
      tl.to({}, { duration: 0.5 });
    });
  }

  function setupParallax() {
    document.querySelectorAll('.parallax-orb').forEach(function (orb) {
      gsap.to(orb, {
        yPercent: orb.classList.contains('orb-portada-2') ? -20 : 30,
        ease: 'none',
        scrollTrigger: {
          trigger: orb.closest('.panel') || document.body,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  function setupFallback(panels) {
    panels.forEach(function (panel) {
      renderPanelCharts(panel);
      panel.querySelectorAll('.anim, .chart-card, .kpi-card, .step, .panel-inner').forEach(function (el) {
        el.classList.add('revealed', 'is-revealed', 'active');
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'none';
      });
      var storyId = panel.getAttribute('data-story');
      if (storyId) {
        var n = parseInt(panel.getAttribute('data-steps'), 10) || 1;
        fireChartStep(panel, storyId, n - 1);
      }
    });
  }

  function refreshLayout() {
    if (window.ScrollTrigger) {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }
    resizeAllPlots();
    if (lenisInstance && lenisInstance.resize) lenisInstance.resize();
  }

  function boot() {
    if (!window.SA_DATA) {
      console.error('No se cargo dataset.js');
      return;
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
    panels.forEach(renderPanelCharts);

    if (!window.gsap || !window.ScrollTrigger) {
      setupFallback(panels);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.set('.panel-inner, .chart-card', { force3D: true, transformPerspective: 1000 });

    setupLenis();
    setupProgress();
    setupPanelFades(panels);
    setupStoryPanels(panels);
    setupParallax();

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(refreshLayout, 200);
    });

    requestAnimationFrame(refreshLayout);
    setTimeout(refreshLayout, 400);
    setTimeout(refreshLayout, 1000);
    window.addEventListener('load', function () {
      refreshLayout();
      setTimeout(refreshLayout, 250);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
