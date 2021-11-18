export type TransitionCurve = 'sine' | 'arcsine' | 'concave' | 'convex';
export interface Transition {
  type: 'transition';
  curve?: TransitionCurve;
  sy: number;
  ey: number;
  sclip?: number;
  eclip?: number;
}

const HALFPI = Math.PI / 2;
const INVPI = 1 / Math.PI;
const TWOOVERPI = 2 / Math.PI
const INVTWOPI = 1 / (2 * Math.PI);

function scaledArcSine(t: number) {
  return Math.asin(t * INVPI) * TWOOVERPI;
}

function concaveUp(t: number) {
  return 1 - 2 * Math.sqrt(1 - ((t + Math.PI) * INVTWOPI) ** 2);
}
function concaveDown(t: number) {
  return 1 - 2 * Math.sqrt(1 - ((t - Math.PI) * INVTWOPI) ** 2);
}
function convexUp(t: number) {
  return 2 * Math.sqrt(1 - ((t - Math.PI) * INVTWOPI) ** 2) - 1;
}
function convexDown(t: number) {
  return 2 * Math.sqrt(1 - ((t + Math.PI) * INVTWOPI) ** 2) - 1;
}

function selectTransition(sy: number, ey: number, curve: TransitionCurve) {
  if (curve === 'sine') return Math.sin;
  if (curve === 'arcsine') return scaledArcSine;
  if (curve === 'concave') {
    return sy < ey ? concaveUp : concaveDown;
  }
  // convex
  return sy < ey ? convexUp : convexDown;
}

export function getTransitionFn(samples: number, { sy, ey, curve = 'sine', sclip = 0, eclip = 0 }: Transition): (t: number) => number {
  if (sy === ey) return _ => sy;

  const curveFn = selectTransition(sy, ey, curve);
  const sx = sclip - HALFPI;
  const ex = HALFPI - eclip;
  const min = curveFn(sx);
  const max = curveFn(ex);
  const domain = ex - sx;
  const range = max - min;
  const c = domain / samples;
  const rise = (ey - sy) / (2 * range);
  return t => rise * (curveFn(c * t + sx) - min) + sy;               
}