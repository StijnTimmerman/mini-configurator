import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset paths relative (works on GitHub Pages subpaths).
// The shared 3D logic comes from the local "configurator-core" package
// (see package.json -> file:../core), so no out-of-root imports are needed.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
