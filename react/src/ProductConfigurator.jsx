import { useEffect, useRef, useState } from "react";
import { createConfigurator, partPalette, FINISHES } from "configurator-core";

const PARTS = [
  { key: "frame", label: "Frame" },
  { key: "seat", label: "Seat" },
  { key: "back", label: "Backrest" },
];
const FINISH_NAMES = Object.keys(FINISHES);
const hex = (h) => "#" + h.toString(16).padStart(6, "0");
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

export default function ProductConfigurator() {
  const canvasRef = useRef(null);
  const cfgRef = useRef(null);
  const [state, setState] = useState(null);

  // Set up the shared Three.js core once the canvas is mounted; tear it down on unmount.
  useEffect(() => {
    const cfg = createConfigurator(canvasRef.current);
    cfgRef.current = cfg;
    const unsubscribe = cfg.onChange(setState);
    setState(cfg.getState());
    return () => {
      unsubscribe();
      cfg.dispose();
    };
  }, []);

  const cfg = () => cfgRef.current;

  return (
    <div className="app">
      <div className="stage">
        <canvas id="view" ref={canvasRef} />
        <div className="hint">Drag to rotate · scroll to zoom</div>
      </div>

      <aside className="panel">
        <h1>Lounge Chair</h1>
        <p className="sub">Configure your chair — drag the model to look around.</p>

        {PARTS.map(({ key, label }) => (
          <div className="group" key={key}>
            <label>{label}</label>
            <div className="swatches">
              {partPalette[key].map((c) => (
                <button
                  key={c.name}
                  className="swatch"
                  title={c.name}
                  style={{ background: hex(c.hex) }}
                  aria-pressed={state?.[key] === c.name}
                  onClick={() => cfg().setColor(key, c.name)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="group">
          <label>Finish</label>
          <div className="segment">
            {FINISH_NAMES.map((f) => (
              <button key={f} aria-pressed={state?.finish === f} onClick={() => cfg().setFinish(f)}>
                {cap(f)}
              </button>
            ))}
          </div>
        </div>

        <div className="summary">
          <div><span>Frame</span><b>{state?.frame}</b></div>
          <div><span>Seat</span><b>{state?.seat}</b></div>
          <div><span>Backrest</span><b>{state?.back}</b></div>
          <div><span>Finish</span><b>{cap(state?.finish)}</b></div>
        </div>

        <button className="reset" onClick={() => cfg().reset()}>Reset</button>
        <p className="credit">
          Open-source mini configurator · <a href="https://steildigital.nl" target="_blank" rel="noopener">Steil Digital</a>
        </p>
      </aside>
    </div>
  );
}
