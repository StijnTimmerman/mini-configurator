# Mini Configurator

A tiny, open-source **3D product configurator** built with [Three.js](https://threejs.org).
Rotate the product, pick colors per part, and switch the finish. The default product
is a lounge chair (frame / seat / backrest), built to be re-skinned.

The Three.js scene lives in one **framework-agnostic core**, so the same configurator
ships as a plain-HTML version and as React / Vue / Angular components that all drive
the same core.

**[▶ Live demo](https://stijntimmerman.github.io/mini-configurator/)** (vanilla version)

![Mini 3D product configurator](docs/screenshot.png)

> **Need your own model, textures, prices and quote requests?**
> [Mini Configurator **Pro**](https://stijntimmerman.github.io/mini-configurator/pro/) loads any GLB,
> adds textures, optional parts, live pricing, share links, a quote form with screenshot, React/Vue
> wrappers, and a no-code **Studio** that exports `product.json`. One payment, unlimited projects.
> [Try the live demo →](https://stijntimmerman.github.io/mini-configurator/pro/#demo)

## Repository layout

| Folder | What |
|--------|------|
| `core/` | `configurator-core.js` — the Three.js scene + `createConfigurator()` API (`setColor`, `setFinish`, `reset`, `getState`, `onChange`, `dispose`). No DOM, no framework. |
| `vanilla/` | Plain HTML/CSS/JS version — no build step, Three.js via CDN import map. This is the live demo. |
| `react/`, `vue/`, `angular/` | The same configurator as a component in each framework, wrapping the shared core. |

## Run the vanilla version

ES modules must be served over HTTP (opening from `file://` is blocked by the
browser), so use any static server from the repo root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/  (redirects to /vanilla/)
```

## Framework versions

Each framework version is a small app that wraps the shared core in one component
(`useEffect` / `onMounted` / `ngAfterViewInit` around `createConfigurator`) and
builds its control panel from `PALETTES`. The 3D logic is never duplicated — they
all import the `configurator-core` package (`core/`, linked via `file:../core`).

```bash
cd react   # or: vue / angular
npm install
npm run dev      # dev server
npm run build    # production build -> dist/
```

The reusable component lives in:
- React — `react/src/ProductConfigurator.jsx`
- Vue — `vue/src/ProductConfigurator.vue`
- Angular — `angular/src/app/app.component.ts`

## Customize

Everything product-specific is in **`core/configurator-core.js`**:

- **`PALETTES`** — color options. `frame` uses one palette; `seat`/`back` share
  another. Each entry is `{ name, hex }`.
- **`FINISHES`** — roughness/metalness presets for matte / satin / gloss.
- **`createConfigurator()`** — builds the chair from primitives, each part using a
  shared material so recoloring updates every mesh. Replace the model section to
  configure a different product; keep the `frame` / `seat` / `back` part keys (or
  update them consistently in the UI).

Each front-end (vanilla and the framework versions) only builds the control panel
from `PALETTES` and calls the core API — so the 3D logic is never duplicated.

## Deploy

Static files (the vanilla version) host anywhere: GitHub Pages, Netlify, Vercel,
Cloudflare Pages, or any web server over HTTP/HTTPS. The framework versions build
to static files too.

## License

[MIT](./LICENSE).

---

Built by [Stijn Timmerman](https://stimmerman.nl). Want more? See [Mini Configurator Pro](https://stijntimmerman.github.io/mini-configurator/pro/).
