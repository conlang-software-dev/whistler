import { InterpFn } from "./interpreter";

export type ContourCurve = 'sine' | 'ellipse';

export interface ModelContour {
  type: 'contour';
  curve?: ContourCurve;
  y?: number | string;
  a: number | string;
  clip?: number | string;
}

export interface Contour {
  type: 'contour';
  curve?: ContourCurve;
  y: number;
  a: number;
  clip?: number;
}

export function M2SContour(m: ModelContour, last: string, interp: InterpFn): Contour {
  return {
    type: 'contour',
    curve: m.curve,
    y: interp(typeof m.y === 'undefined' ? last : m.y),
    a: interp(m.a),
    clip: typeof m.clip === 'undefined' ? void 0 : interp(m.clip),
  };
}

const INVPI = 1 / Math.PI;

function cosContour(t: number) {
  return (Math.cos(t) + 1) * 0.5;
}

function ellipseContour(t: number) {
  return Math.sqrt(1 - (t * INVPI) ** 2);
}

export function getContourFn(
  samples: number,
  { y, a, curve = 'sine', clip = 0 }: Contour,
): (t: number) => number {
  if (a === 0) return _ => y;

  const curveFn = curve === 'sine' ? cosContour : ellipseContour;
  const sx = clip - Math.PI;
  const yoffset = curveFn(sx);
  // map [0, samples] to [clip - pi, pi - clip]
  const domain = 2 * (Math.PI - clip);
  const c = domain / samples;
  a /= 1 - yoffset;
  return t => a * (curveFn(c * t + sx) - yoffset) + y;
}