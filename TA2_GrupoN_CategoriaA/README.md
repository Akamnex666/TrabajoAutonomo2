# SafeAnalytics EC — Radiografía de la violencia homicida en Ecuador

**Trabajo Autónomo N.º 2 · IS-604 Visualización de Datos · ULEAM · Período 2026-1**
**Categoría A — Web interactiva con scroll horizontal + Storytelling**

Experiencia visual interactiva y narrada que transforma el análisis del TA-1 sobre
**3.485 homicidios en Ecuador (enero–mayo 2026)** en una historia de datos con scroll
horizontal, gráficos avanzados animados y filtros dinámicos.

---

## 1. Descripción del proyecto

Una sola página web (`index.html`) organizada como **11 paneles a pantalla completa** que
avanzan con **scroll horizontal**. Cada panel es una sección del relato: portada → contexto →
objetivos → KPIs → 4 hallazgos → conclusiones → recomendaciones → créditos.

Cada hallazgo se cuenta con **scrollytelling guiado**: el gráfico permanece fijo mientras el
scroll avanza por **pasos narrativos** que lo transforman (zoom, resaltados, cambio de eje,
anotaciones), al estilo *The Pudding / NYT*. Además, dos gráficos incluyen un **dropdown** para
que el usuario explore libremente.

**Pregunta de negocio:** ¿Qué patrones de concentración territorial, modus operandi y perfil de
víctima permiten priorizar la intervención policial y anticipar el riesgo por provincia?

---

## 2. Cómo ejecutar

El proyecto es 100 % HTML/CSS/JS del lado del cliente. Los datos van **embebidos** en
`data/dataset.js` (variable global `SA_DATA`), por lo que **no requiere servidor**:

### Opción A — Abrir directamente (más simple)
Haz doble clic en **`index.html`** (o arrástralo a Chrome / Edge / Firefox). Requiere conexión a
internet la primera vez para cargar las librerías desde CDN (Plotly y GSAP).

### Opción B — Servidor local (recomendado para desarrollo)
```bash
# con Python
python -m http.server 8000
# o con Node
npx serve .
```
Luego abre `http://localhost:8000`.

> **Navegación:** rueda del ratón / trackpad para el scroll horizontal, los **puntos** de la
> derecha, las **flechas** ‹ › o las **teclas** ← →.

---

## 3. Estructura de carpetas

```
TA2_GrupoN_CategoriaA/
├── index.html                     ← página principal con scroll horizontal
├── README.md
├── README.txt
├── TA2_GrupoN_index.txt           ← índice del video (plantilla E3)
├── assets/
│   ├── css/
│   │   └── styles.css             ← estilos, paleta y layout del scroll
│   ├── js/
│   │   ├── main.js                ← lógica del scroll horizontal y navegación (GSAP)
│   │   └── charts/
│   │       ├── theme.js           ← paleta compartida y defaults de Plotly
│   │       ├── kpis.js            ← KPIs animados (contadores)
│   │       ├── hallazgo1_treemap.js
│   │       ├── hallazgo2_sankey.js
│   │       ├── hallazgo3_heatmap.js
│   │       └── hallazgo4_bubble.js
│   └── img/
└── data/
    ├── dataset.json               ← dataset agregado (formato requerido)
    └── dataset.js                 ← mismo dataset embebido como variable global
```

---

## 4. Gráficos y cumplimiento de requisitos (Categoría A)

| Sección | Gráfico avanzado | Pasos guiados (scrollytelling) | Interactividad libre |
|---|---|---|---|
| Hallazgo 1 · ¿Dónde? | **Treemap** provincia→cantón ★ | país → resalta Guayas → zoom a Guayaquil | drill-down al clic + hover |
| Hallazgo 2 · ¿Cómo? | **Sankey** (muerte→arma→lugar→hora) | todo → arma de fuego → público → noche | hover con volúmenes |
| Hallazgo 3 · ¿Cuándo? | **Heatmap** día × franja | país → resalta la noche → filtra Guayas | **dropdown de provincia** + hover |
| Hallazgo 4 · Riesgo | **Bubble tipo Gapminder** ★ | letalidad → resalta Guayas → variación mensual | **dropdown de métrica** + hover |
| Panel de cifras | **KPI scorecard** animado | contadores que cuentan al llegar (GSAP) | — |

Requisitos específicos de la Categoría A cubiertos:
- ✅ **Scroll horizontal** (un panel por sección narrativa).
- ✅ **Animación al entrar en el viewport** (scroll-triggered con GSAP ScrollTrigger).
- ✅ **≥ 1 filtro / dropdown** que cambia la vista → aquí hay **2** (provincia y métrica).
- ✅ ≥ 3 gráficos avanzados · ≥ 3 con animación/interactividad · KPIs animados.

---

## 5. Estructura narrativa (Storytelling)

1. Portada · 2. Introducción y contexto · 3. Objetivos (3 medibles) · 4. KPIs animados ·
5. Hallazgo 1 (¿Dónde?) · 6. Hallazgo 2 (¿Cómo?) · 7. Hallazgo 3 (¿Cuándo?) ·
8. Hallazgo 4 (Riesgo) · 9. Conclusiones · 10. Recomendaciones · 11. Créditos.

---

## 6. Datos

- **Fuente:** <a href="https://www.datosabiertos.gob.ec/group/administracion-publica">Datos Abiertos del Ecuador — Administración Pública</a> (modelo estrella, `SafeAnalytics_EC_datos.xlsx`).
- **Registros:** 3.485 homicidios · 23 provincias · 138 cantones.
- **Periodo:** enero–mayo 2026.
- El `dataset.json` fue generado a partir del modelo estrella (tablas `fact_homicidios`,
  `dim_tiempo`, `dim_geografia`, `dim_delito`, `dim_victima`, `riesgo_territorial`,
  `indicadores_provincia`, `correlacion_provincias`), pre-agregando cada visualización y
  conservando una tabla de hechos reducida (`slim`) para los filtros dinámicos.

---

## 7. Herramientas y librerías

- **Plotly.js 2.35.2** (CDN) — gráficos avanzados interactivos (treemap, sankey, heatmap, bubble).
- **GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin** (CDN) — scroll horizontal, navegación y animación.
- **HTML5 · CSS3 · JavaScript (ES6)** — estructura, estilos y lógica propia.
- **Identidad visual** inspirada en el sitio de *GTA VI*: neón Miami (degradado rosa→naranja→
  amarillo), tipografía pesada en mayúsculas, fondos cinematográficos oscuros con glow y grano
  de película. Aplicada de forma consistente en todos los gráficos y componentes.

> **Recursos externos declarados:** las librerías Plotly.js y GSAP se cargan vía CDN. Toda la
> integración, la narrativa, el layout de scroll y la lógica de los gráficos son de autoría propia
> del grupo. No se utilizaron plantillas de terceros.

---

## 8. Créditos

- **Carrera:** Ingeniería de Software — Universidad Laica Eloy Alfaro de Manabí (ULEAM).
- **Asignatura:** IS-604 Visualización de Datos · 2026-1.
- **Docente:** Mgs. Anthony Christopher Legarda Albiño.
- **Grupo N** — *(reemplazar con los nombres de los integrantes)*.

---

> ℹ️ Antes de entregar: reemplaza `GrupoN` por tu número de grupo en el nombre de la carpeta y del
> `.zip` (`TA2_GrupoN_CategoriaA.zip`), y completa los nombres de los integrantes en `index.html`
> (panel de créditos) y en `TA2_GrupoN_index.txt`.
