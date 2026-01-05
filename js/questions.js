/* =========================
   Wiskunde Quest – questions.js
   Vragenbank (2B) – uitgebreid pakket

   Focus: Vierhoek • Driehoek • Temperatuur • Cirkel • Schaal • Volume
   Richtlijn: ~40+ vraagfabrieken per thema, met veel variatie.

   Opmerking:
   - Alle vragen zijn factories: () => qMc(...) of () => qInput(...)
   - Visuele ondersteuning is bewust “simpel maar duidelijk”.
     Jij kan later SVG’s vervangen door eigen assets.
========================= */

const PI_314 = 3.14;

/* =====================================================
   Kleine random helpers
===================================================== */
const rInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffleLocal = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const round2 = (n) => Math.round(n * 100) / 100;

/* =====================================================
   Mini SVG helpers (inline)
===================================================== */
function _svgBox(inner, w = 520, h = 260, svgClass = "") {
  const cls = svgClass ? ` class="${svgClass}"` : "";
  return `
  <div style="width:100%;display:flex;justify-content:center">
    <svg${cls} viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" width="100%" xmlns="http://www.w3.org/2000/svg"
         style="max-width:640px">
      <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18"
            fill="#ffffff" stroke="#e5e7eb" stroke-width="2.5"/>
      ${inner}
    </svg>
  </div>`;
}

/* ---------- Vierhoek ---------- */
function svgQuad(kind = "rechthoek", labels = null) {
  const shapes = {
    vierkant: "M170 60 L350 60 L350 240 L170 240 Z",
    rechthoek: "M140 80 L380 80 L380 220 L140 220 Z",
    parallellogram: "M170 90 L400 90 L350 230 L120 230 Z",
    trapezium: "M160 100 L380 100 L420 230 L120 230 Z",
    ruit: "M260 55 L390 150 L260 245 L130 150 Z",
    vlieger: "M260 50 L360 150 L260 245 L160 150 Z",
  };
  const d = shapes[kind] || shapes.rechthoek;

  const labelSvg = labels ? `
    <g font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">
      ${labels[0] ? `<text x="260" y="78" text-anchor="middle">${labels[0]}</text>` : ""}
      ${labels[1] ? `<text x="392" y="165" text-anchor="middle">${labels[1]}</text>` : ""}
      ${labels[2] ? `<text x="260" y="238" text-anchor="middle">${labels[2]}</text>` : ""}
      ${labels[3] ? `<text x="128" y="165" text-anchor="middle">${labels[3]}</text>` : ""}
    </g>` : "";

  // Let op: toon hier bewust géén naam van het type vierhoek (bv. 'trapezium'),
  // anders geef je bij herken-vragen het antwoord al weg.
  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">vierhoek</text>
    <path d="${d}" fill="rgba(37,99,235,.08)" stroke="#2563eb" stroke-width="8" stroke-linejoin="miter" stroke-linecap="butt"/>
    ${labelSvg}
  `, 520, 280, "geoQuad");
}

/* ---------- Vierhoeken op rooster (tellen) ---------- */
function svgGridRect({
  gridCols = 16,
  gridRows = 9,
  rectW = 5,
  rectH = 3,
  rectX = 2,
  rectY = 2,
  rot45 = false,
  title = "rechthoek"
} = {}) {
  // Rooster past in de standaard vraagbox (520×280)
  const W = 520, H = 280;
  const pad = 22;
  const top = 54;
  const areaW = W - pad * 2;
  const areaH = H - top - pad;
  const cell = Math.floor(Math.min(areaW / gridCols, areaH / gridRows));
  const gridW = cell * gridCols;
  const gridH = cell * gridRows;
  const gx = Math.floor((W - gridW) / 2);
  const gy = top + Math.floor((areaH - gridH) / 2);

  const rx = gx + rectX * cell;
  const ry = gy + rectY * cell;
  const rw = rectW * cell;
  const rh = rectH * cell;

  // grid lines
  let lines = "";
  for (let c = 0; c <= gridCols; c++) {
    const x = gx + c * cell;
    lines += `<line x1="${x}" y1="${gy}" x2="${x}" y2="${gy + gridH}" stroke="#94a3b8" stroke-width="1" />`;
  }
  for (let r = 0; r <= gridRows; r++) {
    const y = gy + r * cell;
    lines += `<line x1="${gx}" y1="${y}" x2="${gx + gridW}" y2="${y}" stroke="#94a3b8" stroke-width="1" />`;
  }

  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">${title}</text>
    <rect x="${gx}" y="${gy}" width="${gridW}" height="${gridH}" rx="0" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    ${lines}
    ${rot45 ? (() => {
      const k = rectW, m = rectH;
      const x0 = rectX, y0 = rectY;
      const p0 = {x: gx + x0 * cell, y: gy + y0 * cell};
      const p1 = {x: gx + (x0 + k) * cell, y: gy + (y0 + k) * cell};
      const p2 = {x: gx + (x0 + k + m) * cell, y: gy + (y0 + k - m) * cell};
      const p3 = {x: gx + (x0 + m) * cell, y: gy + (y0 - m) * cell};
      const pts = `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
      return `<polygon points="${pts}" fill="rgba(15,23,42,.06)" stroke="#0f172a" stroke-width="6" stroke-linejoin="miter" stroke-linecap="butt"/>`;
    })() : `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="0" fill="rgba(15,23,42,.06)" stroke="#0f172a" stroke-width="6" stroke-linejoin="miter" stroke-linecap="butt"/>`}

  `, 520, 280, "geoGrid");
}

/* ---------- Driehoek ---------- */
function svgTriangle(kind = "generic", labels = null) {
  const base = {
    equilateral: { a: [140, 230], b: [260, 60], c: [380, 230] },
    isosceles: { a: [150, 230], b: [260, 70], c: [370, 230] },
    scalene: { a: [140, 230], b: [310, 85], c: [380, 230] },
    right: { a: [160, 230], b: [160, 90], c: [390, 230] },
    acute: { a: [140, 230], b: [260, 75], c: [410, 230] },
    obtuse: { a: [170, 230], b: [260, 140], c: [420, 230] },
    generic: { a: [150, 230], b: [290, 80], c: [420, 230] },
  };
  const p = base[kind] || base.generic;
  const [ax, ay] = p.a, [bx, by] = p.b, [cx, cy] = p.c;

  const rightMark = kind === "right" ? `
    <path d="M${ax} ${ay} L${ax} ${ay - 34} L${ax + 34} ${ay - 34}" fill="none" stroke="#0f172a" stroke-width="5"/>` : "";

  const labelSvg = labels ? `
    <g font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">
      ${labels[0] ? `<text x="${(ax+bx)/2}" y="${(ay+by)/2 - 10}" text-anchor="middle">${labels[0]}</text>` : ""}
      ${labels[1] ? `<text x="${(bx+cx)/2 + 10}" y="${(by+cy)/2}" text-anchor="middle">${labels[1]}</text>` : ""}
      ${labels[2] ? `<text x="${(cx+ax)/2}" y="${ay + 26}" text-anchor="middle">${labels[2]}</text>` : ""}
    </g>` : "";

  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">driehoek</text>
    <path d="M${ax} ${ay} L${bx} ${by} L${cx} ${cy} Z"
          fill="rgba(37,99,235,.08)" stroke="#2563eb" stroke-width="8" stroke-linejoin="miter" stroke-linecap="butt"/>
    ${rightMark}
    ${labelSvg}
  `, 520, 280);
}

/* ---------- Thermometer ---------- */
function svgThermometerValue(tempC = 0, min = -20, max = 40) {
  const clampLocal = (n, a, b) => Math.max(a, Math.min(b, n));
  const t = clampLocal(tempC, min, max);
  const H = 170;
  const yTop = 46;
  const yBot = yTop + H;
  const frac = (t - min) / (max - min);
  const mercuryH = Math.round(frac * (H - 18));
  const mercuryY = yBot - mercuryH;

  const ticks = [];
  for (let v = min; v <= max; v += 10) {
    const f = (v - min) / (max - min);
    const y = yBot - f * H;
    ticks.push(`
      <line x1="300" y1="${y}" x2="330" y2="${y}" stroke="#0f172a" stroke-width="3"/>
      <text x="292" y="${y + 5}" text-anchor="end"
            font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="900" fill="#0f172a">${v}</text>
    `);
  }

  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">Thermometer</text>
    <g transform="translate(160,0)">
      <rect x="92" y="38" width="52" height="204" rx="26" fill="#ffffff" stroke="#0f172a" stroke-width="4"/>
      <rect x="110" y="52" width="16" height="150" rx="8" fill="#e5e7eb"/>
      <rect x="110" y="${mercuryY}" width="16" height="${mercuryH}" rx="8" fill="#ef4444"/>
      <circle cx="118" cy="220" r="20" fill="#ef4444" stroke="#0f172a" stroke-width="4"/>
      ${ticks.join("\n")}
      <text x="362" y="82" font-family="Inter,system-ui,sans-serif" font-size="22" font-weight="900" fill="#0f172a">°C</text>
    </g>
  `, 520, 280);
}

/* ---------- Lijndiagram temperatuur ---------- */
function svgTempGraph(days, temps) {
  const W = 520, H = 280;
  const padL = 60, padR = 20, padT = 40, padB = 60;
  const x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB;

  const minT = Math.min(...temps, -10);
  const maxT = Math.max(...temps, 10);
  const span = Math.max(10, maxT - minT);
  const yFor = (t) => y1 - ((t - minT) / span) * (y1 - y0);

  const xs = days.map((_, i) => x0 + (i * (x1 - x0)) / (days.length - 1));
  const pts = temps.map((t, i) => [xs[i], yFor(t)]);

  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  const yTicks = [];
  for (let v = Math.floor(minT / 5) * 5; v <= Math.ceil(maxT / 5) * 5; v += 5) {
    const y = yFor(v);
    yTicks.push(`
      <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="rgba(15,23,42,.08)" stroke-width="2"/>
      <text x="${x0 - 8}" y="${y + 5}" text-anchor="end"
            font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="800" fill="#0f172a">${v}</text>
    `);
  }

  const xLabels = days.map((d, i) => `
    <text x="${xs[i]}" y="${H - 26}" text-anchor="middle"
          font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="900" fill="#0f172a">${d}</text>
  `).join("");

  const points = pts.map(([x, y]) => `
    <circle cx="${x}" cy="${y}" r="6" fill="#2563eb"/>
    <circle cx="${x}" cy="${y}" r="10" fill="rgba(37,99,235,.18)"/>
  `).join("");

  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">Lijndiagram</text>
    <g>
      ${yTicks.join("\n")}
      <path d="${path}" fill="none" stroke="#2563eb" stroke-width="6" stroke-linecap="butt" stroke-linejoin="miter"/>
      ${points}
      ${xLabels}
      <text x="${x1}" y="${y0 - 10}" text-anchor="end"
            font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="900" fill="#0f172a">°C</text>
    </g>
  `, 520, 280);
}

/* ---------- Cirkel ---------- */
function svgCircle({ r = null, d = null, show = "r" } = {}) {
  const R = 70;
  const label = r != null ? `r = ${r}` : (d != null ? `d = ${d}` : "");
  const line = show === "d"
    ? `<line x1="140" y1="150" x2="380" y2="150" stroke="#0f172a" stroke-width="5"/>
       <text x="260" y="140" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="900" fill="#0f172a">d</text>`
    : `<line x1="260" y1="150" x2="330" y2="150" stroke="#0f172a" stroke-width="5"/>
       <circle cx="260" cy="150" r="6" fill="#0f172a"/>
       <text x="338" y="156" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="900" fill="#0f172a">r</text>`;

  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">cirkel ${label ? "• " + label : ""}</text>
    <circle cx="260" cy="150" r="${R}" fill="rgba(37,99,235,.08)" stroke="#2563eb" stroke-width="8"/>
    ${line}
  `, 520, 280);
}

/* ---------- Schaal: klein lijnstuk ---------- */
function svgScaleSegment(cmOnDrawing, label = "") {
  const x0 = 120, x1 = 400, y = 160;
  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">Schaal</text>
    <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#2563eb" stroke-width="8" stroke-linecap="butt"/>
    <line x1="${x0}" y1="${y-18}" x2="${x0}" y2="${y+18}" stroke="#0f172a" stroke-width="4"/>
    <line x1="${x1}" y1="${y-18}" x2="${x1}" y2="${y+18}" stroke="#0f172a" stroke-width="4"/>
    <text x="260" y="${y-26}" text-anchor="middle"
          font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">${cmOnDrawing} cm</text>
    ${label ? `<text x="260" y="${y+58}" text-anchor="middle"
          font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="800" fill="#0f172a">${label}</text>` : ""}
  `, 520, 280);
}

/* ---------- Volume visuals ---------- */
function svgCuboid({ l, b, h, unit = "cm" }) {
  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">balk</text>
    <g transform="translate(145,56)">
      <path d="M40 140 L160 90 L300 140 L180 190 Z" fill="rgba(37,99,235,.12)" stroke="#2563eb" stroke-width="6"/>
      <path d="M40 140 L40 40 L180 -10 L180 190" fill="none" stroke="#2563eb" stroke-width="6"/>
      <path d="M180 -10 L300 40 L300 140" fill="none" stroke="#2563eb" stroke-width="6"/>
      <g font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="900" fill="#0f172a">
        <text x="170" y="210" text-anchor="middle">${l}${unit}</text>
        <text x="318" y="120">${b}${unit}</text>
        <text x="18" y="92">${h}${unit}</text>
      </g>
    </g>
  `, 520, 280);
}

function svgCube({ a, unit = "cm" }) {
  return _svgBox(`
    <text x="28" y="38" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">kubus</text>
    <g transform="translate(170,54)">
      <rect x="40" y="40" width="160" height="160" rx="14" fill="rgba(37,99,235,.10)" stroke="#2563eb" stroke-width="6"/>
      <path d="M40 40 L90 10 L250 10 L200 40" fill="none" stroke="#2563eb" stroke-width="6"/>
      <path d="M200 40 L250 10 L250 170 L200 200" fill="none" stroke="#2563eb" stroke-width="6"/>
      <text x="120" y="230" text-anchor="middle"
            font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="900" fill="#0f172a">${a}${unit}</text>
    </g>
  `, 520, 280);
}

/* =====================================================
   Vraag-generatoren
===================================================== */

/* ---------- VIERHOEK: soorten ---------- */
function qVierhoekNaam(kind, opts) {
  const names = ["vierkant", "rechthoek", "parallellogram", "trapezium", "ruit"];
  const correct = kind;
  const options = shuffleLocal([correct, ...shuffleLocal(names.filter(n => n !== correct)).slice(0, (opts ?? 3) - 1)]);
  return qMc(
    "vierhoek",
    "soorten_easy",
    "Welke vierhoek zie je?",
    options,
    correct,
    svgQuad(kind)
  );
}

function qVierhoekEigenschap(prompt, answer, distractors = []) {
  const opts = shuffleLocal([answer, ...distractors]).slice(0, 4);
  return qMc("vierhoek", "soorten_normal", prompt, opts, answer, null);
}

/* ---------- VIERHOEK: omtrek / opp ---------- */
function qVierhoekOmtrekRect(unit = "cm") {
  const L = rInt(4, 18);
  const B = rInt(3, 14);
  const om = 2 * (L + B);
  const labels = [`${L} ${unit}`, "", "", `${B} ${unit}`];
  return qInput(
    "vierhoek",
    unit === "cm" ? "omtrek_easy" : "omtrek_normal",
    `Bereken de omtrek van de rechthoek.`,
    om,
    "number",
    unit,
    svgQuad("rechthoek", labels),
    0.01,
    "Tip: omtrek rechthoek = 2 × (lengte + breedte)."
  );
}

function qVierhoekOmtrekSquare(unit = "cm") {
  const a = rInt(3, 20);
  const om = 4 * a;
  const labels = [`${a} ${unit}`, "", "", ""];
  return qInput(
    "vierhoek",
    unit === "cm" ? "omtrek_easy" : "omtrek_normal",
    `Bereken de omtrek van het vierkant.`,
    om,
    "number",
    unit,
    svgQuad("vierkant", labels),
    0.01,
    "Tip: omtrek vierkant = 4 × zijde."
  );
}

function qVierhoekOppRect(unit = "cm") {
  const L = rInt(4, 20);
  const B = rInt(3, 16);
  const opp = L * B;
  const labels = [`${L} ${unit}`, "", "", `${B} ${unit}`];
  return qInput(
    "vierhoek",
    unit === "cm" ? "oppervlakte_easy" : "oppervlakte_normal",
    "Bereken de oppervlakte van de rechthoek.",
    opp,
    "number",
    unit + "²",
    svgQuad("rechthoek", labels),
    0.01,
    "Tip: oppervlakte rechthoek = lengte × breedte."
  );
}

function qVierhoekOppSquare(unit = "cm") {
  const a = rInt(3, 18);
  const opp = a * a;
  const labels = [`${a} ${unit}`, "", "", ""];
  return qInput(
    "vierhoek",
    unit === "cm" ? "oppervlakte_easy" : "oppervlakte_normal",
    "Bereken de oppervlakte van het vierkant.",
    opp,
    "number",
    unit + "²",
    svgQuad("vierkant", labels),
    0.01,
    "Tip: oppervlakte vierkant = zijde × zijde."
  );
}

/* ---------- VIERHOEK: tellen in een rooster ---------- */
function qVierhoekGridOpp(level = "easy") {
  // elk vakje = 1 cm x 1 cm (dus 1 cm²)
  const gridCols = level === "hard" ? 18 : 16;
  const gridRows = level === "hard" ? 10 : 9;

  // Bij oppervlakte mag de rechthoek soms schuin staan (45°) → halve vakjes
  // Bij oppervlaktevragen: vaak 45° draaien (halve vakjes)
  const rotProb = (level === "easy") ? 0.45 : (level === "normal") ? 0.65 : 0.8;
  let rot45 = Math.random() < rotProb;

  let rectW, rectH, rectX, rectY;
  let opp;
  if (rot45) {
    // Rotatie 45°: rechthoek op diagonalen (k,k) en (m,-m).
    // Oppervlakte in vakjes = |det| = 2*k*m
    const margin = 1; // laat een rand vrij zodat de figuur zeker binnen het raster valt

    let k, m2, xMin, xMax, yMin, yMax;
    let okRot = false;

    for (let t = 0; t < 12; t++) {
      k = (level === "hard") ? rInt(3, 7) : rInt(2, 6);
      m2 = (level === "hard") ? rInt(2, 6) : rInt(2, 5);

      xMin = margin;
      xMax = gridCols - (k + m2) - margin;
      yMin = m2 + margin;
      yMax = gridRows - k - margin;

      if (xMax >= xMin && yMax >= yMin) {
        okRot = true;
        break;
      }
    }

    if (okRot) {
      rectW = k;
      rectH = m2;
      rectX = rInt(xMin, xMax);
      rectY = rInt(yMin, yMax);
      opp = 2 * k * m2;
    } else {
      // Past niet netjes binnen het raster, val terug op een gewone (niet-gedraaide) rechthoek.
      rot45 = false;
    }
  }

  if (!rot45) {
    rectW = level === "easy" ? rInt(2, 7)
      : level === "normal" ? rInt(3, 9)
      : rInt(4, 11);
    rectH = level === "easy" ? rInt(2, 6)
      : level === "normal" ? rInt(3, 7)
      : rInt(4, 8);
    rectX = rInt(1, Math.max(1, gridCols - rectW - 1));
    rectY = rInt(1, Math.max(1, gridRows - rectH - 1));
    opp = rectW * rectH;
  }

  const v = svgGridRect({ gridCols, gridRows, rectW, rectH, rectX, rectY, rot45, title: "rechthoek" });

  return qInput(
    "vierhoek",
    level === "easy" ? "oppervlakte_easy" : level === "normal" ? "oppervlakte_normal" : "oppervlakte_hard",
    "Bereken de oppervlakte van de rechthoek door de vakjes te tellen.",
    opp,
    "number",
    { choices: ["cm", "cm²"], answer: "cm²" },
    v,
    0.01
  );
}

function qVierhoekGridOmtrek(level = "easy") {
  // elk vakje = 1 cm
  const gridCols = level === "hard" ? 18 : 16;
  const gridRows = level === "hard" ? 10 : 9;
  const rectW = level === "easy" ? rInt(2, 8)
    : level === "normal" ? rInt(3, 10)
    : rInt(4, 12);
  const rectH = level === "easy" ? rInt(2, 6)
    : level === "normal" ? rInt(3, 8)
    : rInt(4, 9);
  const rectX = rInt(1, Math.max(1, gridCols - rectW - 1));
  const rectY = rInt(1, Math.max(1, gridRows - rectH - 1));
  const om = 2 * (rectW + rectH);
  const v = svgGridRect({ gridCols, gridRows, rectW, rectH, rectX, rectY, title: "rechthoek" });
  return qInput(
    "vierhoek",
    level === "easy" ? "omtrek_easy" : level === "normal" ? "omtrek_normal" : "omtrek_hard",
    "Bereken de omtrek van de rechthoek door de vakjes (cm) te tellen.",
    om,
    "number",
    { choices: ['cm', 'cm²'], answer: 'cm' },
    v,
    0.01
  );
}

function qVierhoekMixedUnits() {
  // zoals in bundel: 7,5 cm en 30 mm
  const L = rInt(55, 95) / 10; // 5.5 .. 9.5 cm
  const mm = rInt(20, 80);     // 2.0 .. 8.0 cm
  const B = mm / 10;
  const om = 2 * (L + B);
  const labels = [`${L.toString().replace(".", ",")} cm`, "", "", `${mm} mm`];
  return qInput(
    "vierhoek",
    "meten_easy",
    `Een rechthoek heeft lengte ${L.toString().replace(".", ",")} cm en breedte ${mm} mm.\nBereken de omtrek in cm.`,
    round2(om),
    "number",
    "cm",
    svgQuad("rechthoek", labels),
    0.02,
    "Tip: zet alles eerst om naar cm (10 mm = 1 cm)."
  );
}

function qVierhoekConvertMmToCm() {
  const mm = pick([18, 24, 30, 35, 40, 43, 55, 65, 75, 90, 120, 135]);
  const cm = mm / 10;
  return qInput(
    "vierhoek",
    "meten_easy",
    `Zet om: ${mm} mm = ____ cm`,
    cm,
    "number",
    "cm",
    null,
    0.01,
    "Tip: deel door 10."
  );
}

/* ---------- VIERHOEK: tekenmodus (raster) ---------- */
function _mrGetDrawState(boardId) {
  return (window.getDrawBoard && window.getDrawBoard(boardId))
    || (window.MR_DRAW && window.MR_DRAW[boardId])
    || null;
}

function _mrAllLines(S) {
  const a = Array.isArray(S?.lockedLines) ? S.lockedLines : [];
  const b = Array.isArray(S?.lines) ? S.lines : [];
  return a.concat(b);
}

function _mrCheckAxisRect(boardId, wantW, wantH) {
  const S = _mrGetDrawState(boardId);
  if (!S || !Array.isArray(S.lines)) return false;
  if (S.lines.length !== 4) return false;

  // punten verzamelen
  const pts = new Map();
  const addPt = (x, y) => pts.set(`${x},${y}`, { x, y });
  S.lines.forEach(L => {
    addPt(L.x1, L.y1);
    addPt(L.x2, L.y2);
  });
  if (pts.size !== 4) return false;

  const P = Array.from(pts.values());
  const xs = [...new Set(P.map(p => p.x))];
  const ys = [...new Set(P.map(p => p.y))];
  if (xs.length !== 2 || ys.length !== 2) return false;

  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const w = Math.abs(maxX - minX);
  const h = Math.abs(maxY - minY);
  const okDims = (w === wantW && h === wantH) || (w === wantH && h === wantW);
  if (!okDims) return false;

  // alle lijnen moeten horizontaal/verticaal zijn
  for (const L of S.lines) {
    const ax = L.x1 === L.x2;
    const ay = L.y1 === L.y2;
    if (!ax && !ay) return false;
  }

  // verwachte 4 randen
  const key = (a, b) => {
    const A = `${a.x},${a.y}`;
    const B = `${b.x},${b.y}`;
    return A < B ? `${A}|${B}` : `${B}|${A}`;
  };

  const expected = new Set([
    key({ x: minX, y: minY }, { x: maxX, y: minY }),
    key({ x: maxX, y: minY }, { x: maxX, y: maxY }),
    key({ x: maxX, y: maxY }, { x: minX, y: maxY }),
    key({ x: minX, y: maxY }, { x: minX, y: minY }),
  ]);

  const got = new Set(
    S.lines.map(L => key({ x: L.x1, y: L.y1 }, { x: L.x2, y: L.y2 }))
  );

  if (got.size !== 4) return false;
  for (const e of expected) if (!got.has(e)) return false;
  return true;
}

function _mrKey(p) { return `${p.x},${p.y}`; }
function _mrDist(a,b) {
  const dx = (a.x - b.x), dy = (a.y - b.y);
  return Math.sqrt(dx*dx + dy*dy);
}
function _mrDot(ax,ay,bx,by) { return ax*bx + ay*by; }
function _mrCross(ax,ay,bx,by) { return ax*by - ay*bx; }
function _mrAlmost(a,b,t=1e-6) { return Math.abs(a-b) <= t; }

function _mrParseQuad(boardId) {
  const S = _mrGetDrawState(boardId);
  if (!S) return null;
  const lines = _mrAllLines(S);
  if (!Array.isArray(lines) || lines.length !== 4) return null;

  // unieke punten
  const pts = new Map();
  for (const ln of lines) {
    const a={x:ln.x1,y:ln.y1};
    const b={x:ln.x2,y:ln.y2};
    pts.set(_mrKey(a), a);
    pts.set(_mrKey(b), b);
  }
  if (pts.size !== 4) return null;

  // adjacency
  const adj = new Map();
  const addEdge = (ka,kb) => {
    if (!adj.has(ka)) adj.set(ka, []);
    adj.get(ka).push(kb);
  };
  for (const ln of lines) {
    const ka = `${ln.x1},${ln.y1}`;
    const kb = `${ln.x2},${ln.y2}`;
    if (ka === kb) return null;
    addEdge(ka,kb);
    addEdge(kb,ka);
  }
  // elke hoekpunt graad 2
  for (const [k,neigh] of adj.entries()) {
    if (neigh.length !== 2) return null;
  }

  // volg de cyclus
  const keys = Array.from(adj.keys());
  const start = keys[0];
  const n0 = adj.get(start)[0];
  const order=[start];
  let prev=start;
  let cur=n0;
  for (let i=0;i<3;i++) {
    order.push(cur);
    const ns = adj.get(cur);
    const next = ns[0] === prev ? ns[1] : ns[0];
    prev = cur;
    cur = next;
  }
  // moet terugkomen naar start
  if (cur !== start) return null;

  const P = order.map(k => pts.get(k));
  if (P.some(x => !x)) return null;
  return { P, lines };
}

function _mrIsAxisRectFromQuad(quad) {
  const P = quad?.P;
  if (!P || P.length !== 4) return null;
  const xs = new Set(P.map(p=>p.x));
  const ys = new Set(P.map(p=>p.y));
  if (xs.size !== 2 || ys.size !== 2) return null;

  // randen moeten horizontaal/verticaal zijn
  for (let i=0;i<4;i++) {
    const a=P[i], b=P[(i+1)%4];
    const dx=Math.abs(a.x-b.x), dy=Math.abs(a.y-b.y);
    if (!((dx>0 && dy==0) || (dy>0 && dx==0))) return null;
  }

  const xArr=[...xs].sort((a,b)=>a-b);
  const yArr=[...ys].sort((a,b)=>a-b);
  const w = xArr[1]-xArr[0];
  const h = yArr[1]-yArr[0];
  if (w<=0 || h<=0) return null;
  return { w, h, minX:xArr[0], minY:yArr[0], maxX:xArr[1], maxY:yArr[1] };
}

function _mrIsParallelogram(quad) {
  const P = quad?.P;
  if (!P || P.length!==4) return null;
  const v0={x:P[1].x-P[0].x, y:P[1].y-P[0].y};
  const v1={x:P[2].x-P[1].x, y:P[2].y-P[1].y};
  const v2={x:P[3].x-P[2].x, y:P[3].y-P[2].y};
  const v3={x:P[0].x-P[3].x, y:P[0].y-P[3].y};
  const par02 = _mrAlmost(_mrCross(v0.x,v0.y, v2.x,v2.y), 0);
  const par13 = _mrAlmost(_mrCross(v1.x,v1.y, v3.x,v3.y), 0);
  if (!(par02 && par13)) return null;
  return { v0,v1,v2,v3 };
}

function _mrIsTrapeziumExactlyOneParallel(quad) {
  const P = quad?.P;
  if (!P || P.length!==4) return null;
  const v0={x:P[1].x-P[0].x, y:P[1].y-P[0].y};
  const v1={x:P[2].x-P[1].x, y:P[2].y-P[1].y};
  const v2={x:P[3].x-P[2].x, y:P[3].y-P[2].y};
  const v3={x:P[0].x-P[3].x, y:P[0].y-P[3].y};
  const par02 = _mrAlmost(_mrCross(v0.x,v0.y, v2.x,v2.y), 0);
  const par13 = _mrAlmost(_mrCross(v1.x,v1.y, v3.x,v3.y), 0);
  if (par02 === par13) return null; // both true || both false
  return { pair: par02 ? 0 : 1, v0,v1,v2,v3 };
}



// ====== Algemene rechthoek/square checks (ook schuin) ======
function _mrIsRectangle(quad) {
  const P = quad?.P;
  if (!P || P.length !== 4) return null;

  const v0 = { x: P[1].x - P[0].x, y: P[1].y - P[0].y };
  const v1 = { x: P[2].x - P[1].x, y: P[2].y - P[1].y };
  const v2 = { x: P[3].x - P[2].x, y: P[3].y - P[2].y };
  const v3 = { x: P[0].x - P[3].x, y: P[0].y - P[3].y };

  const len0 = v0.x * v0.x + v0.y * v0.y;
  const len1 = v1.x * v1.x + v1.y * v1.y;
  if (len0 === 0 || len1 === 0) return null;

  // Opposites parallel (parallelogram)
  const par02 = _mrAlmost(_mrCross(v0.x, v0.y, v2.x, v2.y), 0);
  const par13 = _mrAlmost(_mrCross(v1.x, v1.y, v3.x, v3.y), 0);
  if (!(par02 && par13)) return null;

  // Right angle
  const right = _mrAlmost(_mrDot(v0.x, v0.y, v1.x, v1.y), 0);
  if (!right) return null;

  return { a: Math.sqrt(len0), b: Math.sqrt(len1), v0, v1 };
}

function _mrCheckRectDims(boardId, wantA, wantB) {
  const q = _mrParseQuad(boardId); if (!q) return false;
  const r = _mrIsRectangle(q); if (!r) return false;
  return (_mrAlmost(r.a, wantA) && _mrAlmost(r.b, wantB)) || (_mrAlmost(r.a, wantB) && _mrAlmost(r.b, wantA));
}

function _mrCheckRectPerimeter(boardId, per) {
  const q = _mrParseQuad(boardId); if (!q) return false;
  const r = _mrIsRectangle(q); if (!r) return false;
  const got = 2 * (r.a + r.b);
  return _mrAlmost(got, per, 1e-6);
}

function _mrCheckRectArea(boardId, area) {
  const q = _mrParseQuad(boardId); if (!q) return false;
  const r = _mrIsRectangle(q); if (!r) return false;
  const got = r.a * r.b;
  return _mrAlmost(got, area, 1e-3);
}

function _mrCheckSquarePerimeter(boardId, per) {
  const q = _mrParseQuad(boardId); if (!q) return false;
  const r = _mrIsRectangle(q); if (!r) return false;
  if (!_mrAlmost(r.a, r.b)) return false;
  return _mrAlmost(4 * r.a, per, 1e-6);
}

function _mrCheckSquareArea(boardId, area) {
  const q = _mrParseQuad(boardId); if (!q) return false;
  const r = _mrIsRectangle(q); if (!r) return false;
  if (!_mrAlmost(r.a, r.b)) return false;
  const got = r.a * r.a;
  return _mrAlmost(got, area, 1e-3);
}

function _mrCheckAxisRectPerimeter(boardId, per) {
  const q=_mrParseQuad(boardId); if(!q) return false;
  const r=_mrIsAxisRectFromQuad(q); if(!r) return false;
  const got = 2*(r.w + r.h);
  return _mrAlmost(got, per);
}
function _mrCheckAxisRectArea(boardId, area) {
  const q=_mrParseQuad(boardId); if(!q) return false;
  const r=_mrIsAxisRectFromQuad(q); if(!r) return false;
  const got = r.w * r.h;
  return _mrAlmost(got, area);
}
function _mrCheckAxisSquarePerimeter(boardId, per) {
  const q=_mrParseQuad(boardId); if(!q) return false;
  const r=_mrIsAxisRectFromQuad(q); if(!r) return false;
  if (r.w !== r.h) return false;
  return _mrAlmost(4*r.w, per);
}
function _mrCheckAxisSquareArea(boardId, area) {
  const q=_mrParseQuad(boardId); if(!q) return false;
  const r=_mrIsAxisRectFromQuad(q); if(!r) return false;
  if (r.w !== r.h) return false;
  return _mrAlmost(r.w*r.w, area);
}

function _mrCheckRhombusDiags(boardId, dA, dB) {
  const q=_mrParseQuad(boardId); if(!q) return false;
  const P=q.P;
  // zijden gelijk?
  const s=[_mrDist(P[0],P[1]), _mrDist(P[1],P[2]), _mrDist(P[2],P[3]), _mrDist(P[3],P[0])];
  if (!s.every(x => _mrAlmost(x, s[0]))) return false;

  // diagonalen
  const d1=_mrDist(P[0],P[2]);
  const d2=_mrDist(P[1],P[3]);
  const okLens = (_mrAlmost(d1,dA) && _mrAlmost(d2,dB)) || (_mrAlmost(d1,dB) && _mrAlmost(d2,dA));
  if (!okLens) return false;

  // diagonalen loodrecht (ruiten):
  const vx1=P[2].x-P[0].x; const vy1=P[2].y-P[0].y;
  const vx2=P[3].x-P[1].x; const vy2=P[3].y-P[1].y;
  return _mrAlmost(_mrDot(vx1,vy1, vx2,vy2), 0);
}

function _mrCheckParallelogramSides(boardId, a, b) {
  const q=_mrParseQuad(boardId); if(!q) return false;
  const par=_mrIsParallelogram(q); if(!par) return false;
  const P=q.P;
  const l0=_mrDist(P[0],P[1]);
  const l1=_mrDist(P[1],P[2]);
  // opposite lengths are l0 && l1
  const ok = (_mrAlmost(l0,a) && _mrAlmost(l1,b)) || (_mrAlmost(l0,b) && _mrAlmost(l1,a));
  return ok;
}

function _mrCheckTrapeziumParallelSidesHeight(boardId, a, b, h) {
  const q=_mrParseQuad(boardId); if(!q) return false;
  const trap=_mrIsTrapeziumExactlyOneParallel(q); if(!trap) return false;
  const P=q.P;
  let lenA, lenB, height;
  if (trap.pair === 0) {
    // edges 0 (P0-P1) && 2 (P2-P3)
    lenA=_mrDist(P[0],P[1]);
    lenB=_mrDist(P[2],P[3]);
    const v0x=P[1].x-P[0].x; const v0y=P[1].y-P[0].y;
    // distance from P2 to line through P0 along v0
    height = Math.abs(_mrCross(P[2].x-P[0].x, P[2].y-P[0].y, v0x, v0y)) / Math.sqrt(v0x*v0x+v0y*v0y);
  } else {
    // edges 1 (P1-P2) && 3 (P3-P0)
    lenA=_mrDist(P[1],P[2]);
    lenB=_mrDist(P[3],P[0]);
    const v1x=P[2].x-P[1].x; const v1y=P[2].y-P[1].y;
    height = Math.abs(_mrCross(P[3].x-P[1].x, P[3].y-P[1].y, v1x, v1y)) / Math.sqrt(v1x*v1x+v1y*v1y);
  }

  const okLens = (_mrAlmost(lenA,a) && _mrAlmost(lenB,b)) || (_mrAlmost(lenA,b) && _mrAlmost(lenB,a));
  if (!okLens) return false;
  return _mrAlmost(height, h, 1e-3);
}

function qVierhoekDrawGeneric({ prompt, sub = null, levelSkill = "tekenen_easy", checkFn, lockedLines = null }) {
  const boardId = "db_" + Math.random().toString(36).slice(2, 9);

  const v = (typeof svgDrawBoard === "function")
    ? svgDrawBoard({
        boardId,
        cols: 24,
        rows: 14,
        cell: 30,
        title: "Tekenrooster (1 vak = 1 cm)",
        hint: "Klik 2 roosterpunten voor een lijn. Maak een gesloten figuur. (Gum/Undo/Wis kan je gebruiken.)",
        startMode: "line",
        showLengths: false,
        lockedLines
      })
    : null;

  const q = qInput(
    "vierhoek",
    levelSkill,
    prompt,
    null,
    null,
    null,
    v,
    0.01,
    sub,
    () => (typeof checkFn === "function" ? checkFn(boardId) : false)
  );

  q.noScroll = false;
  q.drawBoardId = boardId;
  return q;
}

// ---- STRICT: uniek controleerbaar (omtrek/oppervlakte + 1 zijde) ----
function qVierhoekDrawStrict(level = "easy") {
  const mode = Math.random() < 0.5 ? "per" : "opp";

  if (mode === "per") {
    const om = pick([18, 20, 22, 24, 26, 28]);
    const b = pick([2, 3, 4, 5, 6]);
    const half = om / 2;
    const l = half - b;
    if (l < 2) return qVierhoekDrawStrict(level);

    return qVierhoekDrawGeneric({
      levelSkill: `tekenen_${level}`,
      prompt: `Teken een rechthoek met omtrek ${om} cm en breedte ${b} cm.`,
      checkFn: (id) => _mrCheckRectDims(id, l, b)
    });
  }

  // opp
  const opp = pick([12, 16, 18, 20, 24, 30, 36, 40, 48]);
  const l = pick([3, 4, 5, 6, 8]);
  if (opp % l !== 0) return qVierhoekDrawStrict(level);
  const b = opp / l;
  if (b < 2) return qVierhoekDrawStrict(level);

  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Teken een rechthoek met oppervlakte ${opp} cm² en lengte ${l} cm.`,
    checkFn: (id) => _mrCheckRectDims(id, l, b)
  });
}

function qVierhoekDrawRectStrict(level = "easy") {
  return qVierhoekDrawStrict(level);
}

function qVierhoekDrawSquareStrict(level = "easy") {
  const mode = Math.random() < 0.5 ? "per" : "opp";
  if (mode === "per") {
    const om = pick([16, 20, 24, 28, 32]);
    const s = om / 4;
    return qVierhoekDrawGeneric({
      levelSkill: `tekenen_${level}`,
      prompt: `Teken een vierkant met omtrek ${om} cm.`,
      checkFn: (id) => _mrCheckRectDims(id, s, s)
    });
  }
  const opp = pick([9, 16, 25, 36, 49, 64]);
  const s = Math.sqrt(opp);
  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Teken een vierkant met oppervlakte ${opp} cm².`,
    checkFn: (id) => _mrCheckRectDims(id, s, s)
  });
}

// ---- VRIJER: overal op het rooster, zolang eigenschap klopt ----
function qVierhoekDrawRectFree(level = "normal") {
  const mode = Math.random() < 0.5 ? "per" : "opp";
  if (mode === "per") {
    const om = pick([18, 20, 22, 24, 26, 28, 30]);
    return qVierhoekDrawGeneric({
      levelSkill: `tekenen_${level}`,
      prompt: `Teken een rechthoek met omtrek ${om} cm.`,
      checkFn: (id) => _mrCheckRectPerimeter(id, om)
    });
  }
  const opp = pick([12, 16, 18, 20, 24, 30, 36, 40, 48]);
  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Teken een rechthoek met oppervlakte ${opp} cm².`,
    checkFn: (id) => _mrCheckRectArea(id, opp)
  });
}

function qVierhoekDrawSquareFree(level = "normal") {
  const mode = Math.random() < 0.5 ? "per" : "opp";
  if (mode === "per") {
    const om = pick([16, 20, 24, 28, 32]);
    return qVierhoekDrawGeneric({
      levelSkill: `tekenen_${level}`,
      prompt: `Teken een vierkant met omtrek ${om} cm.`,
      checkFn: (id) => _mrCheckSquarePerimeter(id, om)
    });
  }
  const opp = pick([9, 16, 25, 36, 49, 64]);
  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Teken een vierkant met oppervlakte ${opp} cm².`,
    checkFn: (id) => _mrCheckSquareArea(id, opp)
  });
}


// alias: oude naam in questionbank
function qVierhoekDrawRectStrict(level = "easy") {
  return qVierhoekDrawStrict(level);
}

function _mrLockedSide(len) {
  // maak een vaste zijde (horizontaal of verticaal), binnen het rooster (0..24,0..14)
  const horiz = Math.random() < 0.6;
  if (horiz) {
    const x1 = 2 + Math.floor(Math.random() * (24 - len - 3));
    const y1 = 2 + Math.floor(Math.random() * 10);
    return [{ x1, y1, x2: x1 + len, y2: y1 }];
  }
  const x1 = 2 + Math.floor(Math.random() * 18);
  const y1 = 2 + Math.floor(Math.random() * (14 - len - 3));
  return [{ x1, y1, x2: x1, y2: y1 + len }];
}

function qVierhoekDrawCompleteSquare(level = "normal") {
  const s = pick([3,4,5,6,7,8]);
  const lockedLines = _mrLockedSide(s);
  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Er staat al één zijde getekend. Maak er een vierkant van met zijde ${s} cm.`,
    lockedLines,
    checkFn: (id) => _mrCheckRectDims(id, s, s)
  });
}

function qVierhoekDrawCompleteRect(level = "hard") {
  const w = pick([3,4,5,6]);
  const l = pick([7,8,9,10,12]);
  const lockedLines = _mrLockedSide(l);
  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Er staat al één zijde van ${l} cm. Maak er een rechthoek van met breedte ${w} cm.`,
    lockedLines,
    checkFn: (id) => _mrCheckRectDims(id, l, w)
  });
}

function qVierhoekDrawRhombus(level = "hard") {
  const d1 = pick([6, 8, 10, 12]);
  const d2 = pick([4, 6, 8]);
  const big = Math.max(d1, d2);
  const small = Math.min(d1, d2);
  if (big == small) return qVierhoekDrawRhombus(level);

  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Teken een ruit met grote diagonaal ${big} cm en kleine diagonaal ${small} cm.`,
    checkFn: (id) => _mrCheckRhombusDiags(id, big, small)
  });
}

function qVierhoekDrawParallelogram(level = "hard") {
  const a = pick([6, 8, 10]);
  const b = pick([5, 7]);
  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Teken een parallellogram met zijden ${a} cm en ${b} cm.`,
    checkFn: (id) => _mrCheckParallelogramSides(id, a, b)
  });
}

function qVierhoekDrawTrapezium(level = "hard") {
  const a = pick([8, 10, 12]);
  const b = pick([4, 6, 8]);
  const h = pick([3, 4, 5]);
  if (a == b) return qVierhoekDrawTrapezium(level);
  return qVierhoekDrawGeneric({
    levelSkill: `tekenen_${level}`,
    prompt: `Teken een trapezium met evenwijdige zijden ${a} cm en ${b} cm en hoogte ${h} cm.`,
    checkFn: (id) => _mrCheckTrapeziumParallelSidesHeight(id, a, b, h)
  });
}

/* ---------- VIERHOEK: vraagstukken ---------- */
function qVierhoekFieldLaps() {
  const L = rInt(40, 140);
  const B = rInt(25, 90);
  const laps = rInt(4, 14);
  const om = 2 * (L + B);
  const dist = om * laps; // meters
  const km = dist / 1000;
  return qInput(
    "vierhoek",
    "vraagstukken_normal",
    `Je loopt ${laps} keer rond een rechthoekige wei van ${L} m bij ${B} m.\nHoeveel meter loop je in totaal?`,
    dist,
    "number",
    "m",
    null,
    0.01,
    "Tip: eerst de omtrek, daarna × aantal rondes."
  );
}

function qVierhoekPaintingWalls() {
  const h = rInt(2, 4);
  const w1 = rInt(5, 10), l1 = rInt(6, 12);
  const w2 = rInt(4, 9), l2 = rInt(5, 10);
  const pot = pick([8, 10, 12]); // m² per pot
  const area = h * (w1 * l1 + w2 * l2); // (twee muren l1×w1 en twee muren l2×w2) zou kamer zijn; maar bundel: 2 muren + 1 muur
  // maak zoals bundel: 2 muren A en 1 muur B
  const A = l1 * h;
  const total = 2 * A + l2 * h;
  const pots = Math.ceil(total / pot);

  return qMc(
    "vierhoek",
    "vraagstukken_hard",
    `Je schildert 2 muren van ${l1} m op ${h} m en 1 muur van ${l2} m op ${h} m.\nMet 1 pot verf kan je ${pot} m² schilderen.\nHoeveel potten verf moet je kopen?`,
    [String(pots - 1), String(pots), String(pots + 1), String(pots + 2)],
    String(pots),
    null,
    "Tip: bereken eerst de totale oppervlakte en deel door m² per pot (altijd naar boven afronden)."
  );
}

function qVierhoekFence() {
  const L = rInt(8, 30);
  const B = rInt(6, 24);
  const price = pick([9, 11, 12, 15, 18]); // €/m
  const om = 2 * (L + B);
  const cost = om * price;
  return qInput(
    "vierhoek",
    "vraagstukken_easy",
    `Een tuin is ${L} m lang en ${B} m breed.\nEen omheining kost €${price} per meter.\nHoeveel kost de omheining?`,
    cost,
    "number",
    "€",
    null,
    0.01,
    "Tip: omtrek × prijs per meter."
  );
}

function qVierhoekCarpetArea() {
  const L = rInt(30, 80) / 10; // 3,0 .. 8,0 m
  const B = rInt(25, 65) / 10; // 2,5 .. 6,5 m
  const area = round2(L * B);
  return qInput(
    "vierhoek",
    "vraagstukken_easy",
    `Je legt een rechthoekig tapijt in een woonkamer.
Het tapijt is ${L.toString().replace(".", ",")} m lang en ${B.toString().replace(".", ",")} m breed.
Hoeveel m² tapijt ligt er op de vloer?`,
    area,
    "number",
    "m²",
    null,
    0.02,
    "Tip: oppervlakte rechthoek = lengte x breedte."
  );
}

function qVierhoekFlowerBedBorder() {
  const a = rInt(2, 12);
  const om = 4 * a;
  return qInput(
    "vierhoek",
    "vraagstukken_easy",
    `Je wil een lage rand plaatsen rond een vierkant bloembed.
Elke zijde is ${a} m.
Hoeveel meter rand heb je nodig?`,
    om,
    "number",
    "m",
    null,
    0.01,
    "Tip: omtrek vierkant = 4 x zijde."
  );
}

function qVierhoekLawnSeed() {
  const L = rInt(6, 20);
  const B = rInt(5, 18);
  const area = L * B;
  const perBag = pick([15, 20, 25]);
  const bags = Math.ceil(area / perBag);
  return qMc(
    "vierhoek",
    "vraagstukken_normal",
    `Een rechthoekig stukje gazon is ${L} m bij ${B} m.
Met 1 zak graszaad kan je ${perBag} m² inzaaien.
Hoeveel zakken heb je minstens nodig?`,
    shuffleLocal([String(bags), String(Math.max(1, bags - 1)), String(bags + 1), String(bags + 2)]),
    String(bags),
    null,
    "Tip: bereken eerst de oppervlakte en deel door m² per zak (naar boven afronden)."
  );
}

function qVierhoekFramePerimeter() {
  const L = rInt(18, 60);
  const B = rInt(12, 45);
  const om = 2 * (L + B);
  return qInput(
    "vierhoek",
    "vraagstukken_normal",
    `Je maakt een rechthoekige fotolijst.
De buitenmaten zijn ${L} cm bij ${B} cm.
Hoeveel cm lat heb je nodig voor de omtrek?`,
    om,
    "number",
    "cm",
    null,
    0.01,
    "Tip: omtrek rechthoek = 2 x (lengte + breedte)."
  );
}

/* ---------- DRIEHOEK: zijden ---------- */
function qDriehoekZijdenMC(s1, s2, s3) {
  const sides = shuffleLocal([s1, s2, s3]);
  const uniq = new Set(sides).size;
  const ans = uniq === 1 ? "gelijkzijdig" : (uniq === 2 ? "gelijkbenig" : "ongelijkbenig");
  const opts = shuffleLocal(["gelijkzijdig", "gelijkbenig", "ongelijkbenig"]);
  return qMc(
    "driehoek",
    "zijden_easy",
    `Een driehoek heeft zijden ${sides[0]} cm, ${sides[1]} cm en ${sides[2]} cm.\nWelke soort (volgens zijden) is dit?`,
    opts,
    ans,
    svgTriangle(ans === "gelijkzijdig" ? "equilateral" : (ans === "gelijkbenig" ? "isosceles" : "scalene"))
  );
}

function qDriehoekZijdenRandom(level = "easy") {
  if (level === "easy") {
    const a = rInt(4, 12);
    const b = pick([a, rInt(4, 12)]);
    const c = pick([a, b, rInt(4, 12)]);
    // force triangle inequality: make largest < sum other two
    const arr = [a, b, c].sort((x, y) => x - y);
    if (arr[2] >= arr[0] + arr[1]) arr[2] = arr[0] + arr[1] - 1;
    return qDriehoekZijdenMC(arr[0], arr[1], arr[2]);
  }
  if (level === "normal") {
    const a = rInt(30, 110) / 10; // 3.0..11.0
    const b = pick([a, rInt(30, 110) / 10]);
    let c = rInt(30, 110) / 10;
    const arr = [a, b, c].sort((x, y) => x - y);
    if (arr[2] >= arr[0] + arr[1]) arr[2] = round2(arr[0] + arr[1] - 0.5);
    return qMc(
      "driehoek",
      "zijden_normal",
      `Een driehoek heeft zijden ${arr[0].toString().replace(".", ",")} cm, ${arr[1].toString().replace(".", ",")} cm en ${arr[2].toString().replace(".", ",")} cm.\nWelke soort (volgens zijden) is dit?`,
      shuffleLocal(["gelijkzijdig", "gelijkbenig", "ongelijkbenig"]),
      (new Set(arr).size === 1 ? "gelijkzijdig" : (new Set(arr).size === 2 ? "gelijkbenig" : "ongelijkbenig")),
      null
    );
  }
  // hard: vraag of het kan
  const a = rInt(2, 14), b = rInt(2, 14);
  const c = rInt(Math.max(a, b), a + b + 4); // soms onmogelijk
  const possible = (a + b > c) && (a + c > b) && (b + c > a);
  return qMc(
    "driehoek",
    "zijden_hard",
    `Kan je met zijden ${a} cm, ${b} cm en ${c} cm een driehoek maken?`,
    ["ja", "nee"],
    possible ? "ja" : "nee",
    null,
    "Tip: som van 2 zijden moet altijd groter zijn dan de derde."
  );
}

/* ---------- DRIEHOEK: hoeken ---------- */
function qDriehoekHoekenAngles(level = "easy") {
  if (level === "easy") {
    const kind = pick(["acute", "right", "obtuse"]);
    const ans = kind === "acute" ? "scherphoekig" : (kind === "right" ? "rechthoekig" : "stomphoekig");
    return qMc(
      "driehoek",
      "hoeken_easy",
      "Welke soort driehoek (volgens hoeken) zie je?",
      shuffleLocal(["scherphoekig", "rechthoekig", "stomphoekig"]),
      ans,
      svgTriangle(kind)
    );
  }
  if (level === "normal") {
    // geef 3 hoeken
    let a = rInt(30, 80);
    let b = rInt(30, 80);
    let c = 180 - a - b;
    if (c <= 10) { a -= 10; b -= 10; c += 20; }
    const ans = (a === 90 || b === 90 || c === 90) ? "rechthoekig" : (a > 90 || b > 90 || c > 90) ? "stomphoekig" : "scherphoekig";
    return qMc(
      "driehoek",
      "hoeken_normal",
      `Een driehoek heeft hoeken van ${a}°, ${b}° en ${c}°.\nWelke soort (volgens hoeken) is dit?`,
      shuffleLocal(["scherphoekig", "rechthoekig", "stomphoekig"]),
      ans
    );
  }
  // hard: hoeveel scherpe/stompe/rechte hoeken
  const kind = pick(["scherphoekig", "rechthoekig", "stomphoekig"]);
  const q = pick([
    { ask: "Hoeveel rechte hoeken heeft een rechthoekige driehoek?", a: 1 },
    { ask: "Hoeveel stompe hoeken heeft een stomphoekige driehoek?", a: 1 },
    { ask: "Hoeveel scherpe hoeken heeft een rechthoekige driehoek?", a: 2 },
    { ask: "Hoeveel scherpe hoeken heeft een stomphoekige driehoek?", a: 2 },
    { ask: "Hoeveel stompe hoeken heeft een scherphoekige driehoek?", a: 0 },
  ]);
  return qInput(
    "driehoek",
    "hoeken_hard",
    q.ask,
    q.a,
    "number",
    null,
    null,
    0.01,
    "Tip: in een driehoek zijn er altijd 3 hoeken."
  );
}

/* ---------- DRIEHOEK: omtrek ---------- */
function qDriehoekOmtrek(level = "easy") {
  if (level === "easy") {
    const a = rInt(4, 14), b = rInt(4, 14);
    let c = rInt(4, 14);
    const arr = [a, b, c].sort((x, y) => x - y);
    if (arr[2] >= arr[0] + arr[1]) arr[2] = arr[0] + arr[1] - 1;
    const om = arr[0] + arr[1] + arr[2];
    return qInput(
      "driehoek",
      "omtrek_easy",
      `Bereken de omtrek van een driehoek met zijden ${arr[0]} cm, ${arr[1]} cm en ${arr[2]} cm.`,
      om,
      "number",
      "cm",
      null,
      0.01,
      "Tip: omtrek = zijde1 + zijde2 + zijde3."
    );
  }
  if (level === "normal") {
    // mix mm en cm
    const cm1 = rInt(5, 12);
    const mm = pick([25, 30, 45, 50, 55, 65, 75, 86]);
    const cm2 = rInt(4, 11);
    const om = round2(cm1 + mm / 10 + cm2);
    return qInput(
      "driehoek",
      "omtrek_normal",
      `Bereken de omtrek.\nZijden: ${cm1} cm, ${mm} mm en ${cm2} cm.\nGeef je antwoord in cm.`,
      om,
      "number",
      "cm",
      null,
      0.02,
      "Tip: zet mm om naar cm (delen door 10)."
    );
  }
  // hard: in meter + cm
  const m = rInt(0, 2);
  const cm = rInt(10, 90);
  const cm2 = rInt(40, 160);
  const cm3 = rInt(40, 160);
  const totalCm = m * 100 + cm + cm2 + cm3;
  return qInput(
    "driehoek",
    "omtrek_hard",
    `Bereken de omtrek in cm.\nZijden: ${m} m ${cm} cm, ${cm2} cm en ${cm3} cm.`,
    totalCm,
    "number",
    "cm",
    null,
    0.01,
    "Tip: 1 m = 100 cm."
  );
}

/* ---------- DRIEHOEK: oppervlakte ---------- */
function qDriehoekOpp(level = "easy") {
  if (level === "easy") {
    const b = rInt(6, 18);
    const h = rInt(4, 14);
    const opp = (b * h) / 2;
    return qInput(
      "driehoek",
      "oppervlakte_easy",
      `Bereken de oppervlakte.\nBasis = ${b} cm, hoogte = ${h} cm.`,
      opp,
      "number",
      "cm²",
      svgTriangle("generic", [null, null, `${b} cm`]),
      0.01,
      "Tip: oppervlakte = (basis × hoogte) ÷ 2."
    );
  }
  if (level === "normal") {
    // basis in cm, hoogte in mm
    const b = rInt(8, 22);
    const hmm = rInt(30, 120);
    const h = hmm / 10;
    const opp = round2((b * h) / 2);
    return qInput(
      "driehoek",
      "oppervlakte_normal",
      `Bereken de oppervlakte in cm².\nBasis = ${b} cm, hoogte = ${hmm} mm.`,
      opp,
      "number",
      "cm²",
      null,
      0.02,
      "Tip: zet hoogte om naar cm, dan (b × h) ÷ 2."
    );
  }
  // hard: in m² met cm
  const bm = rInt(5, 14);
  const hcm = rInt(120, 480);
  const hm = hcm / 100;
  const opp = round2((bm * hm) / 2);
  return qInput(
    "driehoek",
    "oppervlakte_hard",
    `Bereken de oppervlakte in m².\nBasis = ${bm} m, hoogte = ${hcm} cm.`,
    opp,
    "number",
    "m²",
    null,
    0.02,
    "Tip: zet cm om naar m (delen door 100)."
  );
}

/* ---------- DRIEHOEK: meten ---------- */
function qDriehoekMetenCmMm() {
  const ab = pick([30, 35, 40, 55, 65, 70, 75, 90]); // mm
  const bc = pick([28, 32, 45, 50, 60, 86]); // mm
  const ac = pick([40, 50, 60, 80, 95]); // mm
  const om = round2((ab + bc + ac) / 10);
  return qInput(
    "driehoek",
    "meten_easy",
    `Meetvraag (omrekenen):\n[AB] = ${ab} mm, [BC] = ${bc} mm, [AC] = ${ac} mm.\nBereken de omtrek in cm.`,
    om,
    "number",
    "cm",
    null,
    0.02,
    "Tip: deel elke mm-lengte door 10."
  );
}

/* ---------- TEMPERATUUR: thermometer ---------- */
function qTempRead(level = "easy") {
  if (level === "easy") {
    const t = pick([-5, -2, 0, 3, 7, 12, 18, 25, 31]);
    return qInput(
      "temperatuur",
      "thermometer_easy",
      "Lees de thermometer af. Welke temperatuur is het?",
      t,
      "number",
      "°C",
      svgThermometerValue(t),
      0.01,
      "Tip: let op min-tekens onder 0."
    );
  }
  if (level === "normal") {
    const t = rInt(-12, 38);
    return qInput(
      "temperatuur",
      "thermometer_normal",
      "Welke temperatuur toont de thermometer?",
      t,
      "number",
      "°C",
      svgThermometerValue(t),
      0.01
    );
  }
  // hard: verschil met andere thermometer
  const t1 = rInt(-12, 30);
  const diff = pick([2, 3, 4, 5, 6, 7, 8, 10]);
  const t2 = t1 + diff;
  return qInput(
    "temperatuur",
    "thermometer_hard",
    `Thermometer A toont ${t1}°C.\nThermometer B is ${diff}°C warmer.\nWelke temperatuur toont thermometer B?`,
    t2,
    "number",
    "°C",
    null,
    0.01,
    "Tip: warmer = optellen."
  );
}

/* ---------- TEMPERATUUR: verschillen ---------- */
function qTempDiff(level = "easy") {
  const a = rInt(-15, 35);
  const b = rInt(-15, 35);
  const diff = Math.abs(a - b);
  if (level === "easy") {
    return qInput(
      "temperatuur",
      "verschillen_easy",
      `Het is ${a}°C en daarna ${b}°C.\nHoeveel graden verschil is dat?`,
      diff,
      "number",
      "°C",
      null,
      0.01,
      "Tip: neem het verschil (altijd positief)."
    );
  }
  if (level === "normal") {
    const warmer = a > b ? "A" : "B";
    return qMc(
      "temperatuur",
      "verschillen_normal",
      `Thermometer A: ${a}°C\nThermometer B: ${b}°C\nWelke is warmer?`,
      ["A", "B"],
      warmer
    );
  }
  // hard: van warm naar koud sorteren (MC met 4 waarden)
  const vals = shuffleLocal([rInt(-10, 30), rInt(-10, 30), rInt(-10, 30), rInt(-10, 30)]);
  const sorted = vals.slice().sort((x, y) => y - x);
  const answer = sorted.join("°C, ") + "°C";
  const opts = shuffleLocal([
    answer,
    vals.slice().sort((x, y) => x - y).join("°C, ") + "°C",
    shuffleLocal(sorted).join("°C, ") + "°C",
    shuffleLocal(sorted).join("°C, ") + "°C",
  ]);
  return qMc(
    "temperatuur",
    "verschillen_hard",
    `Rangschik van warm naar koud:\n${vals[0]}°C, ${vals[1]}°C, ${vals[2]}°C, ${vals[3]}°C`,
    opts,
    answer,
    null,
    "Tip: warm = grootste getal."
  );
}

/* ---------- TEMPERATUUR: grafiek ---------- */
function qTempGraph(level = "easy") {
  const days = ["ma", "di", "wo", "do", "vr"];
  let temps = [
    rInt(-5, 15),
    rInt(-5, 15),
    rInt(-5, 15),
    rInt(-5, 15),
    rInt(-5, 15),
  ];
  // maak iets minder random zodat grafiek leesbaar is
  temps = temps.map((t, i) => t + (i === 0 ? 0 : rInt(-3, 3)));

  const i = rInt(0, 4);
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const maxDay = days[temps.indexOf(max)];
  const minDay = days[temps.indexOf(min)];

  if (level === "easy") {
    return qInput(
      "temperatuur",
      "grafiek_easy",
      `Bekijk het lijndiagram.\nWelke temperatuur is het op ${days[i]}?`,
      temps[i],
      "number",
      "°C",
      svgTempGraph(days, temps),
      0.01
    );
  }
  if (level === "normal") {
    return qMc(
      "temperatuur",
      "grafiek_normal",
      "Op welke dag is het het warmst?",
      shuffleLocal(days),
      maxDay,
      svgTempGraph(days, temps)
    );
  }
  // hard: gemiddelde van grafiek (meestal integer)
  const sum = temps.reduce((a, b) => a + b, 0);
  const avg = sum / temps.length;
  return qInput(
    "temperatuur",
    "grafiek_hard",
    "Bereken de gemiddelde temperatuur van deze week (ma t.e.m. vr).",
    round2(avg),
    "number",
    "°C",
    svgTempGraph(days, temps),
    0.02,
    "Tip: som / 5."
  );
}

/* ---------- TEMPERATUUR: gemiddelde & mediaan ---------- */
function qTempMeanMedian(level = "easy") {
  if (level === "easy") {
    const arr = shuffleLocal([2, 4, 6, 6, 8]); // median 6, avg 5.2
    const ask = pick(["mediaan", "gemiddelde"]);
    if (ask === "mediaan") {
      return qInput(
        "temperatuur",
        "gemmid_easy",
        `Temperaturen: ${arr.join("°C, ")}°C\nWat is de mediaan?`,
        6,
        "number",
        "°C",
        null,
        0.01,
        "Tip: sorteer en neem het middelste getal."
      );
    }
    return qInput(
      "temperatuur",
      "gemmid_easy",
      `Temperaturen: ${arr.join("°C, ")}°C\nWat is het gemiddelde? (rond af op 1 cijfer na de komma)`,
      5.2,
      "number",
      "°C",
      null,
      0.05,
      "Tip: som / aantal."
    );
  }

  if (level === "normal") {
    // 6 waarden → mediaan is gemiddelde van twee middelste
    const a = rInt(-2, 10);
    const arr = shuffleLocal([a, a + 1, a + 3, a + 4, a + 6, a + 6]);
    const sorted = arr.slice().sort((x, y) => x - y);
    const med = (sorted[2] + sorted[3]) / 2;
    return qInput(
      "temperatuur",
      "gemmid_normal",
      `Temperaturen: ${arr.join("°C, ")}°C\nBepaal de mediaan.`,
      med,
      "number",
      "°C",
      null,
      0.01,
      "Tip: bij 6 waarden neem je het gemiddelde van de 3e en 4e (gesorteerd)."
    );
  }

  // hard: gemiddelde met negatieve waarden
  const arr = [rInt(-10, 10), rInt(-10, 10), rInt(-10, 10), rInt(-10, 10), rInt(-10, 10)];
  const sum = arr.reduce((a, b) => a + b, 0);
  const avg = sum / 5;
  return qInput(
    "temperatuur",
    "gemmid_hard",
    `Temperaturen: ${arr.join("°C, ")}°C\nBereken het gemiddelde (rond af op 1 cijfer na de komma).`,
    round2(avg),
    "number",
    "°C",
    null,
    0.05,
    "Tip: negatieve getallen tellen ook mee in de som."
  );
}

/* ---------- CIRKEL: omtrek ---------- */
function qCircleCirc(level = "easy") {
  if (level === "easy") {
    const r = rInt(2, 15);
    const C = round2(2 * r * PI_314);
    return qInput(
      "cirkel",
      "omtrek_easy",
      `De straal is ${r} cm.\nBereken de omtrek (gebruik π = 3,14).`,
      C,
      "number",
      "cm",
      svgCircle({ r, show: "r" }),
      0.05,
      "Tip: omtrek = 2 × r × π."
    );
  }
  if (level === "normal") {
    const d = rInt(6, 40);
    const C = round2(d * PI_314);
    return qInput(
      "cirkel",
      "omtrek_normal",
      `De diameter is ${d} cm.\nBereken de omtrek (π = 3,14).`,
      C,
      "number",
      "cm",
      svgCircle({ d, show: "d" }),
      0.05,
      "Tip: omtrek = d × π."
    );
  }
  // hard: vraag om r uit omtrek te halen (inverse)
  const r = rInt(4, 18);
  const C = round2(2 * r * PI_314);
  const ans = round2(C / (2 * PI_314));
  return qInput(
    "cirkel",
    "omtrek_hard",
    `De omtrek van een cirkel is ${C} cm (π = 3,14).\nBereken de straal.`,
    ans,
    "number",
    "cm",
    null,
    0.05,
    "Tip: r = omtrek ÷ (2π)."
  );
}

/* ---------- CIRKEL: oppervlakte ---------- */
function qCircleArea(level = "easy") {
  if (level === "easy") {
    const r = rInt(2, 14);
    const A = round2(r * r * PI_314);
    return qInput(
      "cirkel",
      "oppervlakte_easy",
      `De straal is ${r} cm.\nBereken de oppervlakte (π = 3,14).`,
      A,
      "number",
      "cm²",
      svgCircle({ r, show: "r" }),
      0.08,
      "Tip: oppervlakte = r × r × π."
    );
  }
  if (level === "normal") {
    const d = rInt(6, 30);
    const r = d / 2;
    const A = round2(r * r * PI_314);
    return qInput(
      "cirkel",
      "oppervlakte_normal",
      `De diameter is ${d} cm.\nBereken de oppervlakte (π = 3,14).`,
      A,
      "number",
      "cm²",
      svgCircle({ d, show: "d" }),
      0.08,
      "Tip: eerst r = d ÷ 2."
    );
  }
  // hard: r uit oppervlakte
  const r = rInt(3, 16);
  const A = round2(r * r * PI_314);
  const ans = round2(Math.sqrt(A / PI_314));
  return qInput(
    "cirkel",
    "oppervlakte_hard",
    `De oppervlakte is ${A} cm² (π = 3,14).\nBereken de straal.`,
    ans,
    "number",
    "cm",
    null,
    0.08,
    "Tip: r = √(A ÷ π)."
  );
}

/* ---------- CIRKEL: context ---------- */
function qCircleContext(level = "easy") {
  if (level === "easy") {
    const d = rInt(10, 60);
    const C = round2(d * PI_314);
    return qInput(
      "cirkel",
      "context_easy",
      `Een ronde trampoline heeft diameter ${d} cm.\nHoeveel cm is de rand (omtrek)? (π = 3,14)`,
      C,
      "number",
      "cm",
      null,
      0.08,
      "Tip: omtrek = d × π."
    );
  }
  if (level === "normal") {
    const r = rInt(3, 20);
    const A = round2(r * r * PI_314);
    return qInput(
      "cirkel",
      "context_normal",
      `Een pizzabodem heeft straal ${r} cm.\nBereken de oppervlakte (π = 3,14).`,
      A,
      "number",
      "cm²",
      null,
      0.1,
      "Tip: r² × π."
    );
  }
  // hard: rond op 1 decimaal
  const r = rInt(8, 40);
  const speed = pick([3, 4, 5]); // m per stap? (speels)
  const C = 2 * r * PI_314; // cm
  const meters = C / 100;
  const steps = meters / speed;
  return qInput(
    "cirkel",
    "context_hard",
    `Je loopt 1 rondje rond een cirkelvormig perk met straal ${r} cm.\nHoeveel meter loop je? (π = 3,14)`,
    round2(meters),
    "number",
    "m",
    null,
    0.08,
    "Tip: bereken de omtrek in cm en zet om naar meter."
  );
}

/* ---------- SCHAAL: basis ---------- */
function qScaleBasic(level = "easy") {
  const opts = ["verkleining", "vergroting"];
  if (level === "easy") {
    const scale = pick(["1:4", "1:10", "1:100", "1:1000"]);
    return qMc(
      "schaal",
      "basis_easy",
      `Is schaal ${scale} een verkleining of vergroting?`,
      opts,
      "verkleining",
      null,
      "Tip: 1:n (n>1) is altijd kleiner dan echt."
    );
  }
  if (level === "normal") {
    const scale = pick(["4:1", "5:1", "10:1"]);
    return qMc(
      "schaal",
      "basis_normal",
      `Is schaal ${scale} een verkleining of vergroting?`,
      opts,
      "vergroting",
      null,
      "Tip: n:1 (n>1) is groter dan echt."
    );
  }
  // hard: factor bepalen
  const a = pick([2, 4, 5, 10, 20, 50, 100]);
  const type = pick(["1:n", "n:1"]);
  const scale = type === "1:n" ? `1:${a}` : `${a}:1`;
  const factor = type === "1:n" ? 1 / a : a;
  return qInput(
    "schaal",
    "basis_hard",
    `Schaal ${scale}.\nWat is de schaalfactor?`,
    factor,
    "number",
    null,
    null,
    0.0001,
    "Tip: bij 1:n is factor 1/n."
  );
}

/* ---------- SCHAAL: rekenen ---------- */
function qScaleCalc(level = "easy") {
  if (level === "easy") {
    const cm = rInt(2, 14);
    const s = pick([10, 20, 50, 100]);
    const realCm = cm * s;
    return qInput(
      "schaal",
      "rekenen_easy",
      `Op een tekening is een lijnstuk ${cm} cm.\nSchaal 1:${s}.\nHoeveel cm is dit in werkelijkheid?`,
      realCm,
      "number",
      "cm",
      svgScaleSegment(cm, `schaal 1:${s}`),
      0.01,
      "Tip: vermenigvuldig met ${s}."
    );
  }
  if (level === "normal") {
    const cm = rInt(3, 18);
    const s = pick([500, 1000, 1500, 2500]);
    const realM = (cm * s) / 100; // cm->m
    return qInput(
      "schaal",
      "rekenen_normal",
      `Op een kaart is een straat ${cm} cm.\nSchaal 1:${s}.\nHoeveel meter is dit in werkelijkheid?`,
      realM,
      "number",
      "m",
      svgScaleSegment(cm, `kaart 1:${s}`),
      0.02,
      "Tip: cm × schaal = cm echt, daarna ÷100 naar meter."
    );
  }
  // hard: omgekeerd (werkelijkheid -> tekening)
  const realM = rInt(12, 280);
  const s = pick([100, 200, 500, 1000]);
  const drawCm = (realM * 100) / s;
  return qInput(
    "schaal",
    "rekenen_hard",
    `Een afstand is ${realM} m in werkelijkheid.\nSchaal 1:${s}.\nHoeveel cm is dit op de tekening?`,
    round2(drawCm),
    "number",
    "cm",
    null,
    0.05,
    "Tip: zet m om naar cm en deel door schaal."
  );
}

/* ---------- SCHAAL: context ---------- */
function qScaleContext(level = "easy") {
  if (level === "easy") {
    const drawCm = rInt(3, 12);
    const s = 15000;
    const realM = (drawCm * s) / 100; // cm->m
    return qInput(
      "schaal",
      "context_easy",
      `Op een kaart is een straat ${drawCm} cm.\nDe schaal is 1:15 000.\nBereken de werkelijke lengte in meter.`,
      realM,
      "number",
      "m",
      null,
      0.2,
      "Tip: cm × 15 000 = cm echt, dan ÷100."
    );
  }
  if (level === "normal") {
    const drawCm = rInt(4, 20);
    const s = pick([200, 500, 1000]);
    const realM = (drawCm * s) / 100;
    return qInput(
      "schaal",
      "context_normal",
      `Een plattegrond is op schaal 1:${s}.\nDe lengte op papier is ${drawCm} cm.\nHoeveel meter is dit in werkelijkheid?`,
      realM,
      "number",
      "m",
      null,
      0.05,
      "Tip: cm × schaal = cm echt, dan ÷100."
    );
  }
  // hard: vergroting (bijv. 5:1)
  const realMm = rInt(8, 45);
  const scale = pick([2, 5, 10]);
  const drawMm = realMm * scale;
  return qInput(
    "schaal",
    "context_hard",
    `Een lieveheersbeestje is ${realMm} mm in werkelijkheid.\nHet wordt getekend op schaal ${scale}:1.\nHoeveel mm is het op de tekening?`,
    drawMm,
    "number",
    "mm",
    null,
    0.01,
    "Tip: vergroting → vermenigvuldigen."
  );
}

/* ---------- VOLUME: eenheid kiezen ---------- */
function qVolUnit(level = "easy") {
  const sets = {
    easy: [
      { p: "Een suikerklontje", a: "cm³", o: ["cm³", "dm³", "m³"] },
      { p: "Een reiskoffer", a: "dm³", o: ["cm³", "dm³", "m³"] },
      { p: "Een zwembad", a: "m³", o: ["cm³", "dm³", "m³"] },
      { p: "Een banaan", a: "dm³", o: ["cm³", "dm³", "m³"] },
    ],
    normal: [
      { p: "Een tuinhuis", a: "m³", o: ["cm³", "dm³", "m³"] },
      { p: "Een golfbal", a: "cm³", o: ["cm³", "dm³", "m³"] },
      { p: "Een drinkfles (1 L)", a: "dm³", o: ["cm³", "dm³", "m³"] },
    ],
    hard: [
      { p: "Een vrachtcontainer", a: "m³", o: ["dm³", "m³", "cm³"] },
      { p: "Een speldenkops", a: "mm³", o: ["mm³", "cm³", "dm³"] },
    ],
  };
  const item = pick(sets[level] || sets.easy);
  return qMc(
    "volume",
    `unit_${level}`,
    `Kies de meest passende volumemaat:\n${item.p} heeft een volume in …`,
    shuffleLocal(item.o),
    item.a
  );
}

/* ---------- VOLUME: herleiden ---------- */
function qVolConvert(level = "easy") {
  if (level === "easy") {
    const dm3 = pick([1, 2, 3, 4, 5, 8, 10]);
    const cm3 = dm3 * 1000;
    return qInput(
      "volume",
      "convert_easy",
      `Herleid: ${dm3} dm³ = ____ cm³`,
      cm3,
      "number",
      "cm³",
      null,
      0.01,
      "Tip: 1 dm³ = 1000 cm³."
    );
  }
  if (level === "normal") {
    const m3 = pick([1, 2, 3, 4, 6, 8, 9, 12]);
    const dm3 = m3 * 1000;
    return qInput(
      "volume",
      "convert_normal",
      `Herleid: ${m3} m³ = ____ dm³`,
      dm3,
      "number",
      "dm³",
      null,
      0.01,
      "Tip: 1 m³ = 1000 dm³."
    );
  }
  // hard: cm³ -> dm³ of mm³ -> cm³
  const kind = pick(["cm3_to_dm3", "mm3_to_cm3"]);
  if (kind === "cm3_to_dm3") {
    const cm3 = pick([500, 1200, 3000, 8000, 12000, 50000]);
    const dm3 = cm3 / 1000;
    return qInput(
      "volume",
      "convert_hard",
      `Herleid: ${cm3} cm³ = ____ dm³`,
      dm3,
      "number",
      "dm³",
      null,
      0.001,
      "Tip: deel door 1000."
    );
  }
  const mm3 = pick([2000, 8400, 12000, 60000, 250000]);
  const cm3 = mm3 / 1000;
  return qInput(
    "volume",
    "convert_hard",
    `Herleid: ${mm3} mm³ = ____ cm³`,
    cm3,
    "number",
    "cm³",
    null,
    0.001,
    "Tip: 1 cm³ = 1000 mm³."
  );
}

/* ---------- VOLUME: schatten ---------- */
function qVolEstimate(level = "easy") {
  const obj = pick([
    { p: "rozijn", a: "< 1 cm³" },
    { p: "banaan", a: "< 1 dm³" },
    { p: "reiskoffer", a: "< 1 m³" },
    { p: "tuinhuis", a: "> 1 m³" },
  ]);
  const options = ["< 1 cm³", "< 1 dm³", "< 1 m³", "> 1 m³"];
  return qMc(
    "volume",
    `schatten_${level}`,
    `Schat het volume van: ${obj.p}`,
    shuffleLocal(options),
    obj.a
  );
}

/* ---------- VOLUME: balk ---------- */
function qVolCuboid(level = "easy") {
  if (level === "easy") {
    const l = rInt(3, 12), b = rInt(2, 10), h = rInt(2, 10);
    const V = l * b * h;
    return qInput(
      "volume",
      "balk_easy",
      `Bereken het volume van de balk.\nLengte ${l} cm, breedte ${b} cm, hoogte ${h} cm.`,
      V,
      "number",
      "cm³",
      svgCuboid({ l, b, h, unit: "cm" }),
      0.01,
      "Tip: V = l × b × h."
    );
  }
  if (level === "normal") {
    const l = rInt(4, 20), b = rInt(3, 16);
    const hmm = rInt(20, 90); // mm
    const h = hmm / 10;       // cm
    const V = round2(l * b * h);
    return qInput(
      "volume",
      "balk_normal",
      `Lengte ${l} cm, breedte ${b} cm, hoogte ${hmm} mm.\nBereken het volume in cm³.`,
      V,
      "number",
      "cm³",
      null,
      0.02,
      "Tip: zet mm om naar cm, dan l×b×h."
    );
  }
  // hard: in m³, met cm -> m
  const l = rInt(8, 30) / 10;  // m
  const b = rInt(6, 25) / 10;  // m
  const hcm = rInt(40, 180);
  const h = hcm / 100;
  const V = round2(l * b * h);
  return qInput(
    "volume",
    "balk_hard",
    `Bereken het volume in m³.\nLengte ${l.toString().replace(".", ",")} m, breedte ${b.toString().replace(".", ",")} m, hoogte ${hcm} cm.`,
    V,
    "number",
    "m³",
    null,
    0.02,
    "Tip: zet cm om naar m, dan l×b×h."
  );
}

/* ---------- VOLUME: kubus ---------- */
function qVolCube(level = "easy") {
  if (level === "easy") {
    const a = rInt(3, 12);
    const V = a * a * a;
    return qInput(
      "volume",
      "kubus_easy",
      `Bereken het volume van de kubus met zijde ${a} cm.`,
      V,
      "number",
      "cm³",
      svgCube({ a, unit: "cm" }),
      0.01,
      "Tip: V = zijde³."
    );
  }
  if (level === "normal") {
    const amm = pick([12, 14, 20, 26, 30, 35, 40]);
    const V = amm * amm * amm;
    return qInput(
      "volume",
      "kubus_normal",
      `Bereken het volume van de kubus.\nZijde = ${amm} mm.\nGeef je antwoord in mm³.`,
      V,
      "number",
      "mm³",
      null,
      0.01,
      "Tip: mm³ blijft in mm³ (geen omrekening nodig)."
    );
  }
  // hard: dm³ (1 dm = 10 cm)
  const aDm = pick([2, 3, 4, 5, 6]);
  const V = aDm * aDm * aDm;
  return qInput(
    "volume",
    "kubus_hard",
    `Bereken het volume van de kubus met zijde ${aDm} dm.`,
    V,
    "number",
    "dm³",
    null,
    0.01,
    "Tip: dm³ blijft dm³."
  );
}

/* =====================================================
   BANK – opbouw per topic / subtopic / level
===================================================== */

const BANK = {
  vierhoek: {
    soorten: {
      easy: [
        () => qVierhoekNaam("vierkant"),
        () => qVierhoekNaam("rechthoek"),
        () => qVierhoekNaam("trapezium"),
        () => qVierhoekNaam("ruit"),
        () => qVierhoekNaam("parallellogram"),
        () => qVierhoekNaam("ruit"),
        () => qMc("vierhoek", "soorten_easy",
          "Welke vierhoek heeft 4 gelijke zijden én 4 rechte hoeken?",
          shuffleLocal(["vierkant", "rechthoek", "ruit"]),
          "vierkant"),
        () => qMc("vierhoek", "soorten_easy",
          "Welke vierhoek heeft precies 1 paar evenwijdige zijden?",
          shuffleLocal(["trapezium", "rechthoek", "parallellogram"]),
          "trapezium"),
      ],
      normal: [
        () => qVierhoekEigenschap(
          "Welke uitspraak is juist over een parallellogram?",
          "2 paren evenwijdige zijden",
          ["4 gelijke zijden", "1 paar evenwijdige zijden", "4 rechte hoeken"]
        ),
        () => qVierhoekEigenschap(
          "Welke uitspraak past bij een ruit?",
          "4 gelijke zijden",
          ["4 rechte hoeken", "1 paar evenwijdige zijden", "geen gelijke zijden"]
        ),
        () => qVierhoekEigenschap(
          "Welke uitspraak past bij een rechthoek?",
          "4 rechte hoeken",
          ["4 gelijke zijden", "1 paar evenwijdige zijden", "2 gelijke aanliggende zijden"]
        ),
        ( ) => qMc("vierhoek", "soorten_normal",
          "Welke vierhoek heeft 4 gelijke zijden?",
          shuffleLocal(["ruit", "rechthoek", "trapezium"]),
          "ruit"),
        ( ) => qMc("vierhoek", "soorten_normal",
          "Een vierkant is ook altijd een …",
          shuffleLocal(["rechthoek", "parallellogram", "trapezium"]),
          "rechthoek"),
      ],
      hard: [
        () => qMc("vierhoek", "soorten_hard",
          "Welke combinatie klopt?",
          shuffleLocal([
            "ruit: 4 gelijke zijden",
            "trapezium: 2 paren evenwijdige zijden",
            "rechthoek: 4 gelijke zijden"
          ]),
          "ruit: 4 gelijke zijden"
        ),
        () => qMc("vierhoek", "soorten_hard",
          "Een parallellogram dat ook 4 rechte hoeken heeft, heet een …",
          shuffleLocal(["rechthoek", "ruit", "trapezium"]),
          "rechthoek"
        ),
        () => qMc("vierhoek", "soorten_hard",
          "Welke figuur heeft altijd 2 paren evenwijdige zijden?",
          shuffleLocal(["parallellogram", "trapezium", "ruit"]),
          "parallellogram"
        ),
      ],
    },

    omtrek: {
      easy: [
        ...Array.from({ length: 4 }, () => () => qVierhoekOmtrekRect("cm")),
        ...Array.from({ length: 3 }, () => () => qVierhoekOmtrekSquare("cm")),
        ...Array.from({ length: 6 }, () => () => qVierhoekGridOmtrek("easy")),
      ],
      normal: [
        ...Array.from({ length: 4 }, () => () => qVierhoekOmtrekRect("cm")),
        ...Array.from({ length: 2 }, () => () => qVierhoekOmtrekSquare("cm")),
        ...Array.from({ length: 4 }, () => () => qVierhoekGridOmtrek("normal")),
        () => qInput("vierhoek", "omtrek_normal",
          "Een parallellogram heeft zijden 9 cm en 5 cm. Bereken de omtrek.",
          28, "number", "cm", svgQuad("parallellogram", ["9 cm", "", "", "5 cm"]), 0.01,
          "Tip: omtrek = 2 × (a + b)."
        ),
        () => qInput("vierhoek", "omtrek_normal",
          "Een trapezium heeft zijden 6 cm, 4 cm, 5 cm en 3 cm. Bereken de omtrek.",
          18, "number", "cm", svgQuad("trapezium"), 0.01
        ),
      ],
      hard: [
        ...Array.from({ length: 3 }, () => () => qVierhoekGridOmtrek("hard")),
        () => qInput("vierhoek", "omtrek_hard",
          "Een rechthoek heeft omtrek 36 cm en breedte 7 cm.\nHoe lang is de lengte?",
          11, "number", "cm", null, 0.01,
          "Tip: 36 = 2(L + 7) → L + 7 = 18."
        ),
        () => qInput("vierhoek", "omtrek_hard",
          "Een vierkant heeft omtrek 52 cm.\nHoe lang is 1 zijde?",
          13, "number", "cm", null, 0.01,
          "Tip: omtrek ÷ 4."
        ),
        () => qInput("vierhoek", "omtrek_hard",
          "Een rechthoek is 1,2 m lang en 55 cm breed.\nBereken de omtrek in cm.",
          2 * (120 + 55), "number", "cm", null, 0.01,
          "Tip: 1,2 m = 120 cm."
        ),
      ],
    },

    oppervlakte: {
      easy: [
        ...Array.from({ length: 4 }, () => () => qVierhoekOppRect("cm")),
        ...Array.from({ length: 4 }, () => () => qVierhoekOppSquare("cm")),
        ...Array.from({ length: 6 }, () => () => qVierhoekGridOpp("easy")),
      ],
      normal: [
        ...Array.from({ length: 4 }, () => () => qVierhoekOppRect("cm")),
        ...Array.from({ length: 4 }, () => () => qVierhoekGridOpp("normal")),
        () => qInput("vierhoek", "oppervlakte_normal",
          "Een rechthoek is 12 cm lang en 8 cm breed.\nBereken de oppervlakte.",
          96, "number", "cm²", svgQuad("rechthoek", ["12 cm", "", "", "8 cm"]), 0.01
        ),
        () => qInput("vierhoek", "oppervlakte_normal",
          "Een vierkant heeft zijde 43 mm.\nBereken de oppervlakte in mm².",
          43 * 43, "number", "mm²", null, 0.01
        ),
      ],
      hard: [
        ...Array.from({ length: 3 }, () => () => qVierhoekGridOpp("hard")),
        () => qInput("vierhoek", "oppervlakte_hard",
          "Een rechthoek heeft oppervlakte 84 cm² en breedte 7 cm.\nHoe lang is de lengte?",
          12, "number", "cm", null, 0.01,
          "Tip: lengte = oppervlakte ÷ breedte."
        ),
        () => qInput("vierhoek", "oppervlakte_hard",
          "Een vierkant heeft oppervlakte 144 cm².\nHoe lang is 1 zijde?",
          12, "number", "cm", null, 0.01,
          "Tip: zijde = √144."
        ),
      ],
    },

    meten: {
      easy: [
        ...Array.from({ length: 4 }, () => () => qVierhoekConvertMmToCm()),
        ...Array.from({ length: 3 }, () => () => qVierhoekMixedUnits()),
      ],
      normal: [
        () => qInput("vierhoek", "meten_normal",
          "Zet om: 3,5 m = ____ cm",
          350, "number", "cm", null, 0.01,
          "Tip: × 100."
        ),
        () => qInput("vierhoek", "meten_normal",
          "Zet om: 0,6 m = ____ mm",
          600, "number", "mm", null, 0.01,
          "Tip: 1 m = 1000 mm."
        ),
      ],
      hard: [
        () => qInput("vierhoek", "meten_hard",
          "Een rechthoek heeft lengte 1,4 m en breedte 65 cm.\nBereken de omtrek in cm.",
          2 * (140 + 65),
          "number",
          "cm",
          null,
          0.01,
          "Tip: zet 1,4 m om naar 140 cm."
        ),
        () => qInput("vierhoek", "meten_hard",
          "Zet om: 2,75 m = ____ mm",
          2750,
          "number",
          "mm",
          null,
          0.01,
          "Tip: 1 m = 1000 mm."
        ),
        () => qVierhoekMixedUnits(),
        () => qVierhoekConvertMmToCm(),
      ],
    },

    vraagstukken: {
      easy: [
        ...Array.from({ length: 3 }, () => () => qVierhoekFence()),
        ...Array.from({ length: 2 }, () => () => qVierhoekCarpetArea()),
        ...Array.from({ length: 2 }, () => () => qVierhoekFlowerBedBorder()),
        () => qVierhoekFieldLaps(),
      ],
      normal: [
        ...Array.from({ length: 3 }, () => () => qVierhoekFieldLaps()),
        ...Array.from({ length: 2 }, () => () => qVierhoekLawnSeed()),
        ...Array.from({ length: 2 }, () => () => qVierhoekFramePerimeter()),
        () => qInput("vierhoek", "vraagstukken_normal",
          "Een fotokader is 30 cm bij 21 cm.\nHoeveel cm hout heb je nodig voor de rand?",
          2 * (30 + 21), "number", "cm", null, 0.01,
          "Tip: dat is de omtrek."
        ),
      ],
      hard: [
        () => qVierhoekPaintingWalls(),
        () => qVierhoekLawnSeed(),
        () => qMc("vierhoek", "vraagstukken_hard",
          "Een rechthoekige tuin is 24 m bij 16 m.\nJe wil in 3 lagen gras zaaien 😄.\nHoeveel m² zaai je in totaal?",
          shuffleLocal(["384", "768", "1152", "960"]),
          "1152",
          null,
          "Tip: oppervlakte = 24×16, dan ×3."
        ),
      ],
    },

  tekenen: {
    easy: [
      () => qVierhoekDrawRectStrict("easy"),
      () => qVierhoekDrawSquareStrict("easy"),
      () => qVierhoekDrawCompleteSquare("easy"),
      () => qVierhoekDrawRectFree("easy"),
      () => qVierhoekDrawSquareFree("easy"),
      () => qVierhoekDrawRectStrict("easy"),
    ],
    normal: [
      () => qVierhoekDrawRectStrict("normal"),
      () => qVierhoekDrawSquareStrict("normal"),
      () => qVierhoekDrawCompleteRect("normal"),
      () => qVierhoekDrawRectFree("normal"),
      () => qVierhoekDrawSquareFree("normal"),
      () => qVierhoekDrawRhombus("normal"),
    ],
    hard: [
      () => qVierhoekDrawParallelogram("hard"),
      () => qVierhoekDrawTrapezium("hard"),
      () => qVierhoekDrawRhombus("hard"),
      () => qVierhoekDrawCompleteRect("hard"),
      () => qVierhoekDrawRectFree("hard"),
      () => qVierhoekDrawSquareFree("hard"),
    ],
  },

  },

  driehoek:
 {
    zijden: {
      easy: [
        () => qDriehoekZijdenRandom("easy"),
        () => qDriehoekZijdenRandom("easy"),
        () => qDriehoekZijdenMC(7, 7, 7),
        () => qDriehoekZijdenMC(6, 6, 9),
        () => qDriehoekZijdenMC(5, 8, 9),
        () => qDriehoekZijdenRandom("easy"),
      ],
      normal: [
        ...Array.from({ length: 6 }, () => () => qDriehoekZijdenRandom("normal")),
      ],
      hard: [
        ...Array.from({ length: 8 }, () => () => qDriehoekZijdenRandom("hard")),
      ],
    },

    hoeken: {
      easy: [
        ...Array.from({ length: 6 }, () => () => qDriehoekHoekenAngles("easy")),
      ],
      normal: [
        ...Array.from({ length: 6 }, () => () => qDriehoekHoekenAngles("normal")),
      ],
      hard: [
        ...Array.from({ length: 6 }, () => () => qDriehoekHoekenAngles("hard")),
      ],
    },

    omtrek: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qDriehoekOmtrek("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qDriehoekOmtrek("normal")),
      ],
      hard: [
        ...Array.from({ length: 6 }, () => () => qDriehoekOmtrek("hard")),
      ],
    },

    oppervlakte: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qDriehoekOpp("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qDriehoekOpp("normal")),
      ],
      hard: [
        ...Array.from({ length: 6 }, () => () => qDriehoekOpp("hard")),
      ],
    },

    meten: {
      easy: [
        ...Array.from({ length: 6 }, () => () => qDriehoekMetenCmMm()),
      ],
      normal: [
        () => qMc("driehoek", "meten_normal",
          "Welke lijn is de hoogte bij basis [AC]?",
          shuffleLocal(["loodlijn op AC vanuit B", "lijnstuk AC", "lijnstuk AB"]),
          "loodlijn op AC vanuit B",
          null,
          "Tip: hoogte staat loodrecht op de basis."
        ),
      ],
      hard: [
        () => qInput("driehoek", "meten_hard",
          "Basis = 2,4 m en hoogte = 85 cm.\nBereken de oppervlakte in m².",
          round2((2.4 * 0.85) / 2),
          "number",
          "m²",
          null,
          0.03,
          "Tip: zet 85 cm om naar 0,85 m en gebruik (b×h)/2."
        ),
        () => qInput("driehoek", "meten_hard",
          "Zet om: 450 mm = ____ cm",
          45,
          "number",
          "cm",
          null,
          0.01,
          "Tip: deel door 10."
        ),
        () => qDriehoekMetenCmMm(),
      ],
    },
  },

  temperatuur: {
    thermometer: {
      easy: [
        ...Array.from({ length: 6 }, () => () => qTempRead("easy")),
      ],
      normal: [
        ...Array.from({ length: 6 }, () => () => qTempRead("normal")),
      ],
      hard: [
        ...Array.from({ length: 6 }, () => () => qTempRead("hard")),
      ],
    },

    grafiek: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qTempGraph("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qTempGraph("normal")),
      ],
      hard: [
        ...Array.from({ length: 8 }, () => () => qTempGraph("hard")),
      ],
    },

    verschillen: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qTempDiff("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qTempDiff("normal")),
      ],
      hard: [
        ...Array.from({ length: 8 }, () => () => qTempDiff("hard")),
      ],
    },

    gemmid: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qTempMeanMedian("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qTempMeanMedian("normal")),
      ],
      hard: [
        ...Array.from({ length: 8 }, () => () => qTempMeanMedian("hard")),
      ],
    },
  },

  cirkel: {
    omtrek: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qCircleCirc("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qCircleCirc("normal")),
      ],
      hard: [
        ...Array.from({ length: 8 }, () => () => qCircleCirc("hard")),
      ],
    },

    oppervlakte: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qCircleArea("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qCircleArea("normal")),
      ],
      hard: [
        ...Array.from({ length: 8 }, () => () => qCircleArea("hard")),
      ],
    },

    context: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qCircleContext("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qCircleContext("normal")),
      ],
      hard: [
        ...Array.from({ length: 8 }, () => () => qCircleContext("hard")),
      ],
    },
  },

  schaal: {
    basis: {
      easy: [
        ...Array.from({ length: 8 }, () => () => qScaleBasic("easy")),
      ],
      normal: [
        ...Array.from({ length: 8 }, () => () => qScaleBasic("normal")),
      ],
      hard: [
        ...Array.from({ length: 6 }, () => () => qScaleBasic("hard")),
      ],
    },

    rekenen: {
      easy: [
        ...Array.from({ length: 10 }, () => () => qScaleCalc("easy")),
      ],
      normal: [
        ...Array.from({ length: 10 }, () => () => qScaleCalc("normal")),
      ],
      hard: [
        ...Array.from({ length: 10 }, () => () => qScaleCalc("hard")),
      ],
    },

    context: {
      easy: [
        ...Array.from({ length: 10 }, () => () => qScaleContext("easy")),
      ],
      normal: [
        ...Array.from({ length: 10 }, () => () => qScaleContext("normal")),
      ],
      hard: [
        ...Array.from({ length: 10 }, () => () => qScaleContext("hard")),
      ],
    },
  },

  volume: {
    unit: {
      easy: [
        ...Array.from({ length: 10 }, () => () => qVolUnit("easy")),
      ],
      normal: [
        ...Array.from({ length: 10 }, () => () => qVolUnit("normal")),
      ],
      hard: [
        ...Array.from({ length: 10 }, () => () => qVolUnit("hard")),
      ],
    },

    convert: {
      easy: [
        ...Array.from({ length: 12 }, () => () => qVolConvert("easy")),
      ],
      normal: [
        ...Array.from({ length: 12 }, () => () => qVolConvert("normal")),
      ],
      hard: [
        ...Array.from({ length: 12 }, () => () => qVolConvert("hard")),
      ],
    },

    schatten: {
      easy: [
        ...Array.from({ length: 10 }, () => () => qVolEstimate("easy")),
      ],
      normal: [
        ...Array.from({ length: 10 }, () => () => qVolEstimate("normal")),
      ],
      hard: [
        ...Array.from({ length: 10 }, () => () => qVolEstimate("hard")),
      ],
    },

    balk: {
      easy: [
        ...Array.from({ length: 10 }, () => () => qVolCuboid("easy")),
      ],
      normal: [
        ...Array.from({ length: 10 }, () => () => qVolCuboid("normal")),
      ],
      hard: [
        ...Array.from({ length: 10 }, () => () => qVolCuboid("hard")),
      ],
    },

    kubus: {
      easy: [
        ...Array.from({ length: 10 }, () => () => qVolCube("easy")),
      ],
      normal: [
        ...Array.from({ length: 10 }, () => () => qVolCube("normal")),
      ],
      hard: [
        ...Array.from({ length: 10 }, () => () => qVolCube("hard")),
      ],
    },
  },

  // optioneel (wordt niet gebruikt door de \"global\"-logica in game.js,
  // maar is handig als je ooit in code direct wil picken per topic)
  global: {
    mix: [
      () => pickFromTopic("vierhoek"),
      () => pickFromTopic("driehoek"),
      () => pickFromTopic("temperatuur"),
      () => pickFromTopic("cirkel"),
      () => pickFromTopic("schaal"),
      () => pickFromTopic("volume"),
    ],
  },
};

/* =====================================================
   Helper: pick een willekeurige vraag uit een topic
===================================================== */
function pickFromTopic(topic) {
  const t = BANK?.[topic];
  if (!t) return null;

  const subtopics = Object.keys(t);
  const sub = t[subtopics[Math.floor(Math.random() * subtopics.length)]];
  if (!sub) return null;

  const levels = Object.keys(sub);
  const lvl = sub[levels[Math.floor(Math.random() * levels.length)]];
  if (!Array.isArray(lvl) || !lvl.length) return null;

  return lvl[Math.floor(Math.random() * lvl.length)]();
}

// expose (handig voor debugging in console)
window.BANK = BANK;
