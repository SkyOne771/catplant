const actionPaths = {
  plant:
    '<path d="M12 21v-9m0 3C4 16 3 9 3 9s9-2 9 6Zm0-3c0-8 8-9 8-9s2 9-8 9Z"/><path d="M7 21h10"/>',
  water:
    '<path d="M4 10h10l1 10H3l1-10Zm10 3 5-5 3 2-7 7M5 10V7a3 3 0 0 1 6 0v3M3 12H1v5h2m16-11 3 2"/><path d="m20 14-1 2m4-1-1 2"/>',
  tend: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="m8 15 11-12M16 15 5 3m7 8v1"/>',
  harvest:
    '<path d="M3 10h18l-2 11H5L3 10Zm3 0 6-8 6 8M2 10h20M8 14v3m4-3v3m4-3v3"/>',
};
function actionIcon(action) {
  return `<svg class="action-icon" data-action-icon="${action}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${actionPaths[action]}</svg>`;
}
function nextAction(p) {
  return p ? ["", "water", "tend", "harvest"][p.stage] : "plant";
}
const crops = [
  ["Carrot", "#e59b56", "carrot"],
  ["Tomato", "#d97965", "round"],
  ["Radish", "#cc7e8a", "root"],
  ["Pumpkin", "#dba058", "pumpkin"],
  ["Corn", "#e7c976", "corn"],
  ["Eggplant", "#9a83a6", "long"],
  ["Strawberry", "#d57c77", "berry"],
  ["Lettuce", "#91aa71", "lettuce"],
  ["Turnip", "#c9b4cb", "root"],
  ["Potato", "#c2a17b", "potato"],
];
function art(i, stage = 3) {
  let [name, color, type] = crops[i];
  let leaves =
    '<path d="M40 39Q18 40 21 21Q39 19 40 39Q40 17 57 15Q65 33 40 39" fill="#769a5d"/><path d="M40 43V22" stroke="#5f814f" stroke-width="3" fill="none"/>';
  let fruit = "";
  if (stage < 2)
    return `<svg viewBox="0 0 80 90" aria-hidden="true"><path d="M40 78V55" stroke="#789760" stroke-width="4"/><path d="M40 64Q17 65 23 49Q37 46 40 64Q41 44 58 45Q63 62 40 64" fill="#93ae72"/></svg>`;
  if (type === "carrot")
    fruit =
      '<path d="M23 40Q40 32 56 41L42 82Q39 88 35 78Z"/><path d="m27 51 10 2m9 9 6-2m-19 9 7 2" stroke="#bd793f" stroke-width="2"/>';
  if (["round", "pumpkin", "root", "berry"].includes(type))
    fruit = `<${type === "berry" ? "path" : "ellipse"} ${type === "berry" ? 'd="M21 42Q40 33 59 42Q56 65 40 79Q24 65 21 42Z"' : 'cx="40" cy="58" rx="23" ry="22"'}/>${type === "pumpkin" ? '<ellipse cx="40" cy="58" rx="11" ry="22" fill="none" stroke="#b78143" stroke-width="2"/>' : ""}${type === "root" ? '<path d="M35 77q10 12 15 2" stroke="#efe5d6" fill="none" stroke-width="4"/>' : ""}${type === "berry" ? '<path d="m29 48 2 3m17-4-1 4m-10 5 1 3m9 4-1 3m-11 3 1 3" stroke="#f7dda6" stroke-width="2"/>' : ""}`;
  if (type === "corn")
    fruit =
      '<ellipse cx="40" cy="51" rx="14" ry="31"/><path d="M40 81Q14 66 19 40Q37 48 40 81Q42 53 65 42Q66 70 40 81" fill="#88a46b"/><path d="M35 27v34m8-36v37m-15-25h25m-26 10h27m-25 10h25" fill="none" stroke="#d5b05c" stroke-width="1.5"/>';
  if (type === "long")
    fruit =
      '<path d="M33 36Q61 24 58 57Q55 87 26 79Q13 69 33 36Z"/><path d="M34 36l-9 9 19-1 12-9-15-2" fill="#77945c"/>';
  if (type === "lettuce")
    fruit =
      '<circle cx="40" cy="57" r="25"/><circle cx="27" cy="48" r="16" fill="#a9bf8b"/><circle cx="49" cy="45" r="17" fill="#9bb77c"/><path d="M40 79Q15 55 32 47Q43 45 45 60Q52 42 61 54Q68 69 40 79" fill="#85a567"/><path d="m40 77 4-25" stroke="#b4c994" fill="none" stroke-width="2"/>';
  if (type === "potato")
    fruit =
      '<path d="M18 57Q19 33 42 40Q67 40 62 62Q55 85 31 77Q15 72 18 57Z"/><g fill="#a78663"><circle cx="30" cy="53" r="2"/><circle cx="50" cy="59" r="2"/><circle cx="36" cy="69" r="2"/></g>';
  return `<svg viewBox="0 0 80 90" aria-hidden="true">${type === "potato" || type === "lettuce" ? "" : leaves}<defs><linearGradient id="crop-${i}" x2=".8" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".82"/></linearGradient></defs><g fill="url(#crop-${i})" stroke="${color}" stroke-width="1.5">${fruit}</g></svg>`;
}
const $ = (s) => document.querySelector(s);
let saved;
try {
  saved = JSON.parse(localStorage.getItem("catplant-garden"));
} catch {}
let state =
  saved?.version === 1
    ? saved
    : {
        version: 1,
        plots: Array(10).fill(null),
        harvests: 0,
        collection: Array(10).fill(0),
        joy: 60,
        day: 1,
      };
let selected = 0,
  tool = "plant",
  audio = null,
  soundOn = false;
const hints = {
  plant: "Pick a seed on the right, then tap an empty patch to plant it.",
  water: "Tap a thirsty sprout to give it a refreshing drink.",
  tend: "Tap a watered plant to give it care and help it bloom.",
  harvest: "Tap a ripe crop to gather a little happiness.",
};
const messages = [
  "“Look at you, making room for good things to grow.”",
  "“A little water, a little kindness. That’s all we need.”",
  "“You don’t have to do everything today. This is enough.”",
  "“Something lovely grew because you cared.”",
  "“Small steps count. Even the very tiny, paw-sized ones.”",
];
function save() {
  try {
    localStorage.setItem("catplant-garden", JSON.stringify(state));
  } catch {}
}
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => $("#toast").classList.remove("show"),
    3200,
  );
}
function render() {
  hideTooltip();
  mobilePlotInfo.textContent = "Tap a crop to see what it needs.";
  $("#plots").innerHTML = state.plots
    .map(
      (p, i) =>
        `<button class="plot ${p ? (p.stage === 3 ? "ready" : "planted") : "empty"}" data-plot="${i}" aria-describedby="plot-tooltip" aria-label="Patch ${i + 1}: ${p ? crops[p.crop][0] + ", " + ["", "needs water", "needs tending", "ready to harvest"][p.stage] : "empty"}">${p ? `<span class="plant-art">${art(p.crop, p.stage)}</span><span class="need" title="${nextAction(p)}">${actionIcon(nextAction(p))}</span><span class="plot-tag">${crops[p.crop][0]}</span>` : ""}</button>`,
    )
    .join("");
  $("#seeds").innerHTML = crops
    .map(
      (c, i) =>
        `<button class="seed ${selected === i ? "active" : ""}" data-seed="${i}" aria-label="Select ${c[0]} seeds" aria-pressed="${selected === i}">${art(i)}<span>${c[0]}</span></button>`,
    )
    .join("");
  $("#seed-info").innerHTML =
    `<strong>${crops[selected][0]} seeds</strong><br>A little water + a little love = something lovely.`;
  $("#harvest-count").textContent = state.harvests;
  $("#day").textContent = state.day;
  $("#collection-count").textContent =
    state.collection.filter(Boolean).length + "/10";
  $("#happiness-bar").style.width = state.joy + "%";
  $("#hearts").textContent = Array.from({ length: 5 }, (_, i) =>
    i < Math.round(state.joy / 20) ? "♥" : "♡",
  ).join(" ");
  const ready = state.plots.filter((p) => p?.stage === 3).length,
    planted = state.plots.filter(Boolean).length;
  $("#garden-status").textContent = ready
    ? `${ready} little ${ready === 1 ? "joy" : "joys"} ready to harvest`
    : planted
      ? `${planted} happy little ${planted === 1 ? "plant" : "plants"}`
      : "10 patches of possibility";
  save();
}
function choose(t) {
  tool = t;
  document.querySelectorAll("[data-tool]").forEach((b) => {
    b.classList.toggle("selected", b.dataset.tool === t);
    b.setAttribute("aria-pressed", b.dataset.tool === t);
  });
  $("#hint").textContent = hints[t];
}
function chime() {
  if (!soundOn || !audio) return;
  const o = audio.createOscillator(),
    g = audio.createGain();
  o.type = "sine";
  o.frequency.value = [523.25, 659.25, 783.99][Math.floor(Math.random() * 3)];
  g.gain.setValueAtTime(0.055, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.7);
  o.connect(g);
  g.connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + 0.7);
}
$("#seeds").addEventListener("click", (e) => {
  const b = e.target.closest("[data-seed]");
  if (!b) return;
  selected = Number(b.dataset.seed);
  choose("plant");
  render();
});
$("#tools").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tool]");
  if (b) choose(b.dataset.tool);
});
function act(i, action = tool) {
  const p = state.plots[i];
  if (action === "plant") {
    if (p)
      return toast("This little patch is already growing. Try an empty one.");
    state.plots[i] = { crop: selected, stage: 1 };
    toast(
      `${crops[selected][0]} planted. A tiny beginning, a lovely possibility.`,
    );
  } else if (!p) {
    return toast(
      "A little seed would feel right at home here. Choose Plant first.",
    );
  } else if (action === "water") {
    if (p.stage !== 1)
      return toast(
        "All watered and happy. " +
          (p.stage === 2
            ? "Try a little tending next."
            : "Ready for your harvest basket!"),
      );
    p.stage = 2;
    toast("A refreshing drink! Now give your plant a little tending.");
  } else if (action === "tend") {
    if (p.stage === 1)
      return toast("A little water first will help this sprout grow.");
    if (p.stage === 3)
      return toast("Your crop is happy and ripe. Time to harvest!");
    p.stage = 3;
    toast("A little love works wonders. Your crop is ready to harvest!");
  } else {
    if (p.stage !== 3)
      return toast(
        p.stage === 1
          ? "Let’s give this little sprout some water first."
          : "A little tending will help it ripen.",
      );
    state.harvests++;
    state.collection[p.crop]++;
    state.plots[i] = null;
    state.day = 1 + Math.floor(state.harvests / 10);
    toast(
      `One lovely ${crops[p.crop][0].toLowerCase()} for your basket. You grew that!`,
    );
  }
  state.joy = Math.min(100, state.joy + 2);
  $("#message").textContent =
    messages[Math.floor(Math.random() * messages.length)];
  chime();
  render();
  animateAction(i, action);
}
$("#plots").addEventListener("click", (e) => {
  const b = e.target.closest("[data-plot]");
  if (b) {
    const i = Number(b.dataset.plot);
    act(i);
    $(`[data-plot="${i}"]`).focus({ preventScroll: true });
  }
});
function show(content) {
  $("#modal-content").innerHTML = content;
  $("#modal").showModal();
}
$("#help").onclick = () =>
  show(
    "<h2>A little guide to growing</h2><p>Meet Miso, your garden companion. There’s no hurry here, and your plants will always wait for you.</p><p><strong>1. Plant</strong> — choose one of ten seeds, then tap an empty patch.<br><strong>2. Water</strong> — give your little sprout a drink.<br><strong>3. Tend</strong> — a little care helps your crop ripen.<br><strong>4. Harvest</strong> — gather your crop and plant something new.</p><p>Use the 1–4 keys to switch tools. Your garden saves on this device automatically. Collect all ten crops, or simply enjoy a quiet moment. ♡</p>",
  );
$("#collection-tab").onclick = () =>
  show(
    `<h2>Your little collection</h2><p>Every harvest is a small moment worth keeping. You’ve grown ${state.collection.filter(Boolean).length} of 10 crops.</p><div class="collection-grid">${crops.map((c, i) => `<div class="collection-item ${state.collection[i] ? "" : "locked"}">${art(i)}${c[0]}<br>${state.collection[i] ? state.collection[i] + " harvested" : "Not yet grown"}</div>`).join("")}</div>`,
  );
$("#garden-tab").onclick = () =>
  $("#scene").scrollIntoView({ behavior: "smooth", block: "center" });
$(".close").onclick = () => $("#modal").close();
$("#modal").onclick = (e) => {
  if (e.target === $("#modal")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
};
$("#reset").onclick = () => {
  show(
    '<h2>Reset your progress?</h2><p>This clears all planted crops, harvested crops, your collection, happiness, and day count on this device. This cannot be undone.</p><button id="confirm-reset" style="border:0;border-radius:10px;background:#73895d;color:white;padding:12px 20px">Reset progress</button> <button id="cancel-reset" style="border:0;background:none;padding:12px">Keep my garden</button>',
  );
  $("#cancel-reset").onclick = () => $("#modal").close();
  $("#confirm-reset").onclick = () => {
    clearTimeout(actionTimer);
    clearTimeout(arrivalTimer);
    clearInterval(footstepTimer);
    $("#cat").className = "cat";
    delete $("#cat").dataset.action;
    document
      .querySelectorAll(".action-fx,.paw-print,.walk-marker")
      .forEach((e) => e.remove());
    selected = 0;
    state = {
      version: 1,
      plots: Array(10).fill(null),
      harvests: 0,
      collection: Array(10).fill(0),
      joy: 60,
      day: 1,
    };
    render();
    choose("plant");
    $("#modal").close();
    $("#message").textContent =
      "“A fresh beginning. There’s so much good still to grow.”";
    toast("A new patch of possibility. Welcome back.");
  };
};
$("#sound").onclick = async () => {
  soundOn = !soundOn;
  if (soundOn) {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    await audio.resume();
    chime();
  }
  $("#sound").innerHTML =
    `${soundOn ? "♫" : "♫"} <span>Sound ${soundOn ? "on" : "off"}</span>`;
  $("#sound").setAttribute(
    "aria-label",
    `Turn ${soundOn ? "off" : "on"} garden sounds`,
  );
};
document.addEventListener("keydown", (e) => {
  if ($("#modal").open || e.ctrlKey || e.metaKey || e.altKey) return;
  if ("1234".includes(e.key))
    choose(["plant", "water", "tend", "harvest"][Number(e.key) - 1]);
});

// Tooltips live outside the rotated garden so their text stays level and readable.
const tooltip = document.createElement("div");
tooltip.id = "plot-tooltip";
tooltip.role = "tooltip";
tooltip.hidden = true;
document.body.append(tooltip);
const mobilePlotInfo = document.createElement("div");
mobilePlotInfo.className = "mobile-plot-info";
mobilePlotInfo.setAttribute("aria-live", "polite");
$(".toolbox").before(mobilePlotInfo);
function hideTooltip() {
  tooltip.hidden = true;
}
function showTooltip(plot) {
  const i = Number(plot.dataset.plot),
    p = state.plots[i];
  tooltip.innerHTML = p
    ? `<strong>${crops[p.crop][0]}</strong><span class="tooltip-step">${actionIcon(nextAction(p))}${["", "Thirsty sprout · Water next", "Growing happily · Tend next", "Ripe and lovely · Ready to harvest"][p.stage]}</span>`
    : `<strong>An empty little patch</strong><span class="tooltip-step">${actionIcon("plant")}Choose a seed, then use Plant.</span>`;
  if (matchMedia("(max-width:760px)").matches) {
    tooltip.hidden = true;
    mobilePlotInfo.innerHTML = tooltip.innerHTML;
    return;
  }
  tooltip.hidden = false;
  const r = plot.getBoundingClientRect(),
    t = tooltip.getBoundingClientRect();
  tooltip.style.left =
    Math.max(
      8,
      Math.min(innerWidth - t.width - 8, r.left + r.width / 2 - t.width / 2),
    ) + "px";
  tooltip.style.top = Math.max(8, r.top - t.height - 13) + "px";
}
$("#plots").addEventListener("pointerover", (e) => {
  const p = e.target.closest("[data-plot]");
  if (p) showTooltip(p);
});
$("#plots").addEventListener("pointerout", (e) => {
  if (!e.target.closest("[data-plot]")?.contains(e.relatedTarget))
    hideTooltip();
});
$("#plots").addEventListener("focusin", (e) => {
  const p = e.target.closest("[data-plot]");
  if (p) showTooltip(p);
});
$("#plots").addEventListener("focusout", hideTooltip);
addEventListener("scroll", hideTooltip, true);
addEventListener("resize", hideTooltip);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideTooltip();
});
let actionTimer = null,
  arrivalTimer = null,
  footstepTimer = null;
function animateAction(i, action) {
  const plot = $(`[data-plot="${i}"]`),
    scene = $("#scene"),
    cat = $("#cat"),
    r = plot.getBoundingClientRect(),
    garden = scene.getBoundingClientRect();
  const x = r.left + r.width / 2 - garden.left,
    y = r.top + r.height / 2 - garden.top;
  plot.classList.add("action-" + action);
  setTimeout(() => plot.classList.remove("action-" + action), 1600);
  walkTo(x, y, () => {
    cat.className = "cat doing-" + action;
    cat.dataset.action = {
      plant: "Planting a little hope",
      water: "A refreshing drink",
      tend: "A little love",
      harvest: "A lovely harvest",
    }[action];
    actionTimer = setTimeout(() => {
      cat.className = "cat";
      delete cat.dataset.action;
    }, 1350);
  });
  const fx = document.createElement("div");
  fx.className = "action-fx fx-" + action;
  fx.style.left = x + "px";
  fx.style.top = y + "px";
  fx.setAttribute("aria-hidden", "true");
  fx.innerHTML =
    action === "water"
      ? Array.from({ length: 7 }, (_, j) => `<i style="--n:${j}"></i>`).join("")
      : action === "plant"
        ? "<span>•</span><span>•</span><span>•</span>"
        : action === "tend"
          ? "<span>✧</span><span>♡</span><span>✧</span>"
          : "<span>✦</span><span>+1</span><span>✦</span>";
  scene.append(fx);
  setTimeout(() => fx.remove(), 1700);
}
function walkTo(x, y, onArrival) {
  const cat = $("#cat"),
    scene = $("#scene"),
    bounds = scene.getBoundingClientRect(),
    current = cat.getBoundingClientRect();
  clearTimeout(actionTimer);
  clearTimeout(arrivalTimer);
  clearInterval(footstepTimer);
  delete cat.dataset.action;
  const width = current.width,
    height = current.height;
  const left = Math.max(0, Math.min(bounds.width - width, x - width / 2));
  const bottom = Math.max(
    0,
    Math.min(bounds.height - height, bounds.height - y),
  );
  const dx = left - (current.left - bounds.left),
    dy = bounds.height - bottom - (current.bottom - bounds.top);
  const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : Math.min(3500, Math.max(300, (Math.hypot(dx, dy) / 155) * 1000));
  if (Math.abs(dx) > 3) cat.dataset.facing = dx < 0 ? "left" : "right";
  cat.style.transition = `left ${duration}ms cubic-bezier(.25,.1,.25,1), bottom ${duration}ms cubic-bezier(.25,.1,.25,1)`;
  cat.className = "cat walking";
  cat.style.left = left + "px";
  cat.style.bottom = bottom + "px";
  if (duration) {
    let step = 0;
    footstepTimer = setInterval(() => {
      const r = cat.getBoundingClientRect(),
        g = scene.getBoundingClientRect(),
        p = document.createElement("span");
      p.className = "paw-print";
      p.style.left =
        r.left + r.width / 2 - g.left + (step++ % 2 ? 8 : -8) + "px";
      p.style.top = r.bottom - g.top - 9 + "px";
      p.setAttribute("aria-hidden", "true");
      p.innerHTML =
        '<svg viewBox="0 0 20 22"><ellipse cx="10" cy="15" rx="5" ry="4"/><circle cx="3" cy="8" r="2.2"/><circle cx="8" cy="4" r="2.2"/><circle cx="14" cy="4" r="2.2"/><circle cx="18" cy="9" r="2.2"/></svg>';
      scene.append(p);
      setTimeout(() => p.remove(), 1000);
    }, 220);
  }
  arrivalTimer = setTimeout(() => {
    clearInterval(footstepTimer);
    cat.className = "cat arriving";
    setTimeout(() => cat.classList.remove("arriving"), 350);
    onArrival?.();
  }, duration);
}
$("#scene").addEventListener("click", (e) => {
  if (e.target.closest("[data-plot]")) return;
  const r = $("#scene").getBoundingClientRect();
  walkTo(e.clientX - r.left, e.clientY - r.top);
  const marker = document.createElement("span");
  marker.className = "walk-marker";
  marker.style.left = e.clientX - r.left + "px";
  marker.style.top = e.clientY - r.top + "px";
  marker.setAttribute("aria-hidden", "true");
  $("#scene").append(marker);
  setTimeout(() => marker.remove(), 850);
});
// Miso reacts to player actions; gardening remains manual.
render();
choose("plant");
$(".avatar").innerHTML = $("#cat svg").outerHTML;

$(".brand").href = import.meta.env.BASE_URL;

// A side-on rig gives Miso a real four-paw walking silhouette.
$("#cat").insertAdjacentHTML(
  "beforeend",
  `<svg class="walk-sprite" viewBox="0 0 150 160" aria-hidden="true">
<ellipse class="walk-shadow" cx="75" cy="146" rx="51" ry="7" fill="#687b4b" opacity=".2"/>
<g class="walk-rig">
<g class="walk-tail"><path d="M40 101C8 105 7 70 18 63" fill="none" stroke="#d99e66" stroke-width="13" stroke-linecap="round"/><path d="M14 78q-3-10 4-15" fill="none" stroke="#f3cc96" stroke-width="13" stroke-linecap="round"/></g>
<g class="leg leg-back-far"><path d="M48 109v26q-2 7 10 7h5" fill="none" stroke="#c99560" stroke-width="12" stroke-linecap="round"/></g>
<g class="leg leg-front-far"><path d="M101 110v25q-2 7 9 7h4" fill="none" stroke="#c99560" stroke-width="11" stroke-linecap="round"/></g>
<ellipse cx="74" cy="105" rx="42" ry="24" fill="#e8b47b"/><ellipse cx="83" cy="114" rx="24" ry="13" fill="#efc892"/>
<path d="m47 87 4 9m9-13 4 10m9-11 3 10" stroke="#bf8751" stroke-width="4" stroke-linecap="round"/>
<g class="leg leg-back-near"><path d="M48 111v25q0 8 13 6" fill="none" stroke="#edbd86" stroke-width="13" stroke-linecap="round"/><path d="M56 142h6" stroke="#f8d9aa" stroke-width="7" stroke-linecap="round"/></g>
<g class="leg leg-front-near"><path d="M99 111v25q0 8 13 6" fill="none" stroke="#edbd86" stroke-width="12" stroke-linecap="round"/><path d="M107 142h6" stroke="#f8d9aa" stroke-width="7" stroke-linecap="round"/></g>
<g class="walk-head"><path d="M89 91 82 49l22 13 22-12 2 32" fill="#edbd86" stroke="#c2925e" stroke-width="1.5"/><path d="m87 58 3 17 9-8m17 1 7-9 1 15" fill="#d99b87"/><ellipse cx="109" cy="82" rx="29" ry="25" fill="#efc48e"/><ellipse cx="129" cy="91" rx="15" ry="10" fill="#f8d8aa"/><path d="m138 86 7 3-6 5" fill="#b88170"/><path d="M118 79q5-6 9 0" fill="none" stroke="#604c3c" stroke-width="2.5" stroke-linecap="round"/><path d="M131 98q5 3 8-1" fill="none" stroke="#604c3c" stroke-width="1.8"/><path d="m106 61 1 8m9-9-2 8" stroke="#c28c55" stroke-width="3" stroke-linecap="round"/><ellipse cx="117" cy="90" rx="5" ry="3" fill="#df9d87"/><path d="m128 94-14 2m15 2-13 5" stroke="#ac7d56" stroke-width="1.5"/><path d="m89 102 29 2" stroke="#8b9d75" stroke-width="7" stroke-linecap="round"/><path d="m97 105 12 1-7 14" fill="#8b9d75"/></g>
</g></svg>`,
);

document
  .querySelectorAll("[data-tool]")
  .forEach(
    (button) =>
      (button.querySelector("span").innerHTML = actionIcon(
        button.dataset.tool,
      )),
  );
$(".basket").innerHTML = actionIcon("harvest");

const expandIcon =
  '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
const focusButton = $("#focus-garden");
focusButton.innerHTML = expandIcon + "<span>Expand</span>";
focusButton.onclick = () => {
  const expanded = document.body.classList.toggle("garden-expanded");
  focusButton.setAttribute("aria-pressed", expanded);
  focusButton.innerHTML =
    expandIcon + `<span>${expanded ? "Back" : "Expand"}</span>`;
  focusButton.title = expanded ? "Return to normal view" : "Expand the garden";
  hideTooltip();
  if (expanded) window.scrollTo(0, 0);
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("garden-expanded"))
    focusButton.click();
});

$("#reset-progress").onclick = () => $("#reset").click();
