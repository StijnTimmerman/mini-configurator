import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ============================================================================
   Mini 3D product configurator — a lounge chair built from primitives.
   Swap the palettes / buildChair() to configure a different product; the UI
   wiring reads everything from PALETTES + the data-part groups in index.html.
   ============================================================================ */

// Colors live here so the UI swatches and the 3D model stay in sync.
const PALETTES = {
  frame: [
    { name: "Walnut", hex: 0x6b4a2b },
    { name: "Oak", hex: 0xc8a06a },
    { name: "Black", hex: 0x1d1d20 },
    { name: "Chalk", hex: 0xece9f0 },
    { name: "Sage", hex: 0x8a9a7b },
  ],
  fabric: [
    { name: "Charcoal", hex: 0x3a3a40 },
    { name: "Sand", hex: 0xd8c4a0 },
    { name: "Terracotta", hex: 0xbf5f45 },
    { name: "Ocean", hex: 0x3f6f8f },
    { name: "Forest", hex: 0x39513f },
    { name: "Cream", hex: 0xe9e1d2 },
  ],
};
const FINISHES = {
  matte: { roughness: 0.85, metalness: 0.0 },
  satin: { roughness: 0.45, metalness: 0.05 },
  gloss: { roughness: 0.12, metalness: 0.1 },
};
const DEFAULTS = { frame: "Walnut", seat: "Charcoal", back: "Charcoal", finish: "matte" };

const partPalette = { frame: PALETTES.frame, seat: PALETTES.fabric, back: PALETTES.fabric };
const state = { ...DEFAULTS };

// ---- Three.js setup --------------------------------------------------------
const canvas = document.getElementById("view");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(2.0, 1.45, 2.6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1.8;
controls.maxDistance = 6;
controls.minPolarAngle = 0.15;
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.target.set(0, 0.6, 0);

// Lighting (environment does most of it; one directional light for the shadow)
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9aa5, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(3, 5, 2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 20;
key.shadow.camera.left = -3; key.shadow.camera.right = 3;
key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
key.shadow.bias = -0.0004;
scene.add(key);

// Contact shadow on a transparent ground so the CSS studio gradient shows through
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.ShadowMaterial({ opacity: 0.22 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---- The product -----------------------------------------------------------
function mat(hex) {
  const m = new THREE.MeshStandardMaterial({ color: hex, envMapIntensity: 0.7 });
  Object.assign(m, FINISHES[DEFAULTS.finish]);
  return m;
}
const materials = {
  frame: mat(colorOf("frame", DEFAULTS.frame)),
  seat: mat(colorOf("seat", DEFAULTS.seat)),
  back: mat(colorOf("back", DEFAULTS.back)),
};

function colorOf(part, name) {
  return partPalette[part].find((c) => c.name === name).hex;
}

function box(w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.castShadow = true;
  return m;
}

function buildChair() {
  const chair = new THREE.Group();

  // Four legs (the frame)
  const legPositions = [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]];
  for (const [x, z] of legPositions) {
    const leg = box(0.09, 0.46, 0.09, materials.frame);
    leg.position.set(x, 0.23, z);
    chair.add(leg);
  }

  // Seat cushion
  const seat = box(1.02, 0.16, 1.02, materials.seat);
  seat.position.set(0, 0.54, 0);
  chair.add(seat);

  // Backrest, tilted back a touch
  const back = box(1.02, 0.9, 0.16, materials.back);
  back.position.set(0, 1.05, -0.43);
  back.rotation.x = -0.12;
  chair.add(back);

  return chair;
}
scene.add(buildChair());

// ---- Apply configuration ---------------------------------------------------
function applyColor(part, name) {
  state[part] = name;
  materials[part].color.setHex(colorOf(part, name));
}
function applyFinish(name) {
  state.finish = name;
  for (const key of ["frame", "seat", "back"]) Object.assign(materials[key], FINISHES[name]);
}

// ---- UI wiring -------------------------------------------------------------
function buildSwatches() {
  document.querySelectorAll(".group[data-part]").forEach((group) => {
    const part = group.dataset.part;
    const wrap = group.querySelector(".swatches");
    partPalette[part].forEach((c) => {
      const b = document.createElement("button");
      b.className = "swatch";
      b.style.background = "#" + c.hex.toString(16).padStart(6, "0");
      b.title = c.name;
      b.dataset.name = c.name;
      b.setAttribute("aria-pressed", String(c.name === state[part]));
      b.addEventListener("click", () => {
        applyColor(part, c.name);
        wrap.querySelectorAll(".swatch").forEach((s) =>
          s.setAttribute("aria-pressed", String(s.dataset.name === c.name)));
        renderSummary();
      });
      wrap.appendChild(b);
    });
  });
}

const finishBar = document.getElementById("finish");
finishBar.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-finish]");
  if (!btn) return;
  applyFinish(btn.dataset.finish);
  finishBar.querySelectorAll("button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b === btn)));
  renderSummary();
});

const summaryEl = document.getElementById("summary");
function renderSummary() {
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  summaryEl.innerHTML = `
    <div><span>Frame</span><b>${state.frame}</b></div>
    <div><span>Seat</span><b>${state.seat}</b></div>
    <div><span>Backrest</span><b>${state.back}</b></div>
    <div><span>Finish</span><b>${cap(state.finish)}</b></div>`;
}

document.getElementById("reset").addEventListener("click", () => {
  Object.assign(state, DEFAULTS);
  applyColor("frame", DEFAULTS.frame);
  applyColor("seat", DEFAULTS.seat);
  applyColor("back", DEFAULTS.back);
  applyFinish(DEFAULTS.finish);
  document.querySelectorAll(".group[data-part]").forEach((group) => {
    const part = group.dataset.part;
    group.querySelectorAll(".swatch").forEach((s) =>
      s.setAttribute("aria-pressed", String(s.dataset.name === state[part])));
  });
  finishBar.querySelectorAll("button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.finish === DEFAULTS.finish)));
  renderSummary();
});

buildSwatches();
renderSummary();

// ---- Render loop + resize --------------------------------------------------
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
function animate() {
  requestAnimationFrame(animate);
  resize();
  controls.update();
  renderer.render(scene, camera);
}
animate();
window.addEventListener("resize", resize);
