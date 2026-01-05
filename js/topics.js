/* =========================
   Wiskunde Quest – topics.js
   Topics + subtopics + icons
   (GEEN state, GEEN logica)
========================= */

/* =========================
   ICON FRAME
========================= */
const TOPIC_SVG_DIR = "assets/svg/";
function iconFrame(svgInner) {
  return `
  <svg viewBox="0 0 320 160" aria-hidden="true">
    <rect x="8" y="8" width="304" height="144" rx="18"
          fill="#f7fafc" stroke="#e5e7eb"/>
    ${svgInner}
  </svg>`;
}
function iconImg(file, x, y, w, h, opacity = 1) {
  const href = `${TOPIC_SVG_DIR}${file}`;
  return `
    <image
      href="${href}" xlink:href="${href}"
      x="${x}" y="${y}" width="${w}" height="${h}"
      opacity="${opacity}"
      preserveAspectRatio="xMidYMid meet"
    />
  `;
}
/* =========================
   MINI ICONS (inline SVG)
========================= */
function iconVierhoek() {
  return iconFrame(`
    <g>
      ${iconImg("vierhoeken.svg", 110, 8, 100, 135, 1)}

    </g>
  `);
}

function iconDriehoek() {
  return iconFrame(`
    <g>
      ${iconImg("driehoeken.svg", 110, 8, 100, 135, 1)}

    </g>
  `);
}

function iconTemperatuur() {
  return iconFrame(`
    <g>
      ${iconImg("thermometer.svg", 110, 8, 100, 135, 1)}

    </g>
  `);
}

function iconCirkel() {
  return iconFrame(`
    <g>
      ${iconImg("cirkels.svg", 110, 8, 100, 135, 1)}

    </g>
  `);
}

function iconSchaal() {
  return iconFrame(`
    <g>
      ${iconImg("schaal.svg", 110, 8, 100, 135, 1)}

    </g>
  `);
}

function iconVolume() {
  return iconFrame(`
    <g>
      ${iconImg("volume.svg", 110, 8, 100, 135, 1)}

    </g>
  `);
}

function iconPodium() {
  return iconFrame(`
    <g>
      ${iconImg("podium.svg", 110, 8, 100, 135, 1)}

    </g>
  `);
}

/* =========================
   TOPICS
========================= */
const TOPICS = [
  {
    id: "vierhoek",
    title: "Vierhoek",
    icon: iconVierhoek(),
    subtopics: {
      soorten: { title: "Soorten & eigenschappen", levels: ["easy", "normal", "hard"] },
      omtrek: { title: "Omtrek", levels: ["easy", "normal", "hard"] },
      oppervlakte: { title: "Oppervlakte", levels: ["easy", "normal", "hard"] },
      meten: { title: "Meten", levels: ["easy", "normal"] },
      vraagstukken: { title: "Vraagstukken", levels: ["easy", "normal", "hard"] },
      tekenen: { title: "Tekenmodus (raster)", levels: ["easy", "normal", "hard"] }
    }
  },
  {
    id: "driehoek",
    title: "Driehoek",
    icon: iconDriehoek(),
    subtopics: {
      zijden: { title: "Soorten (zijden)", levels: ["easy", "normal", "hard"] },
      hoeken: { title: "Soorten (hoeken)", levels: ["easy", "normal", "hard"] },
      omtrek: { title: "Omtrek", levels: ["easy", "normal", "hard"] },
      oppervlakte: { title: "Oppervlakte", levels: ["easy", "normal", "hard"] },
      meten: { title: "Meten", levels: ["easy", "normal"] }
    }
  },
  {
    id: "temperatuur",
    title: "Temperatuur",
    icon: iconTemperatuur(),
    subtopics: {
      thermometer: { title: "Thermometer aflezen", levels: ["easy", "normal", "hard"] },
      grafiek: { title: "Lijndiagram", levels: ["easy", "normal", "hard"] },
      verschillen: { title: "Meer of minder", levels: ["easy", "normal", "hard"] },
      gemmid: { title: "Gemiddelde & mediaan", levels: ["easy", "normal", "hard"] }
    }
  },
  {
    id: "cirkel",
    title: "Cirkel",
    icon: iconCirkel(),
    subtopics: {
      omtrek: { title: "Omtrek", levels: ["easy", "normal", "hard"] },
      oppervlakte: { title: "Oppervlakte", levels: ["easy", "normal", "hard"] },
      context: { title: "Vraagstukken", levels: ["easy", "normal", "hard"] }
    }
  },
  {
    id: "schaal",
    title: "Schaal",
    icon: iconSchaal(),
    subtopics: {
      basis: { title: "Schaal begrijpen", levels: ["easy", "normal", "hard"] },
      rekenen: { title: "Rekenen met schaal", levels: ["easy", "normal", "hard"] },
      context: { title: "Vraagstukken", levels: ["easy", "normal", "hard"] }
    }
  },
  {
    id: "volume",
    title: "Volume",
    icon: iconVolume(),
    subtopics: {
      unit: { title: "Eenheid kiezen", levels: ["easy", "normal", "hard"] },
      convert: { title: "Herleiden", levels: ["easy", "normal", "hard"] },
      schatten: { title: "Schatten", levels: ["easy", "normal", "hard"] },
      balk: { title: "Balk", levels: ["easy", "normal", "hard"] },
      kubus: { title: "Kubus", levels: ["easy", "normal", "hard"] }
    }
  },
  {
    id: "global",
    title: "Quest Run",
    icon: iconPodium(),
    subtopics: {
      mix: { title: "Mix", levels: ["normal", "hard"] }
    }
  }
];

/* =========================
   EXPORTS
========================= */
window.TOPICS = TOPICS;
window.getTopic = (id) => TOPICS.find(t => t.id === id) || null;
