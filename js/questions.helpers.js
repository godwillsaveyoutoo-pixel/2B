/* =========================
   Wiskunde Quest – question helpers
   Bouwt uniforme vraagobjecten
========================= */
function checkClickedCount(expected) {
  const on = document.querySelectorAll(".fraction-cell.on").length;
  return on === expected;
}

function svgImg(filename, size = 120) {
  return `
    <img 
      src="assets/svg/${filename}" 
      alt=""
      style="
        width:${size}px;
        max-width:100%;
        height:auto;
        display:block;
        margin:auto;
      "
    />
  `;
}

function qInput(
  topic,
  skill,
  prompt,
  answer,
  inputKind = "number",
  unit = null,
  visualHtml = null,
  tol = 0.01,
  sub = null,
  check = null,
  hasInlineInput = false   // 👈 NIEUW
) {
  return {
    kind: "input",
    topic,
    skill,
    prompt,
    answer,
    inputKind,
    unit,
    visualHtml,
    tol,
    sub,
    check,
    hasInlineInput
  };
}

function qRatio(
  topic,
  id,
  prompt,
  table,
  answer,
  unit = null,
  visual = null,
  
  tol = 0.01
) {

  const rowsHtml = table.rows.map(([left, right], i) => {
    return `
      <tr>
        <td class="ratioCell">${left}</td>
        <td class="ratioCell">
          ${
            right === null
              ? `<input
                   class="ratioInput"
                   data-ratio-input
                   inputmode="decimal"
                   autocomplete="off"
                 />`
              : `<span>${right}</span>`
          }
        </td>
      </tr>
    `;
  }).join("");

  const ratioTableHtml = `
    <div class="ratioWrap">
      <table class="ratioTable">
        <thead>
          <tr>
            <th>${table.leftLabel}</th>
            <th>${table.rightLabel}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  return {
    topic,
    id,
    kind: "input",          // blijft input → werkt met jouw game.js
    inputKind: "number",    // ✔ zorgt dat keypad correct verschijnt
    prompt,
    answer,
    tol,
    unit,

    visual: `
      ${visual ?? ""}
      ${ratioTableHtml}
    `
  };
}
function checkPercentGrid(expectedCount) {
  const cells = document.querySelectorAll(".percent-cell.active");
  return cells.length === expectedCount;
}



function qAngleMeasure(
  topic,
  skill,
  prompt,
  answerDeg,
  visualHtml,
  tol = 2,
  sub = "Tip: Shift + slepen om te draaien"
) {
  return qInput(topic, skill, prompt, answerDeg, "number", "°", visualHtml, tol, sub);
}


function qMc(
  topic,
  skill,
  prompt,
  options,
  answer,
  visualHtml = null,
  sub = null
) {
  return {
    kind: "mc",
    topic,
    skill,
    prompt,
    options,
    answer,
    answerKey: (typeof mcKey === "function" ? mcKey(answer) : String(answer ?? "")),
    visualHtml,
    sub,
  };
}

/* ---------- Exports ---------- */
window.qInput = qInput;
window.qMc = qMc;
window.qAngleMeasure = qAngleMeasure;
window.checkPercentGrid = checkPercentGrid;
window.checkClickedCount = checkClickedCount;
window.qRatio = qRatio;
window.svgImg = svgImg;
