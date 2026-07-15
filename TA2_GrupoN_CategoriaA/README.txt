SafeAnalytics EC — Radiografia de la violencia homicida en Ecuador
Trabajo Autonomo N2 · IS-604 Visualizacion de Datos · ULEAM · 2026-1
Categoria A — Web interactiva con scroll horizontal + Storytelling

DESCRIPCION
-----------
Pagina web de una sola vista (index.html) con 11 paneles a pantalla completa que
avanzan con SCROLL HORIZONTAL. Cada panel es una seccion del relato de datos sobre
3.485 homicidios en Ecuador (enero-mayo 2026). Los graficos se animan al entrar en
pantalla y dos de ellos cambian dinamicamente con un dropdown.

COMO EJECUTAR
-------------
Opcion A (simple): hacer doble clic en index.html y abrirlo en Chrome/Edge/Firefox.
   Requiere internet para cargar Plotly y GSAP desde CDN.
Opcion B (servidor local, recomendado):
   python -m http.server 8000    (o)    npx serve .
   luego abrir http://localhost:8000
Los datos van embebidos en data/dataset.js, por lo que NO se necesita servidor.

NAVEGACION
----------
Rueda del raton / trackpad, los puntos de la derecha, las flechas < > o las teclas
de direccion izquierda/derecha.

GRAFICOS (Categoria A)
----------------------
- Hallazgo 1 (Donde):  Treemap provincia->canton (drill-down + hover)
- Hallazgo 2 (Como):   Sankey muerte->arma->lugar->hora (hover)
- Hallazgo 3 (Cuando): Heatmap dia x franja + DROPDOWN de provincia (dinamico)
- Hallazgo 4 (Riesgo): Bubble tipo Gapminder + DROPDOWN de metrica (dinamico)
- KPIs animados (contadores con GSAP)
Cumple: scroll horizontal, animacion scroll-triggered y 2 filtros dropdown.

DATOS
-----
Fuente: SafeAnalytics EC — Dataset de homicidios (modelo estrella).
3.485 registros · 23 provincias · 138 cantones · periodo enero-mayo 2026.
Archivos: data/dataset.json (formato requerido) y data/dataset.js (embebido).

HERRAMIENTAS Y LIBRERIAS
------------------------
- Plotly.js 2.35.2 (CDN) — graficos avanzados interactivos.
- GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin (CDN) — scroll horizontal y animacion.
- HTML5, CSS3, JavaScript ES6 — codigo propio.
Las librerias se cargan por CDN; la integracion, narrativa y logica son propias del grupo.

CREDITOS
--------
Carrera de Ingenieria de Software — ULEAM.
IS-604 Visualizacion de Datos · 2026-1.
Docente: Mgs. Anthony Christopher Legarda Albino.
Grupo N — (reemplazar con los nombres de los integrantes).

NOTA: reemplazar "GrupoN" por el numero de grupo en la carpeta y el .zip
(TA2_GrupoN_CategoriaA.zip) y completar los integrantes en index.html y en
TA2_GrupoN_index.txt.
