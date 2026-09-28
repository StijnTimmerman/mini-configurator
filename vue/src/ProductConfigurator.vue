<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createConfigurator, partPalette, FINISHES } from "configurator-core";

const PARTS = [
  { key: "frame", label: "Frame" },
  { key: "seat", label: "Seat" },
  { key: "back", label: "Backrest" },
];
const FINISH_NAMES = Object.keys(FINISHES);
const hex = (h) => "#" + h.toString(16).padStart(6, "0");
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

const canvas = ref(null);
const state = ref(null);
let cfg = null;

onMounted(() => {
  cfg = createConfigurator(canvas.value);
  cfg.onChange((s) => { state.value = s; });
  state.value = cfg.getState();
});
onBeforeUnmount(() => cfg && cfg.dispose());
</script>

<template>
  <div class="app">
    <div class="stage">
      <canvas id="view" ref="canvas"></canvas>
      <div class="hint">Drag to rotate · scroll to zoom</div>
    </div>

    <aside class="panel">
      <h1>Lounge Chair</h1>
      <p class="sub">Configure your chair — drag the model to look around.</p>

      <div class="group" v-for="p in PARTS" :key="p.key">
        <label>{{ p.label }}</label>
        <div class="swatches">
          <button
            v-for="c in partPalette[p.key]"
            :key="c.name"
            class="swatch"
            :title="c.name"
            :style="{ background: hex(c.hex) }"
            :aria-pressed="state && state[p.key] === c.name"
            @click="cfg.setColor(p.key, c.name)"
          ></button>
        </div>
      </div>

      <div class="group">
        <label>Finish</label>
        <div class="segment">
          <button
            v-for="f in FINISH_NAMES"
            :key="f"
            :aria-pressed="state && state.finish === f"
            @click="cfg.setFinish(f)"
          >{{ cap(f) }}</button>
        </div>
      </div>

      <div class="summary">
        <div><span>Frame</span><b>{{ state?.frame }}</b></div>
        <div><span>Seat</span><b>{{ state?.seat }}</b></div>
        <div><span>Backrest</span><b>{{ state?.back }}</b></div>
        <div><span>Finish</span><b>{{ cap(state?.finish) }}</b></div>
      </div>

      <button class="reset" @click="cfg.reset()">Reset</button>
      <p class="credit">
        Open-source mini configurator by <a href="https://stimmerman.nl" target="_blank" rel="noopener">Stijn Timmerman</a> · <a href="https://stijntimmerman.github.io/mini-configurator/pro/" target="_blank" rel="noopener">Pro version</a>
      </p>
    </aside>
  </div>
</template>
