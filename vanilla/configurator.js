import { createConfigurator, partPalette, DEFAULTS } from "../core/configurator-core.js";

// The Three.js scene + state machine lives in the shared core; this file only
// wires up the plain-DOM controls. The React/Vue/Angular versions do the same
// against the same core.
const cfg = createConfigurator(document.getElementById("view"), { initial: DEFAULTS });

// Build the colour swatches from the core's palettes (single source of truth).
document.querySelectorAll(".group[data-part]").forEach((group) => {
  const part = group.dataset.part;
  const wrap = group.querySelector(".swatches");
  partPalette[part].forEach((c) => {
    const b = document.createElement("button");
    b.className = "swatch";
    b.style.background = "#" + c.hex.toString(16).padStart(6, "0");
    b.title = c.name;
    b.dataset.name = c.name;
    b.addEventListener("click", () => cfg.setColor(part, c.name));
    wrap.appendChild(b);
  });
});

const finishBar = document.getElementById("finish");
finishBar.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-finish]");
  if (btn) cfg.setFinish(btn.dataset.finish);
});

document.getElementById("reset").addEventListener("click", () => cfg.reset());

// Reflect core state -> UI (active swatch rings, finish, summary).
const summaryEl = document.getElementById("summary");
const cap = (s) => s[0].toUpperCase() + s.slice(1);
function render(s) {
  document.querySelectorAll(".group[data-part]").forEach((group) => {
    const part = group.dataset.part;
    group.querySelectorAll(".swatch").forEach((sw) =>
      sw.setAttribute("aria-pressed", String(sw.dataset.name === s[part])));
  });
  finishBar.querySelectorAll("button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.finish === s.finish)));
  summaryEl.innerHTML =
    `<div><span>Frame</span><b>${s.frame}</b></div>` +
    `<div><span>Seat</span><b>${s.seat}</b></div>` +
    `<div><span>Backrest</span><b>${s.back}</b></div>` +
    `<div><span>Finish</span><b>${cap(s.finish)}</b></div>`;
}
cfg.onChange(render);
render(cfg.getState());
