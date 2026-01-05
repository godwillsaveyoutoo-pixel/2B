/* =========================
   Wiskunde Quest – ui.js
   UI wiring, modals, drawer,
   settings (GEEN screen-logica)
========================= */

/* ---------- Subtopics config ---------- */
/* (tijdelijk hier, later evt. naar topics.js) */
const SUBTOPICS = {
  massa: [
    { id: "convert", label: "Omrekenen" },
    { id: "context", label: "Context" },
    { id: "unit_choice", label: "Eenheid kiezen" },
    { id: "error", label: "Fouten herkennen" }
  ],
  gemmid: [
    { id: "median", label: "Mediaan" },
    { id: "mean", label: "Gemiddelde" }
  ],
  tijd: [
    { id: "clock_read", label: "Klok lezen" },
    { id: "convert", label: "Omrekenen" },
    { id: "time_add", label: "Tijd optellen" },
    { id: "time_sub", label: "Tijd aftrekken" }
  ],
  lijnen: [
    { id: "relations", label: "Relaties tussen lijnen" }
  ],
  hoeken: [
    { id: "angle_type", label: "Soorten hoeken" },
    { id: "measure", label: "Hoeken meten" }
  ],
  breuken: [
    { id: "simplify", label: "Vereenvoudigen" },
    { id: "fraction_of", label: "Breuk van een getal" },
    { id: "read_fraction", label: "Aflezen" },
    { id: "complement", label: "Aanvullen" },
    { id: "compare", label: "Vergelijken" }
  ],
  procent: [
    { id: "percent_of", label: "Percentage van" },
    { id: "discount", label: "Korting" },
    { id: "increase", label: "Verhoging" },
    { id: "complement", label: "Aanvullen tot 100%" },
    { id: "compare", label: "Vergelijken" },
    { id: "error", label: "Fouten" }
  ]
};

/* ---------- User pill ---------- */
function updateUserPill() {
  const pill = document.getElementById("pillUser");
  if (!pill) return;

  if (!authUser) {
    pill.textContent = "Niet ingelogd";
    updateNavVisibility();
    return;
  }

  if (profile.name) {
    const tag = profile.class ? ` • ${profile.class}` : "";
    const t = profile.role === "teacher" ? " 👩‍🏫" : "";
    pill.textContent = `${profile.name}${tag}${t}`;
  } else {
    pill.textContent = "Ingelogd";
  }
  updateNavVisibility();
}


function updateNavVisibility(){
  const teach = document.getElementById('navTeacher');
  if (!teach) return;
  const isTeach = !!(profile && profile.role === 'teacher');
  teach.style.display = isTeach ? '' : 'none';
}
/* ---------- Drawer ---------- */
async function openDrawer() {
  // na een role-wijziging in Supabase (student → teacher)
  // kan de UI nog 'oud' zijn tot je herlaadt.
  // Daarom: bij openen even het profiel verversen.
  try {
    await window.refreshRemoteProfile?.();
  } catch (_) {}
  $("#drawer")?.classList.add("open");
}
function closeDrawer() {
  $("#drawer")?.classList.remove("open");
}

/* ---------- Topic modal ---------- */
function openTopicModal(topic) {
  $("#topicModalTitle").textContent = topic.title;

  const badge = $("#topicModalBadges");
  const runBtn = document.getElementById("btnTopicRun");

  // Run lock: eerst oefenen?
  let lockInfo = "";
  if (runBtn) {
    const gate = !!profile?.settings?.gateRun;
    const isGlobal = topic?.id === "global";
    const a = prog?.practice?.[topic?.id]?.a ?? 0;
    const need = 8;
    const left = Math.max(0, need - a);
    const locked = gate && !isGlobal && left > 0;
    runBtn.disabled = locked;
    runBtn.classList.toggle("disabled", locked);
    if (locked) lockInfo = `Eerst oefenen: nog ${left} oefenvragen`;
  }

  if (badge) {
    const medal = prog?.medals?.[topic.id]
      ? `Behaald: ${medalEmoji(prog.medals[topic.id])}`
      : "Nog geen medaille";
    badge.textContent = lockInfo ? `${medal} • ${lockInfo}` : medal;
  }

  $("#topicModalBack")?.classList.add("open");
}


function closeTopicModal() {
  $("#topicModalBack")?.classList.remove("open");
}

/* ---------- Settings ---------- */
function renderSettings() {
  $("#settingsUser").textContent = authUser
    ? `${profile.name || "—"} • ${(profile.class || "2B")} ${profile.role === "teacher" ? "(teacher)" : ""}`
    : "Niet ingelogd";

  $("#autoOkState").textContent = profile.settings.autoOk ? "on" : "off";
  $("#soundState").textContent = profile.settings.sound ? "on" : "off";
  const g = document.getElementById("gateRunState");
  if (g) g.textContent = profile.settings.gateRun ? "on" : "off";
}

/* ---------- Event bindings ---------- */
document.addEventListener("DOMContentLoaded", () => {
  /* Drawer */
  $("#btnMenu")?.addEventListener("click", () => { openDrawer(); });
  $("#btnCloseDrawer")?.addEventListener("click", closeDrawer);

  $$(".drawer .item").forEach((item) => {
    item.addEventListener("click", () => {
      closeDrawer();
      const nav = item.dataset.nav;
      if (nav === "map") showScreen("scrMap");
      if (nav === "board") showScreen("scrBoard");
      if (nav === "settings") {
        renderSettings();
        showScreen("scrSettings");
      }
      if (nav === "stats") {
        window.renderMyStats?.();
        showScreen("scrStats");
      }
      if (nav === "teacher") {
        // zorg dat role up-to-date is vóór we beslissen
        Promise.resolve(window.refreshRemoteProfile?.())
          .finally(() => {
            window.renderTeacherDashboard?.();
            showScreen("scrTeacher");
          });
      }
    });
  });

  /* Settings toggles */
  $("#togAutoOk")?.addEventListener("click", () => {
    profile.settings.autoOk = !profile.settings.autoOk;
    saveProfile();
    renderSettings();
  });

  $("#togSound")?.addEventListener("click", () => {
    profile.settings.sound = !profile.settings.sound;
    saveProfile();
    renderSettings();
  });

  $("#togGateRun")?.addEventListener("click", () => {
    profile.settings.gateRun = !profile.settings.gateRun;
    saveProfile();
    renderSettings();
  });

  $("#btnCloseSettings")?.addEventListener("click", () => {
    showScreen(authUser ? "scrMap" : "scrStart");
  });

  $("#btnLogout")?.addEventListener("click", async () => {
    await logout();
    showScreen("scrStart");
  });

  /* Topic modal */
  $("#btnCloseTopic")?.addEventListener("click", closeTopicModal);

  $("#topicModalBack")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeTopicModal();
  });

  /* Start screen buttons */
  $("#btnStartLeader")?.addEventListener("click", () => {
    showScreen("scrBoard");
  });

  $("#btnStartSettings")?.addEventListener("click", () => {
    renderSettings();
    showScreen("scrSettings");
  });

  /* Auth tabs */
  $("#tabLogin")?.addEventListener("click", () => {
    $("#tabLogin").classList.add("on");
    $("#tabSignup").classList.remove("on");
    $("#paneLogin").hidden = false;
    $("#paneSignup").hidden = true;
  });

  $("#tabSignup")?.addEventListener("click", () => {
    $("#tabSignup").classList.add("on");
    $("#tabLogin").classList.remove("on");
    $("#paneSignup").hidden = false;
    $("#paneLogin").hidden = true;
  });

  /* Login */
  $("#btnLogin")?.addEventListener("click", async () => {
    try {
      $("#authMsg").textContent = "";
      await login(
        $("#loginUser").value,
        $("#loginPass").value
      );
    } catch (e) {
      $("#authMsg").textContent = e.message || "Login mislukt";
    }
  });

  /* Signup */
  $("#btnSignup")?.addEventListener("click", async () => {
    try {
      $("#authMsg").textContent = "";
      await signup({
        username: $("#signupUser").value,
        password: $("#signupPass").value,
        name: $("#signupName").value,
        className: $("#signupClass")?.value || "2B",
      });
    } catch (e) {
      $("#authMsg").textContent = e.message || "Account maken mislukt";
    }
  });


  // Fullscreen
  const fsBtn = $("#btnFullscreen");
  const syncFS = () => {
    if (!fsBtn) return;
    const on = !!document.fullscreenElement;
    fsBtn.textContent = on ? "⤢" : "⛶";
    fsBtn.title = on ? "Verlaat volledig scherm" : "Volledig scherm";
  };
  fsBtn?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (e) {
      console.warn("Fullscreen failed", e);
    }
    syncFS();
  });
  document.addEventListener("fullscreenchange", syncFS);
  syncFS();

  // Calculator overlay
  const calcOverlay = $("#calcOverlay");
  const calcLCD = $("#calcLCD");
  let calcExpr = "";

  function calcRender() {
    if (!calcLCD) return;
    const s = (calcExpr || "0").toString().replace(/\./g, ",");
    calcLCD.textContent = s.length > 22 ? "…" + s.slice(-22) : s;
  }

  function calcSafeEval(expr) {
    // allow digits, operators and parentheses only
    const cleaned = String(expr || "")
      .replace(/,/g, ".")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/[^0-9+\-*/().]/g, "");

    if (!cleaned) return 0;
    // prevent weird operator tails
    if (/[+\-*/.]$/.test(cleaned)) throw new Error("tail");
    // eslint-disable-next-line no-new-func
    return Function("return (" + cleaned + ")")();
  }

  function calcKey(k) {
    if (k === "C") {
      calcExpr = "";
      calcRender();
      return;
    }
    if (k === "⌫") {
      calcExpr = calcExpr.slice(0, -1);
      calcRender();
      return;
    }
    if (k === "=") {
      try {
        const v = calcSafeEval(calcExpr);
        // round tiny float errors
        const out = (Math.abs(v) < 1e-12) ? 0 : v;
        calcExpr = String(out);
      } catch (e) {
        calcExpr = "Err";
      }
      calcRender();
      return;
    }

    if (calcExpr === "Err") calcExpr = "";

    // Handle decimal separator (both "." and "," map to the same thing)
    if (k === "." || k === ",") {
      // Allow only one decimal point per number
      const lastOperator = Math.max(
        calcExpr.lastIndexOf("+"),
        calcExpr.lastIndexOf("-"),
        calcExpr.lastIndexOf("*"),
        calcExpr.lastIndexOf("/")
      );
      const currentNumber = calcExpr.slice(lastOperator + 1);
      if (currentNumber.includes(".") || currentNumber.includes(",")) return;
      calcExpr += ".";
    } else if (/[+\-*/]/.test(k)) {
      // prevent double operators
      if (!calcExpr) return;
      if (/[+\-*/]$/.test(calcExpr)) {
        calcExpr = calcExpr.slice(0, -1) + k;
      } else {
        calcExpr += k;
      }
    } else {
      calcExpr += k;
    }
    calcRender();
  }

  $("#btnCalc")?.addEventListener("click", () => {
    if (!calcOverlay) return;
    calcOverlay.classList.remove("hidden");
    calcExpr = "";
    calcRender();
  });
  $("#btnCloseCalc")?.addEventListener("click", () => {
    calcOverlay?.classList.add("hidden");
  });
  calcOverlay?.addEventListener("click", (e) => {
    if (e.target === calcOverlay) calcOverlay.classList.add("hidden");
  });
  $("#calcKeys")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    calcKey(b.dataset.k);
  });
  document.addEventListener("keydown", (e) => {
    if (!calcOverlay || calcOverlay.classList.contains("hidden")) return;
    if (e.key === "Escape") {
      calcOverlay.classList.add("hidden");
      return;
    }
    const map = { Enter: "=", Backspace: "⌫", Delete: "C" };
    const k = map[e.key] || e.key;
    if (/^[0-9]$/.test(k) || ["+", "-", "*", "/", "(", ")", ".", ",", "=", "⌫", "C"].includes(k)) {
      e.preventDefault();
      calcKey(k);
    }
  });

  // Help overlay
  $("#btnHelp")?.addEventListener("click", () => {
    const topicId = state.topic?.id;
    const help = HELP_CARDS?.[topicId];

    $("#helpTitle").textContent = topicId ? "Hulpkaart – " + state.topic.title : "Hulpkaart";

    $("#helpContent").innerHTML = help
      ? help()
      : "<p>Geen hulpkaart beschikbaar.</p>";

    $("#helpOverlay").classList.remove("hidden");
  });

  $("#btnCloseHelp")?.addEventListener("click", () => {
    $("#helpOverlay").classList.add("hidden");
  });

  // ------------------------------
  // Draggable calculator
  // ------------------------------
  // ui.js is loaded before the HTML markup in this project, so any DOM query
  // for .calcCard MUST happen after DOMContentLoaded.
  (function makeCalculatorDraggable() {
    const card = document.querySelector(".calcCard");
    const header = card?.querySelector(".helpHeader");
    if (!card || !header) return;

    // Restore last position (if any)
    try {
      const saved = JSON.parse(localStorage.getItem("calcPos") || "null");
      if (saved && saved.left && saved.top) {
        card.style.left = saved.left;
        card.style.top = saved.top;
        card.style.right = "auto";
        card.style.bottom = "auto";
      }
    } catch (_) {}

    let dragging = false;
    let activePointerId = null;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const startDrag = (clientX, clientY) => {
      dragging = true;
      card.classList.add("dragging");
      const rect = card.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      startLeft = rect.left;
      startTop = rect.top;
    };

    const moveDrag = (clientX, clientY) => {
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const nextLeft = startLeft + dx;
      const nextTop = startTop + dy;

      // Keep card within viewport (small padding)
      const pad = 8;
      const w = card.offsetWidth || 0;
      const h = card.offsetHeight || 0;
      const maxLeft = window.innerWidth - w - pad;
      const maxTop = window.innerHeight - h - pad;

      card.style.left = clamp(nextLeft, pad, maxLeft) + "px";
      card.style.top = clamp(nextTop, pad, maxTop) + "px";
      card.style.right = "auto";
      card.style.bottom = "auto";
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("dragging");
      try {
        localStorage.setItem("calcPos", JSON.stringify({
          left: card.style.left,
          top: card.style.top,
        }));
      } catch (_) {}
    };

    // Pointer events (mouse + touch + pen) => most reliable
    header.style.touchAction = "none";

    header.addEventListener("pointerdown", (e) => {
      // Ignore clicks on the close button
      if (e.target?.closest?.("button")) return;
      // Only left mouse button when it's a mouse
      if (e.pointerType === "mouse" && e.button !== 0) return;

      activePointerId = e.pointerId;
      startDrag(e.clientX, e.clientY);
      try { header.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });

    header.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      if (activePointerId != null && e.pointerId !== activePointerId) return;
      moveDrag(e.clientX, e.clientY);
      e.preventDefault();
    });

    const endPointer = (e) => {
      if (activePointerId != null && e.pointerId !== activePointerId) return;
      activePointerId = null;
      endDrag();
      try { header.releasePointerCapture(e.pointerId); } catch (_) {}
    };

    header.addEventListener("pointerup", endPointer);
    header.addEventListener("pointercancel", endPointer);
  })();
});



/* ---------- Exports ---------- */
window.updateUserPill = updateUserPill;
window.renderSettings = renderSettings;
window.openTopicModal = openTopicModal;
window.closeTopicModal = closeTopicModal;
