export interface ColorOption {
  name: string;
  hex: number;
}
export interface Finish {
  roughness: number;
  metalness: number;
}
export interface ConfigState {
  frame: string;
  seat: string;
  back: string;
  finish: string;
}
export interface Configurator {
  PALETTES: Record<string, ColorOption[]>;
  FINISHES: Record<string, Finish>;
  DEFAULTS: ConfigState;
  partPalette: Record<string, ColorOption[]>;
  setColor(part: string, name: string): void;
  setFinish(name: string): void;
  reset(): void;
  getState(): ConfigState;
  onChange(fn: (state: ConfigState) => void): () => void;
  dispose(): void;
}

export const PALETTES: Record<string, ColorOption[]>;
export const FINISHES: Record<string, Finish>;
export const DEFAULTS: ConfigState;
export const partPalette: Record<string, ColorOption[]>;

export function createConfigurator(
  canvas: HTMLCanvasElement,
  options?: { initial?: Partial<ConfigState> }
): Configurator;
