/* =========================
   Wiskunde Quest – game.js
========================= */
let activeInput = null;
/* ---------- Game state ---------- */
let state = {
  mode: "practice",        // practice | run | test
  topic: null,             // { id, title }
  currentQ: null,

  score: 0,
  attempts: 0,
  correct: 0,

  timeLimitMs: 0,
  timeLeftMs: 0,
  timer: null,

  submitLocked: false,
  startedAt: 0,

  // toetsmodus
  testCount: 0,
  testLog: [],
  identity: null,
  proofDone: false,
  seed: 0,
  testId: "",
  _rng: null,

  // anti-herhaling (laatste vragen)
  recentQKeys: [],
};

/* ---------- Start game ---------- */
function startGame({ topic, mode, limit = 0, count = 0, identity = null }) {
  // ✅ TEMP: alleen vierhoek toelaten
  const allowed = new Set(["vierhoek"]);
  const tid = topic?.id || "";

  if (!allowed.has(tid)) {
    // kleine feedback (pas aan aan jouw UI)
    try { window.toast?.("⚠️ Alleen 'Vierhoek' is voorlopig actief."); } catch(_) {}
    return; // stop: start niet
  }
  // ---------- Basis state ----------
  state.mode = mode;
  state.topic = topic;

  // 🔁 belangrijk: automatisch gekozen logica resetten
  state.subtopic = null;
  state.level = null;
  state.recentQKeys = [];

  state.currentQ = null;
  state.score = 0;
  state.attempts = 0;
  state.correct = 0;
  state.submitLocked = false;

  
  state.triesThisQ = 0;
// ---------- Timer ----------
  // ---------- Timer ----------
  state.timeLimitMs = limit;
  state.timeLeftMs = limit;
  state.startedAt = Date.now();

  // ---------- Toetsmodus ----------
  state.testCount = Number(count) || 0;
  state.testLog = [];
  state.identity = identity;
  state.proofDone = false;

  // Seeded RNG + toets-ID (alleen toetsmodus)
  if (mode === "test") {
    state.seed = (Date.now() ^ ((Math.random() * 1e9) | 0)) >>> 0;
    state.testId = makeTestId(state.seed);
    state._rng = makeRng(state.seed);
  } else {
    state.seed = 0;
    state.testId = "";
    state._rng = null;
  }

  // onthoud voor "Nog eens"
  state.lastStart = {
    topic: { id: topic.id, title: topic.title },
    mode,
    limit: limit || 0,
    count: Number(count) || 0,
    identity,
    seed: state.seed,
    testId: state.testId,
  };

  // ---------- UI ----------
  $("#crumbTop").textContent = topic.title;

  $("#headTitle").textContent =
    mode === "practice" ? "Oefenen"
    : mode === "run"    ? "Run"
    :                     "Toets";

  $("#pillMode").style.display = "inline-flex";
  $("#pillMode").textContent = $("#headTitle").textContent;

  $("#pillTimer").style.display = limit ? "inline-flex" : "none";
  if (limit) {
    $("#pillTimer").textContent = "⏱ " + msToClock(limit);
  }

  // ---------- Start ----------
  showScreen("scrGame");

  if (limit) startTimer();
  updateHud();
  nextQuestion();
}


/* ---------- Next question ---------- */
function nextQuestion() {
  state.submitLocked = false;
  state.triesThisQ = 0;

  // reset UI
  $("#status").textContent = "";
  $("#choices").innerHTML = "";
  $("#inputRow").style.display = "none";
  $("#mcRow").style.display = "none";
  $("#visualWrap").style.display = "none";
  $("#visualWrap").innerHTML = "";
  // visual modifiers resetten (bv. vierhoeken zonder scroll)
  $("#visualWrap").classList.remove("noScroll");

  // reset actieve input (voor keypad)
  activeInput = null;

  const q = pickQuestion();
  if (!q) {
    console.warn("Geen vraag gevonden voor topic:", state.topic.id);
    return;
  }

  state.currentQ = q;
  // toetslog: maak alvast een rij (zodat ook 'niet beantwoord' kan bestaan indien tijd op is)
  if (state.mode === "test") {
    const correctStr =
      q.kind === "mc" ? String(q.answer ?? "") :
      q.answer != null ? String(q.answer) : "";

    const idx = state.testLog.length;
    state.testLog.push({
      q: String(q.prompt || ""),
      correct: correctStr,
      given: "",
      ok: null,
      points: 1,
      secs: Math.round((Date.now() - state.startedAt) / 1000),
    });
    q.__logIndex = idx;
  }

  updateHud();

  // prompt (wordt soms naar panelhead verplaatst)
  $("#qPrompt").textContent = q.prompt;
  // Tips worden niet meer getoond (leerlingen gebruiken hulpkaarten)
  $("#qSub").style.display = "none";
  $("#qSub").textContent = "";

  // visual: ondersteunt zowel oud (visualHtml) als nieuw (visual)
  const visual =
    q.visual ??
    q.visualHtml ??
    null;

  if (visual) {
    $("#visualWrap").innerHTML = visual;
    $("#visualWrap").style.display = "grid";
  } else {
    $("#visualWrap").innerHTML = "";
    $("#visualWrap").style.display = "none";
  }


  // layout hint: als er een visual is, geef die meer ruimte (compact laptop-friendly)
  // EN beslis of de vraagtekst bovenaan (panelhead) hoort of boven de visual (panelbody).
  const panelEl = document.querySelector('#scrGame .panel');
  const headQ = document.getElementById('headQ');

  const topic = String(q.topic || "").toLowerCase();
  // Vierhoeken: meestal geen interne scrollbalk, altijd mooi gecentreerd
  // (maar bv. tekenmodus heeft een toolbar en mag wél scrollen)
  const wantsNoScroll = !!visual && topic === "vierhoek" && q.noScroll !== false;
  $("#visualWrap").classList.toggle("noScroll", wantsNoScroll);
  const wantsPromptInHead = !!visual && ["tijd", "lijnen", "hoeken", "vierhoek"].includes(topic) && String(q.prompt || "").trim().length > 0;

  if (panelEl) {
    panelEl.classList.toggle('withVisual', !!visual);
    panelEl.classList.toggle('promptInHead', !!wantsPromptInHead);
  }

  if (headQ) {
    if (wantsPromptInHead) {
      headQ.textContent = String(q.prompt || '').trim();
      headQ.style.display = 'block';
      // laat in body enkel de subtekst staan
      $("#qPrompt").textContent = "";
    } else {
      headQ.textContent = '';
      headQ.style.display = 'none';
      $("#qPrompt").textContent = q.prompt || "";
    }
  }


  // render vraagtype
  if (q.kind === "mc") {
    renderMC(q);
  } else {
    renderInput(q);
  }

  // 🔧 activeer interactieve tijd-widgets (sleepklok)
  try {
    window.initInteractiveTimeWidgets?.(document.getElementById("visualWrap"));
  } catch (e) {
    console.warn("initInteractiveTimeWidgets failed", e);
  }

  // ✏️ activeer tekenmodus (vierhoeken)
  try {
    window.initDrawBoards?.(document.getElementById("visualWrap"));
  } catch (e) {
    console.warn("initDrawBoards failed", e);
  }


  // 🔑 ratio-inputs registreren voor keypad
  const ratioInputs = document.querySelectorAll("[data-ratio-input]");
  if (ratioInputs.length) {
    ratioInputs.forEach(inp => {
      inp.addEventListener("focus", () => {
        activeInput = inp;
      });
    });

    // automatisch eerste ratio-input focussen
    activeInput = ratioInputs[0];
    ratioInputs[0].focus();
  }
}
document.addEventListener("click", e => {
  const cell = e.target.closest(".percent-cell");
  if (!cell) return;

  cell.classList.toggle("active");
});


/* ---------- Pick question (MAGIE ZIT HIER) ---------- */
function pickQuestion() {
  // 1) GLOBAL / QUEST RUN: kies uit alle level-arrays van alle topics
  if (state.topic.id === "global") {
    const all = [];
    Object.values(BANK || {}).forEach((topic) =>
      Object.values(topic || {}).forEach((sub) =>
        Object.values(sub || {}).forEach((levelArr) => {
          if (Array.isArray(levelArr)) all.push(...levelArr);
        })
      )
    );

    if (!all.length) {
      console.warn("Geen globale vragen beschikbaar");
      return null;
    }
    return pickNonRepeated(all);
  }

  // 2) normaal topic: mix subtopics + level fallback
  const topicBank = BANK?.[state.topic.id];
  if (!topicBank) {
    console.warn("Geen topic:", state.topic.id);
    return null;
  }

  const acc = state.attempts
    ? Math.round((state.correct / state.attempts) * 100)
    : 60;

  const wanted = levelFromAccuracy(acc);
  const chain =
    wanted === "hard" ? ["hard", "normal", "easy"] :
    wanted === "normal" ? ["normal", "easy"] :
    ["easy"]; 

  const subtopicKeys = state.subtopic ? [state.subtopic] : Object.keys(topicBank);
  const candidates = [];

  for (const subKey of subtopicKeys) {
    const sub = topicBank[subKey];
    if (!sub || typeof sub !== "object") continue;

    let picked = null;
    for (const lv of chain) {
      if (Array.isArray(sub[lv]) && sub[lv].length) {
        picked = lv;
        break;
      }
    }
    // laatste redmiddel: eender welk level dat wél gevuld is
    if (!picked) {
      for (const lv of ["easy", "normal", "hard"]) {
        if (Array.isArray(sub[lv]) && sub[lv].length) {
          picked = lv;
          break;
        }
      }
    }

    if (picked) candidates.push(...sub[picked]);
  }

  if (!candidates.length) {
    console.warn("Geen vragen:", state.topic.id);
    return null;
  }

  return pickNonRepeated(candidates);
}

function pickNonRepeated(fns) {
  if (!Array.isArray(fns) || !fns.length) return null;
  state.recentQKeys = state.recentQKeys || [];

  const maxTries = Math.min(25, fns.length * 3);

  for (let i = 0; i < maxTries; i++) {
    const r = (state._rng ? state._rng() : Math.random());
    const fn = fns[Math.floor(r * fns.length)];
    let q;
    try {
      q = fn();
    } catch (e) {
      console.warn("Question factory crashed:", e);
      continue;
    }
    if (!q) continue;

    const key = `${q.topic}|${q.skill}|${q.prompt}`;
    if (fns.length <= 1 || !state.recentQKeys.includes(key)) {
      state.recentQKeys.push(key);
      if (state.recentQKeys.length > 8) state.recentQKeys.shift();
      return q;
    }
  }

  // fallback (alles zat in recent-lijst)
  const q = fns[Math.floor(Math.random() * fns.length)]();
  if (q) {
    const key = `${q.topic}|${q.skill}|${q.prompt}`;
    state.recentQKeys.push(key);
    if (state.recentQKeys.length > 8) state.recentQKeys.shift();
  }
  return q;
}

/* ---------- Render MC ---------- */
function renderMC(q) {
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.dataset.key = (typeof mcKey === "function" ? mcKey(opt) : String(opt ?? ""));
    btn.innerHTML = opt;

    btn.onclick = () => {
      $$(".choice").forEach(b => b.classList.remove("sel"));
      btn.classList.add("sel");
    };
    $("#choices").appendChild(btn);
  });
  $("#mcRow").style.display = "flex";
}

/* ---------- Unit helpers (dropdown) ---------- */
function _isMetricLinearUnit(u) {
  return ["mm", "cm", "dm", "m", "km"].includes(String(u || "").trim());
}
function _stripPow2(u) {
  return String(u || "").replace(/\s/g, "").replace(/²/g, "");
}

// Normaliseer q.unit naar een dropdown-config.
// - string (bv. "cm" of "cm²") → choices [cm, cm²]
// - object { choices:[...], answer:"..." }
// - null/undefined → disabled dropdown met "—"
function normalizeUnitMeta(unitRaw) {
  if (unitRaw && typeof unitRaw === "object" && Array.isArray(unitRaw.choices)) {
    const choices = unitRaw.choices.map(String);
    const answer = unitRaw.answer != null ? String(unitRaw.answer) : null;
    return {
      show: true,
      enabled: choices.length > 1,
      choices,
      answer,
    };
  }

  const u = (unitRaw == null) ? "" : String(unitRaw).trim();
  if (!u) {
    return { show: true, enabled: false, choices: ["—"], answer: null };
  }

  // cm² → [cm, cm²]
  const has2 = /²/.test(u);
  const base = _stripPow2(u);
  if (_isMetricLinearUnit(base)) {
    const a = base;
    const b = base + "²";
    const choices = [a, b];
    const answer = has2 ? b : a;
    return { show: true, enabled: true, choices, answer };
  }

  // andere eenheden (€, °, kg, l, ...) → dropdown met 1 optie
  return { show: true, enabled: false, choices: [u], answer: u };
}

/* ---------- Render input ---------- */
function renderInput(q) {
  const inp = activeInput || document.getElementById("mainInput");
  if (!inp) return;

  // reset
  inp.value = "";
  inp.disabled = false;
  inp.style.display = "";
  inp.placeholder = "antwoord";

  // detecteer inline widgets (ratio, fraction overlay, sleepklok, ...)
  const hasRatioInputs = !!document.querySelector("[data-ratio-input]");
  const hasFracInputs = !!document.querySelector(".fraction-overlay input");
  const hasClockSettable = !!document.querySelector("[data-clock-settable]");

  const domInline = hasRatioInputs || hasFracInputs || hasClockSettable;
  const inline = !!q.hasInlineInput || domInline;

  // click-only: de leerling klikt in de visual en drukt enkel op OK
  const clickOnly =
    typeof q.check === "function" &&
    (q.answer == null) &&
    !hasRatioInputs &&
    !hasFracInputs &&
    !hasClockSettable &&
    (q.inputKind == null);

  // inputRow: altijd tonen (zodat OK altijd beschikbaar is)
  $("#inputRow").style.display = "flex";
  $("#inputRow").classList.toggle("clickOnly", !!clickOnly);

  // unit dropdown (ook bij inline ratio/fraction mag de unit zichtbaar blijven)
  const unitSel = $("#unitSel");
  const unitChip = $("#unitChip");
  const um = normalizeUnitMeta(q.unit);
  q.__unitMeta = um;

  if (clickOnly) {
    if (unitSel) unitSel.style.display = "none";
    if (unitChip) unitChip.style.display = "none";
  } else {
    if (unitSel) {
      unitSel.innerHTML = "";
      // shuffle zodat de juiste eenheid niet altijd bovenaan staat
      const choices = (um.choices || []).slice();
      if (um.enabled && choices.length > 1) {
        for (let i = choices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [choices[i], choices[j]] = [choices[j], choices[i]];
        }
      }

      // placeholder zodat leerlingen écht kiezen bij 2 opties
      if (um.enabled && choices.length > 1) {
        const ph = document.createElement("option");
        ph.value = "";
        ph.textContent = "kies eenheid";
        ph.disabled = true;
        ph.selected = true;
        unitSel.appendChild(ph);
      }

      choices.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        unitSel.appendChild(opt);
      });
      unitSel.disabled = !um.enabled;
      unitSel.style.display = "inline-flex";

      // preselecteer: als er maar 1 optie is → die.
      if (!um.enabled || (choices.length === 1)) unitSel.value = choices[0] || "";
    }
    if (unitChip) {
      unitChip.style.display = "none";
      unitChip.textContent = "";
    }
  }

  // input zichtbaar?
  if (inline || clickOnly) {
    inp.style.display = "none";
  } else {
    inp.style.display = "";

    if (q.inputKind === "time") {
      inp.inputMode = "numeric";
      inp.placeholder = "HH:MM";
      inp.autocomplete = "off";
      inp.spellcheck = false;
    } else if (q.inputKind === "fraction") {
      inp.inputMode = "text";
      inp.placeholder = "bv. 3/4";
    } else {
      inp.inputMode = "decimal";
      inp.placeholder = "antwoord";
    }
  }

  // keypad: ook tonen bij inline ratio/fraction inputs (dan gaat de keypad naar activeInput)
  const wantsKeypad =
    !clickOnly && (
      q.inputKind === "number" ||
      q.inputKind === "time" ||
      q.inputKind === "fraction" ||
      hasRatioInputs ||
      hasFracInputs
    );

  $("#rightPanel").style.display = wantsKeypad ? "grid" : "none";

  const hint = document.getElementById("rpHint");
  if (hint) {
    hint.textContent =
      q.inputKind === "time" ? "HH:MM (24u)" :
      q.inputKind === "fraction" ? "bv. 3/4" :
      "";
  }
}



/* ---------- Stop game ---------- */
function stopGame() {
  clearInterval(state.timer);
  state.timer = null;
  state.submitLocked = true;

  // In toets/run wil "Stop" afronden i.p.v. stil terugkeren
  if (state.mode === "test" || state.mode === "run") {
    endGame();
    return;
  }
  showScreen("scrMap");
}

document.addEventListener("DOMContentLoaded", () => {

  // Waarschuwing: toetsmodus sluiten = risico
  window.addEventListener("beforeunload", (e) => {
    if (state.mode === "test" && !state.proofDone && (state.attempts < (state.testCount || Infinity))) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
  });

  // Keypad collapse (handig op kleine laptops)
  const rp = document.getElementById("rightPanel");
  const padT = document.getElementById("btnPadToggle");
  const setCollapsed = (on) => {
    if (!rp) return;
    rp.classList.toggle("collapsed", !!on);
    if (padT) padT.textContent = on ? "▸" : "▾";
    try{ localStorage.setItem("mr_pad_collapsed", on ? "1" : "0"); }catch(_){}
  };
  const autoCollapseIfNeeded = () => {
    try{
      const pref = localStorage.getItem("mr_pad_collapsed");
      if (pref === "1") return setCollapsed(true);
      if (pref === "0") return setCollapsed(false);
    }catch(_){}
    if (window.innerHeight < 760) setCollapsed(true);
  };
  padT?.addEventListener("click", () => setCollapsed(!rp.classList.contains("collapsed")));
  window.addEventListener("resize", () => {
    if (rp && rp.style.display !== "none") autoCollapseIfNeeded();
  });
  autoCollapseIfNeeded();


  $("#btnStop")?.addEventListener("click", stopGame);
});


function submitAnswer() {
  if (state.submitLocked || !state.currentQ) return;

  const q = state.currentQ;

  // MC: er moet een keuze geselecteerd zijn
  if (q.kind === "mc") {
    const sel = $(".choice.sel");
    if (!sel) return;
  }

  state.submitLocked = true;

  const ratioInp = document.querySelector("[data-ratio-input]");
  const mainInput = $("#mainInput");
  const unitSel = $("#unitSel");

  const raw =
    ratioInp?.value ??
    mainInput?.value ??
    "";

  // ✅ lege invoer: niet tellen als poging, niet doorgaan
  if (q.kind !== "mc" && !q.drawBoardId && !ratioInp) {
    if ((raw ?? "").trim() === "") {
      $("#status").textContent = "Vul eerst een antwoord in.";
      $("#status").className = "status err";
      state.submitLocked = false;
      try { mainInput?.focus(); } catch (_) {}
      return;
    }
  }

  // ✅ Unit dropdown (alleen wanneer UI zichtbaar is)
  let chosenUnit = "";
  const unitVisible = (q.kind !== "mc") && unitSel && unitSel.style.display !== "none";
  if (unitVisible) chosenUnit = String(unitSel.value ?? "");

  const um = (q.kind !== "mc") ? (q.__unitMeta || normalizeUnitMeta(q.unit)) : null;
  if (q.kind !== "mc") q.__unitMeta = um;

  const needsUnitChoice = unitVisible && um?.enabled && Array.isArray(um.choices) && um.choices.length > 1;
  if (needsUnitChoice && !chosenUnit) {
    $("#status").textContent = "Kies eerst de juiste eenheid.";
    $("#status").className = "status err";
    state.submitLocked = false;
    try { unitSel?.focus(); } catch (_) {}
    return;
  }

  // ✅ Antwoord check
  let ok = false;
  try {
    if (typeof q.check === "function") {
      ok = !!q.check(raw);

    } else if (q.kind === "mc") {
      const sel = $(".choice.sel");
      const aKey = q.answerKey ?? (typeof mcKey === "function" ? mcKey(q.answer) : String(q.answer ?? ""));
      ok = (sel?.dataset.key ?? "") === aKey;

    } else if (q.inputKind === "time") {
      const a = parseTimeNL(raw);
      const b = parseTimeNL(q.answer);
      ok = !!a && !!b && formatTime(a.h, a.m) === formatTime(b.h, b.m);

    } else if (q.inputKind === "fraction") {
      const a = parseFractionNL(raw);
      const b = parseFractionNL(q.answer);
      ok = fractionEqual(a, b);

    } else {
      const val = parseNumNL(raw);
      ok = !Number.isNaN(val) && Math.abs(val - q.answer) <= (q.tol ?? 0.01);
    }
  } catch (e) {
    console.error("Check failed", e);
    ok = false;
  }

  // eenheidscheck toevoegen (indien geactiveerd)
  if (um?.enabled && um?.answer) {
    ok = ok && (chosenUnit === um.answer);
  }

  // ✅ Tel poging pas wanneer er effectief gecontroleerd is
  state.attempts++;

  // toetslog update
  if (state.mode === "test") {
    let givenStr = "";
    if (q.kind === "mc") {
      const sel = $(".choice.sel");
      givenStr = sel ? sel.textContent : "";
    } else {
      const hasUnitUI = unitVisible;
      if (hasUnitUI && chosenUnit) givenStr = `${raw} ${chosenUnit}`;
      else givenStr = raw;
    }

    const li = q.__logIndex;
    if (li != null && state.testLog[li]) {
      state.testLog[li].given = String(givenStr ?? "");
      state.testLog[li].ok = !!ok;
      state.testLog[li].secs = Math.round((Date.now() - state.startedAt) / 1000);
    }
  }

  if (ok) {
    state.correct++;
    state.score++;
    state.triesThisQ = 0;
    $("#status").textContent = "✓ Juist";
    $("#status").className = "status ok";
  } else {
    const msg = q.drawBoardId
      ? "✗ Niet juist. Pas je tekening aan."
      : "✗ Fout.";
    $("#status").textContent = msg;
    $("#status").className = "status err";
  }

  // 🎨 Kleurflash
  try {
    const panel = document.querySelector('#scrGame .panel');
    if (panel) {
      panel.classList.remove('flashOk', 'flashErr');
      void panel.offsetWidth;
      panel.classList.add(ok ? 'flashOk' : 'flashErr');
      setTimeout(() => panel.classList.remove('flashOk', 'flashErr'), 420);
    }
  } catch (_) {}

  // ✅ progress (geen toetsmodus)
  try {
    if (state.mode !== "test") {
      updateSkill?.(q.topic, q.skill, ok);
    }
    if (state.mode === "practice") {
      const t = q.topic;
      if (t && t !== "global") {
        prog.practice = prog.practice || {};
        const p = prog.practice[t] || { a: 0, c: 0 };
        p.a++;
        if (ok) p.c++;
        prog.practice[t] = p;
        saveProg?.();
      }
    }
  } catch (e) {
    console.warn("Progress update failed", e);
  }

  // toetsmodus stop: na N vragen meteen naar resultaat
  if (state.mode === "test" && state.testCount && state.attempts >= state.testCount) {
    setTimeout(endGame, 350);
    return;
  }

  // ✅ oefenmodus: max 2 pogingen per oefening
  if (!ok && state.mode === "practice") {
    state.triesThisQ = (state.triesThisQ || 0) + 1;
    const remaining = 2 - state.triesThisQ;

    if (remaining > 0) {
      const msg = q.drawBoardId
        ? "✗ Niet juist. Pas je tekening aan en probeer opnieuw." 
        : "✗ Fout. Probeer opnieuw.";
      $("#status").textContent = msg;
      $("#status").className = "status err";
      state.submitLocked = false;
      return;
    }

    $("#status").textContent = "✗ Fout. Volgende oefening.";
    $("#status").className = "status err";
    setTimeout(nextQuestion, 900);
    return;
  }

  setTimeout(nextQuestion, 650);
}


/* ---------- Timer ---------- *//* ---------- Timer ---------- */
function startTimer() {
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.timeLeftMs -= 1000;
    $("#pillTimer").textContent =
      "⏱ " + msToClock(state.timeLeftMs);
    updateHud();
    if (state.timeLeftMs <= 0) endGame();
  }, 1000);
}

/* ---------- End game ---------- */
function endGame() {
  clearInterval(state.timer);

  const acc = state.attempts
    ? Math.round((state.correct / state.attempts) * 100)
    : 0;

  const duration_ms = Math.max(0, Date.now() - (state.startedAt || Date.now()));

  // 🏆 Run: medaille + best run + leaderboard post
  if (state.mode === "run") {
    try {
      const topicId = state.topic?.id || "default";
const medal = typeof medalForScore === "function"
  ? medalForScore(state.score, topicId)
  : "";


      const medalRank = (m) =>
        m === "gold" ? 3 : m === "silver" ? 2 : m === "bronze" ? 1 : 0;

      // bestRun update
      prog.bestRun = prog.bestRun || {};
      const prev = prog.bestRun[topicId];
      const isBetter = !prev
        || state.score > (prev.score ?? -1)
        || (state.score === (prev.score ?? -1) && acc > (prev.acc ?? -1))
        || (state.score === (prev.score ?? -1) && acc === (prev.acc ?? -1) && duration_ms < (prev.duration_ms ?? 9e15));

      if (isBetter) {
        prog.bestRun[topicId] = {
          score: state.score,
          acc,
          duration_ms,
          at: Date.now(),
          medal,
        };
      }

      // medaille only upgrade
      if (topicId && topicId !== "global") {
        prog.medals = prog.medals || {};
        const prevMedal = prog.medals[topicId] || "";
        if (medalRank(medal) > medalRank(prevMedal)) {
          prog.medals[topicId] = medal;
        }
      }

      saveProg?.();

      // leaderboard
      const mode = topicId === "global" ? "global" : "topic";
      const topic = topicId === "global" ? "global" : topicId;
      window.postScore?.({ mode, topic, score: state.score, acc, duration_ms });
      window.refreshBoards?.();
    } catch (e) {
      console.warn("Run finalize failed", e);
    }
  }

  $("#resTitle").textContent =
    state.mode === "test" ? "Toetsresultaat" : "Resultaat";

  // resultaatregel (met medaille waar relevant)
  let extra = "";
  if (state.mode === "run") {
    try {
      const topicId = state.topic?.id || "";
      const medal =
  prog?.medals?.[topicId] ||
  (typeof medalForScore === "function"
    ? medalForScore(state.score, topicId)
    : "");

      const em = medalEmoji?.(medal) || "";
      if (em) extra = ` • Medaille: ${em}`;
    } catch (_) {}
  }
  $("#resLine").textContent = `Score: ${state.score} • ${acc}% juist${extra}`;

  // Supabase: log run-sessie (samenvatting)
  if (state.mode === "run") {
    try {
      const elapsedSec = Math.round((Date.now() - state.startedAt) / 1000);
      const nm = state.identity?.name || window.profile?.name || window.profile?.username || "";
      const cls = state.identity?.class || window.profile?.class || "2B";
      const summaryRun = {
        name: nm,
        class: cls,
        mode: "run",
        topicId: state.topic?.id || "",
        seconds: elapsedSec,
        timeLimitSec: Math.round((state.timeLimitMs || 0) / 1000),
        score: state.score,
        total: state.attempts,
        correct: state.correct,
        pct: state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0,
      };
      if (typeof window.logTestRun === "function") {
        window.logTestRun(summaryRun);
      }
    } catch (_) {}
  }


  // Bewijsje (toetsmodus): automatisch downloaden na afloop
  if (state.mode === "test" && !state.proofDone) {
    state.proofDone = true;

    try {
      // vul onbeantwoorde rijen aan
      state.testLog.forEach(r => {
        if (r && r.ok == null) { r.ok = false; r.given = r.given || "—"; }
      });

      const metaId = document.querySelector('meta[name="x-game-id"]')?.content || document.title || "Wiskunde Quest";
      const elapsedSec = Math.round((Date.now() - state.startedAt) / 1000);

      const nm =
        state.identity?.name ||
        window.profile?.name ||
        window.profile?.username ||
        "";

      const cls =
        state.identity?.class ||
        window.profile?.class ||
        "";

      const flags = (state.identity && typeof state.identity === "object" && state.identity.flags) ? state.identity.flags : {};

      const goals = [
        `Topic: ${state.topic?.title || "—"}`,
        `Aantal vragen: ${state.testCount || state.testLog.length}`,
        `Tijdslimiet: ${state.timeLimitMs ? msToClock(state.timeLimitMs) : "geen"}`
      ];

      const summary = {
        name: nm,
        class: cls,
        gameId: metaId,
        mode: "toets",
        seconds: elapsedSec,
        timeLimitSec: Math.round((state.timeLimitMs || 0) / 1000),
        score: state.score,
        total: state.testCount || state.testLog.length,
        testId: state.testId || "",
        seed: state.seed || 0,
        goals,
        flags,
        accommodations: flags?.dyscalculie ? ["dyscalculie"] : [],
        questions: state.testLog.map(r => ({
          q: r.q,
          correct: r.correct,
          given: r.given,
          ok: r.ok,
          points: r.points,
          secs: r.secs
        }))
      };

      // Hash + JSON export (anti-discussie + voor jouw administratie)
      (async () => {
        try{
          summary.hash = await computeProofHash(summary);
        }catch(_){}
        try{
          window.MR_SHARED?.trySharedProof?.(summary);
        }catch(_){}
        // Supabase: log toetsresultaat (handig voor dashboards)
        try{
          if (typeof window.logTestRun === 'function') {
            await window.logTestRun(summary);
          }
        }catch(_){}
        try{
          const base = String(nm||"leerling").trim().replace(/[^\w\s-]+/g,"").replace(/\s+/g,"_").slice(0,80) || "leerling";
          const fn = `bewijs_${base}_${(cls||"").toString().replace(/\s+/g,"_")}_${(summary.testId||"toets")}.json`;
          const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = fn.replace(/_+/g,"_");
          document.body.appendChild(a);
          a.click();
          setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        }catch(_){}
      })();
;
    } catch (e) {
      console.warn("Proof generation failed", e);
    }
  }

  showScreen("scrResult");
}

/* ---------- UI ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // ---------- Keypad ----------
document.querySelectorAll("#keypad .key").forEach(btn => {
  btn.addEventListener("click", () => {
    const k = btn.dataset.k;
    if (k === ",") k = ".";              // intern met punt werken
    const inp = activeInput || document.getElementById("mainInput");
    if (!inp) return;

    if (!k) {
      inp.value += btn.textContent;
    } else if (k === "back") {
      inp.value = inp.value.slice(0, -1);
    } else if (k === "clear") {
      inp.value = "";
    } else if (k === "comma") {
      if (!inp.value.includes(",")) inp.value += ",";
    } else if (k === "slash") {
      inp.value += "/";
    } else if (k === "colon") {
      if (!inp.value.includes(":")) {
        if (inp.value.length === 0) inp.value = "00";
        if (inp.value.length === 1) inp.value = "0" + inp.value;
        inp.value += ":";
      }
    }

 else if (k === "minus") {
      if (!inp.value.startsWith("-")) inp.value = "-" + inp.value;
    } else if (k === "ok") {
      submitAnswer();
    }
  });
});

  $("#btnOkInline")?.addEventListener("click", submitAnswer);
  $("#btnOkMc")?.addEventListener("click", submitAnswer);
  $("#btnResBack")?.addEventListener("click", () => {
    window.renderTopicMap?.();
    showScreen("scrMap");
  });
  $("#btnResAgain")?.addEventListener("click", () => {
    if (state.lastStart) startGame(state.lastStart);
    else {
      window.renderTopicMap?.();
      showScreen("scrMap");
    }
  });
});

function makeRng(seed){
  let s = (Number(seed) >>> 0) || 1;
  return function(){
    // LCG (Numerical Recipes)
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pad2(n){ return String(n).padStart(2, "0"); }
function makeTestId(seed){
  const d = new Date();
  const stamp = `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  const tail = (seed >>> 0).toString(16).toUpperCase().padStart(8,"0").slice(0,6);
  return `T-${stamp}-${tail}`;
}

function stableStringify(value){
  const seen = new WeakSet();
  const norm = (v) => {
    if (v && typeof v === "object"){
      if (seen.has(v)) return "[Circular]";
      seen.add(v);
      if (Array.isArray(v)) return v.map(norm);
      const out = {};
      Object.keys(v).sort().forEach(k => { out[k] = norm(v[k]); });
      return out;
    }
    return v;
  };
  return JSON.stringify(norm(value));
}

async function sha256Hex(str){
  const buf = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,"0")).join("");
}

async function computeProofHash(summary){
  try{
    const hex = await sha256Hex(stableStringify(summary));
    return hex.slice(0, 12).toUpperCase();
  }catch(_){
    return "";
  }
}

// HUD helpers
function setHudVisible(on){
  const el = $("#hudLine");
  if (!el) return;
  el.style.display = on ? "" : "none";
}
function updateHud(){
  // HUD compact houden: toon in topbar (pill), en verberg de oude HUD-lijn
  const line = $("#hudLine");
  if (line) line.style.display = "none";

  const pill = $("#pillHud");
  if (!pill) return;

  if (state.mode !== "test" && state.mode !== "run"){
    pill.style.display = "none";
    pill.textContent = "";
    return;
  }

  pill.style.display = "inline-flex";
  const total = state.mode === "test" ? (state.testCount || state.testLog.length || 0) : 0;
  const cur = state.mode === "test" ? (state.testLog.length || 0) : 0;

  const left = state.mode === "test"
    ? `Vraag ${Math.max(1, cur)}/${total || "?"}`
    : `Run: ${state.score} p`;

  const right = (state.timeLimitMs > 0)
    ? "⏱ " + msToClock(state.timeLeftMs)
    : "⏱ ∞";

  pill.textContent = `${left} • ${right}`;
}


