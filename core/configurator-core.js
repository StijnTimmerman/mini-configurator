import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ============================================================================
   Framework-agnostic configurator core.

   `createConfigurator(canvas, options)` sets up the Three.js scene (a lounge
   chair built from primitives) and returns an imperative API. It knows nothing
   about the DOM controls — the vanilla page and the React/Vue/Angular wrappers
   all build their own UI from PALETTES and drive the scene through this API.

   API:
     setColor(part, name)   part = "frame" | "seat" | "back"
     setFinish(name)        name = "matte" | "satin" | "gloss"
     reset()
     getState()             -> { frame, seat, back, finish }
     onChange(fn)           subscribe to state changes; returns an unsubscribe fn
     dispose()              tear down (stop RAF, drop GL resources, listeners)
   ============================================================================ */

export const PALETTES = {
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
export const FINISHES = {
  matte: { roughness: 0.85, metalness: 0.0 },
  satin: { roughness: 0.45, metalness: 0.05 },
  gloss: { roughness: 0.12, metalness: 0.1 },
};
export const DEFAULTS = { frame: "Walnut", seat: "Charcoal", back: "Charcoal", finish: "matte" };
// Which palette each configurable part draws from.
export const partPalette = { frame: PALETTES.frame, seat: PALETTES.fabric, back: PALETTES.fabric };

const colorOf = (part, name) => partPalette[part].find((c) => c.name === name).hex;

export function createConfigurator(canvas, options = {}) {
  const state = { ...DEFAULTS, ...options.initial };
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn({ ...state }));

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

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

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: 0.22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const makeMat = (hex) => {
    const m = new THREE.MeshStandardMaterial({ color: hex, envMapIntensity: 0.7 });
    Object.assign(m, FINISHES[state.finish]);
    return m;
  };
  const materials = {
    frame: makeMat(colorOf("frame", state.frame)),
    seat: makeMat(colorOf("seat", state.seat)),
    back: makeMat(colorOf("back", state.back)),
  };

  const chair = new THREE.Group();
  const box = (w, h, d, material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.castShadow = true;
    return m;
  };
  for (const [x, z] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) {
    const leg = box(0.09, 0.46, 0.09, materials.frame);
    leg.position.set(x, 0.23, z);
    chair.add(leg);
  }
  const seat = box(1.02, 0.16, 1.02, materials.seat);
  seat.position.set(0, 0.54, 0);
  chair.add(seat);
  const back = box(1.02, 0.9, 0.16, materials.back);
  back.position.set(0, 1.05, -0.43);
  back.rotation.x = -0.12;
  chair.add(back);
  scene.add(chair);

  // --- render loop + resize ---
  let raf = 0;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };
  const tick = () => {
    raf = requestAnimationFrame(tick);
    resize();
    controls.update();
    renderer.render(scene, camera);
  };
  tick();
  window.addEventListener("resize", resize);

  // --- public API ---
  return {
    PALETTES, FINISHES, DEFAULTS, partPalette,
    setColor(part, name) {
      state[part] = name;
      materials[part].color.setHex(colorOf(part, name));
      emit();
    },
    setFinish(name) {
      state.finish = name;
      for (const k of ["frame", "seat", "back"]) Object.assign(materials[k], FINISHES[name]);
      emit();
    },
    reset() {
      this.setColor("frame", DEFAULTS.frame);
      this.setColor("seat", DEFAULTS.seat);
      this.setColor("back", DEFAULTS.back);
      this.setFinish(DEFAULTS.finish);
    },
    getState: () => ({ ...state }),
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      controls.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      listeners.clear();
    },
  };
}
