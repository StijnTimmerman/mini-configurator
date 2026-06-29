# Mini Configurator

A tiny, open-source **3D product configurator** built with [Three.js](https://threejs.org).
Rotate the product, pick colors per part, and switch the finish — all in vanilla
HTML/CSS/JS with no build step and no dependencies to install.

The default product is a lounge chair (frame / seat / backrest), but it's built to
be re-skinned: swap the palettes and the `buildChair()` function for your own product.

**[▶ Live demo](https://stijntimmerman.github.io/mini-configurator/)**

![Mini 3D product configurator](docs/screenshot.png)

## Features

- 🪑 **Per-part configuration** — independent colors for frame, seat and backrest.
- ✨ **Finish** — matte / satin / gloss (roughness + a procedural studio
  environment so reflections look right with no HDR file).
- 🖱 **Orbit controls** — drag to rotate, scroll to zoom.
- 🎨 **Single source of truth** — colors live in `PALETTES`; the UI swatches and
  the 3D materials are generated from the same data.
- ⚡ **No build, no dependencies** — Three.js is loaded from a CDN via an import map.

## Run locally

ES modules need to be served over HTTP (opening `index.html` from `file://` is
blocked by the browser), so use any static server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Customize

Everything product-specific is in **`configurator.js`**:

- **`PALETTES`** — the color options. `frame` uses one palette, `seat`/`back`
  share another. Each entry is `{ name, hex }`; swatches and summary use `name`.
- **`FINISHES`** — roughness/metalness presets for matte/satin/gloss.
- **`buildChair()`** — the model, assembled from primitives. Each part references
  a shared material (`materials.frame` / `.seat` / `.back`) so recoloring a part
  updates every mesh that uses it. Replace this function to configure a different
  product; keep the `materials` keys (or update the `data-part` groups in
  `index.html` to match).

The UI in `index.html` is plain markup: each `.group[data-part]` gets its swatches
injected automatically, so adding a configurable part is a matter of adding a
palette + a group.

## Deploy

Static files — host anywhere: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or
any web server (just serve over HTTP/HTTPS).

## License

[MIT](./LICENSE).

---

Built by [Steil Digital](https://steildigital.nl).
