export type ContourCurve = 'sine' | 'ellipse';
export interface Contour {
  type: 'contour';
  curve?: ContourCurve;
  y: number;
  a: number;
  clip?: number;
}

const INVPI = 1 / Math.PI;

function cosContour(t: number) {
  return (Math.cos(t) + 1) * 0.5;
}

function ellipseContour(t: number) {
  return Math.sqrt(1 - (t * INVPI)**2);
}

export function getContourFn(run: number, { y, a, curve = 'sine', clip = 0 }: Contour): (t: number) => number {
  if (a === 0) return _ => y;

  const curveFn = curve === 'sine' ? cosContour : ellipseContour;
  const sx = clip - Math.PI;
  const yoffset = curveFn(sx);
  // map [0, run] to [clip - pi, pi - clip]
  const domain = 2 * (Math.PI - clip);
  const c = domain / run;
  a /= 1 - yoffset;
  return t => a * (curveFn(c * t + sx) - yoffset) + y;
}