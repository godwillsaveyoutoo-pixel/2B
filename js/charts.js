/* =====================================================
   Wiskunde Quest – charts.js
   Didactisch correcte, professionele SVG-grafieken
   (Staaf – Lijn – Cirkel)
===================================================== */

/* =========================
   THEME
========================= */
const ChartTheme = {
  primary: "#3b82f6",
  primaryDark: "#1d4ed8",
  bg: "#ffffff",
  textMain: "#0f172a",
  textMuted: "#64748b",
  gridMajor: "#cbd5e1",
  gridMinor: "#d8e0ea",
  axis: "#94a3b8",
  pieColors: [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ]
};

/* =========================
   HELPERS
========================= */
function _fmtNL(n, dec = 0) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: dec,
  }).format(n);
}
const _crisp = v => Math.round(v) + 0.5;

/* =========================
   GRID / TICKS
========================= */
function _buildTicks(maxV, step = 1) {
  const axisMax = Math.ceil(maxV / step) * step || step;
  const minorTicks = [];
  const majorTicks = [];

  for (let v = 0; v <= axisMax + step / 2; v += step) {
    minorTicks.push(+v.toFixed(10));
    if (v % (step * 5) === 0) majorTicks.push(+v.toFixed(10));
  }
  return { axisMax, minorTicks, majorTicks };
}

/* =====================================================
   BAR CHART
   svgBarChart([{label,value}], max, title, {step})
===================================================== */
function svgBarChart(data = [], max = 0, title = "", opts = {}) {
  const w = 420, h = 260;
  const padL = 56, padR = 18, padT = 46, padB = 44;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  if (!data.length) return "";

  const step = opts.step ?? 1;
  const maxData = Math.max(...data.map(d => d.value), 0);
  const { axisMax, minorTicks, majorTicks } =
    _buildTicks(Math.max(max, maxData), step);

  const slot = chartW / data.length;
  const barW = Math.min(38, slot * 0.6);

  /* --- GRID --- */
  const hGrid = minorTicks.map(v => {
    const y = _crisp(padT + chartH - (v / axisMax) * chartH);
    const isMajor = majorTicks.includes(v);
    return `
      <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}"
            stroke="${isMajor ? ChartTheme.gridMajor : ChartTheme.gridMinor}"
            stroke-width="${isMajor ? 1.4 : 1}"
            stroke-dasharray="${isMajor ? "" : "3 4"}"/>
      ${isMajor ? `
        <text x="${padL - 10}" y="${y + 4}" text-anchor="end"
              font-size="11" font-weight="700"
              fill="${ChartTheme.textMuted}">
          ${_fmtNL(v)}
        </text>` : ""}
    `;
  }).join("");

  const vGrid = data.map((_, i) => {
    const x = _crisp(padL + i * slot);
    return `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + chartH}"
                  stroke="${ChartTheme.gridMinor}" stroke-width="1"/>`;
  }).join("");

  /* --- BARS --- */
  const bars = data.map((d, i) => {
    const bh = (d.value / axisMax) * chartH;
    const x = padL + i * slot + (slot - barW) / 2;
    const y = padT + chartH - bh;

    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${bh}"
            rx="7"
            fill="rgba(59,130,246,.65)"
            stroke="${ChartTheme.primaryDark}" stroke-width="1.6"/>
      <text x="${x + barW / 2}" y="${h - 14}"
            text-anchor="middle"
            font-size="11" font-weight="800"
            fill="${ChartTheme.textMain}">
        ${d.label}
      </text>
    `;
  }).join("");

  return `
  <svg viewBox="0 0 ${w} ${h}" width="100%"
       xmlns="http://www.w3.org/2000/svg"
       style="font-family: Inter, system-ui, sans-serif;">
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}"
          rx="14" fill="${ChartTheme.bg}"
          stroke="#e5e7eb" stroke-width="2.5"/>

    <text x="${w / 2}" y="28" text-anchor="middle"
          font-size="16" font-weight="900"
          fill="${ChartTheme.textMain}">
      ${title}
    </text>

    <rect x="${padL}" y="${padT}" width="${chartW}" height="${chartH}"
          rx="10" fill="#f8fafc"/>

    ${vGrid}
    ${hGrid}

    <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}"
          stroke="${ChartTheme.axis}" stroke-width="2"/>
    <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}"
          stroke="${ChartTheme.axis}" stroke-width="2"/>

    ${bars}
  </svg>`;
}
window.svgBarChart = svgBarChart;

/* =====================================================
   LINE CHART
   svgLineChart(labels[], values[], max, step, title)
===================================================== */
function svgLineChart(labels = [], values = [], max = 0, step = 1, title = "") {
  // Backwards-compatible: support being called with an array of {x,y} points
  // as used in questions.js: svgLineChart(points, max, title)
  if (Array.isArray(labels) && labels.length && typeof labels[0] === "object" && labels[0] !== null && "x" in labels[0] && "y" in labels[0]) {
    const pts = labels;
    const maybeMax = values; // when called as (points, max, title)
    const maybeTitle = max;
    const ptsLabels = pts.map(p => p.x);
    const ptsValues = pts.map(p => p.y);
    labels = ptsLabels;
    values = ptsValues;
    if (typeof maybeMax === "number") {
      max = maybeMax;
    }
    if (typeof maybeTitle === "string") {
      title = maybeTitle;
    }
  }

  const w = 420, h = 260;
  const padL = 56, padR = 18, padT = 46, padB = 44;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxData = Math.max(...values, 0);
  const { axisMax, minorTicks, majorTicks } =
    _buildTicks(Math.max(max, maxData), step);

  const xStep = chartW / (labels.length - 1);
  const yVal = v => padT + chartH - (v / axisMax) * chartH;

  const hGrid = minorTicks.map(v => {
    const y = yVal(v);
    const isMajor = majorTicks.includes(v);
    return `
      <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}"
            stroke="${isMajor ? ChartTheme.gridMajor : ChartTheme.gridMinor}"
            stroke-width="${isMajor ? 1.3 : 1}"
            stroke-dasharray="${isMajor ? "" : "3 4"}"/>
      ${isMajor ? `
        <text x="${padL - 10}" y="${y + 4}"
              text-anchor="end"
              font-size="11" font-weight="700"
              fill="${ChartTheme.textMuted}">
          ${_fmtNL(v)}
        </text>` : ""}
    `;
  }).join("");

  const path = values.map((v, i) => {
    const x = padL + i * xStep;
    const y = yVal(v);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  const points = values.map((v, i) => {
    const x = padL + i * xStep;
    const y = yVal(v);
    return `<circle cx="${x}" cy="${y}" r="4.2"
                    fill="${ChartTheme.primary}"
                    stroke="${ChartTheme.primaryDark}"
                    stroke-width="2"/>`;
  }).join("");

  const xLabels = labels.map((l, i) => `
    <text x="${padL + i * xStep}" y="${h - 14}"
          text-anchor="middle"
          font-size="11" font-weight="800"
          fill="${ChartTheme.textMain}">
      ${l}
    </text>
  `).join("");

  return `
  <svg viewBox="0 0 ${w} ${h}" width="100%"
       xmlns="http://www.w3.org/2000/svg"
       style="font-family: Inter, system-ui, sans-serif;">
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}"
          rx="14" fill="${ChartTheme.bg}"
          stroke="#e5e7eb" stroke-width="2.5"/>

    <text x="${w / 2}" y="28" text-anchor="middle"
          font-size="16" font-weight="900"
          fill="${ChartTheme.textMain}">
      ${title}
    </text>

    ${hGrid}

    <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}"
          stroke="${ChartTheme.axis}" stroke-width="2"/>
    <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}"
          stroke="${ChartTheme.axis}" stroke-width="2"/>

    <path d="${path}" fill="none"
          stroke="${ChartTheme.primaryDark}"
          stroke-width="2.6"/>

    ${points}
    ${xLabels}
  </svg>`;
}
window.svgLineChart = svgLineChart;

/* =====================================================
   PIE CHART
   svgPieChart(labels[], values[], title)
===================================================== */
/* =====================================================
   PIE CHART (optioneel met waarden)
   svgPieChart(labels[], values[], title, showValues=true)
===================================================== */
function svgPieChart(labels = [], values = [], title = "", showValues = true) {
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return "";

  const w = 420, h = 260;
  const cx = 140, cy = 140, r = 70;
  let angle = -90;

  const slices = values.map((v, i) => {
    const a = (v / total) * 360;
    const mid = angle + a / 2;

    const x1 = cx + r * Math.cos(angle * Math.PI / 180);
    const y1 = cy + r * Math.sin(angle * Math.PI / 180);
    angle += a;
    const x2 = cx + r * Math.cos(angle * Math.PI / 180);
    const y2 = cy + r * Math.sin(angle * Math.PI / 180);

    const large = a > 180 ? 1 : 0;
    const color = ChartTheme.pieColors[i % ChartTheme.pieColors.length];

    // labelpositie (iets naar buiten)
    const lx = cx + (r + 18) * Math.cos(mid * Math.PI / 180);
    const ly = cy + (r + 18) * Math.sin(mid * Math.PI / 180);

    return `
      <path d="M${cx},${cy} L${x1},${y1}
               A${r},${r} 0 ${large} 1 ${x2},${y2} Z"
            fill="${color}" stroke="#ffffff" stroke-width="2"/>
      ${showValues ? `
        <text x="${lx}" y="${ly}"
              text-anchor="middle"
              font-size="12"
              font-weight="800"
              fill="${ChartTheme.textMain}">
          ${v}
        </text>` : ""}
    `;
  }).join("");

  const legend = labels.map((l, i) => {
    const color = ChartTheme.pieColors[i % ChartTheme.pieColors.length];
    return `
      <g transform="translate(260, ${78 + i * 22})">
        <rect width="12" height="12" rx="3" fill="${color}"/>
        <text x="18" y="11"
              font-size="12"
              font-weight="700"
              fill="${ChartTheme.textMain}">
          ${l}
        </text>
      </g>`;
  }).join("");

  return `
  <svg viewBox="0 0 ${w} ${h}" width="100%"
       xmlns="http://www.w3.org/2000/svg"
       style="font-family: Inter, system-ui, sans-serif;">
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}"
          rx="14"
          fill="${ChartTheme.bg}"
          stroke="#e5e7eb"
          stroke-width="2.5"/>

    <text x="${w / 2}" y="28"
          text-anchor="middle"
          font-size="16"
          font-weight="900"
          fill="${ChartTheme.textMain}">
      ${title}
    </text>

    ${slices}

    <circle cx="${cx}" cy="${cy}" r="${r}"
            fill="none"
            stroke="#e5e7eb"/>

    ${legend}
  </svg>`;
}
window.svgPieChart = svgPieChart;

