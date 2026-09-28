import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  createConfigurator,
  partPalette,
  FINISHES,
  DEFAULTS,
  type ConfigState,
  type Configurator,
} from 'configurator-core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="app">
      <div class="stage">
        <canvas id="view" #view></canvas>
        <div class="hint">Drag to rotate · scroll to zoom</div>
      </div>

      <aside class="panel">
        <h1>Lounge Chair</h1>
        <p class="sub">Configure your chair — drag the model to look around.</p>

        @for (p of parts; track p.key) {
          <div class="group">
            <label>{{ p.label }}</label>
            <div class="swatches">
              @for (c of palette[p.key]; track c.name) {
                <button
                  class="swatch"
                  [title]="c.name"
                  [style.background]="hex(c.hex)"
                  [attr.aria-pressed]="cur(p.key) === c.name"
                  (click)="setColor(p.key, c.name)"
                ></button>
              }
            </div>
          </div>
        }

        <div class="group">
          <label>Finish</label>
          <div class="segment">
            @for (f of finishNames; track f) {
              <button [attr.aria-pressed]="state.finish === f" (click)="setFinish(f)">
                {{ cap(f) }}
              </button>
            }
          </div>
        </div>

        <div class="summary">
          <div><span>Frame</span><b>{{ state.frame }}</b></div>
          <div><span>Seat</span><b>{{ state.seat }}</b></div>
          <div><span>Backrest</span><b>{{ state.back }}</b></div>
          <div><span>Finish</span><b>{{ cap(state.finish) }}</b></div>
        </div>

        <button class="reset" (click)="reset()">Reset</button>
        <p class="credit">
          Open-source mini configurator ·
          <a href="https://steildigital.nl" target="_blank" rel="noopener">Steil Digital</a> · <a href="https://store.steildigital.nl" target="_blank" rel="noopener">Mini Configurator Pro</a>
        </p>
      </aside>
    </div>
  `,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('view') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly parts = [
    { key: 'frame', label: 'Frame' },
    { key: 'seat', label: 'Seat' },
    { key: 'back', label: 'Backrest' },
  ];
  readonly finishNames = Object.keys(FINISHES);
  readonly palette = partPalette;
  state: ConfigState = { ...DEFAULTS };

  private cfg: Configurator | null = null;

  ngAfterViewInit(): void {
    this.cfg = createConfigurator(this.canvasRef.nativeElement);
    this.cfg.onChange((s) => (this.state = s));
  }

  ngOnDestroy(): void {
    this.cfg?.dispose();
  }

  setColor(part: string, name: string): void {
    this.cfg?.setColor(part, name);
  }
  setFinish(name: string): void {
    this.cfg?.setFinish(name);
  }
  reset(): void {
    this.cfg?.reset();
  }

  cur(key: string): string {
    return (this.state as unknown as Record<string, string>)[key];
  }
  hex(h: number): string {
    return '#' + h.toString(16).padStart(6, '0');
  }
  cap(s: string): string {
    return s ? s[0].toUpperCase() + s.slice(1) : '';
  }
}
