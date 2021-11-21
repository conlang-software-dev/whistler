import { DynamicFn, InterpFn } from "./interpreter";

export type TransitionCurve = 'sine' | 'arcsine' | 'concave' | 'convex' | `=${string}`;

export interface ModelTransition {
  type: 'transition';
  curve?: TransitionCurve;
  sy: number | string;
  ey: number | string;
  sclip?: number | string;
  eclip?: number | string;
}

export interface Transition {
  type: 'transition';
  curve?: TransitionCurve;
  sy: number;
  ey: number;
  sclip?: number;
  eclip?: number;
}

export function M2STransition(m: ModelTransition, interp: InterpFn): Transition {
  return {
    type: 'transition',
    curve: m.curve,
    sy: interp(m.sy),
    ey: interp(m.ey),
    sclip: typeof m.sclip === 'undefined' ? void 0 : interp(m.sclip),
    eclip: typeof m.eclip === 'undefined' ? void 0 : interp(m.eclip),
  };
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

function selectTransition(sy: number, ey: number, curve: TransitionCurve, dynFn: DynamicFn) {
  switch (curve) {
    case 'sine': return Math.sin;
    case 'arcsine': return scaledArcSine;
    case 'concave': return sy < ey ? concaveUp : concaveDown;
    case 'convex': return sy < ey ? convexUp : convexDown;
    default: return dynFn(curve.substr(1));
  }
}

export function getTransitionFn(
  samples: number,
  { sy, ey, curve = 'sine', sclip = 0, eclip = 0 }: Transition,
  dynFn: DynamicFn,
): (t: number) => number {
  if (sy === ey) return _ => sy;

  const curveFn = selectTransition(sy, ey, curve, dynFn);
  const sx = sclip - HALFPI;
  const ex = HALFPI - eclip;
  const min = curveFn(sx);
  const max = curveFn(ex);
  const domain = ex - sx;
  const range = max - min;
  const c = domain / samples;
  const rise = (ey - sy) / range;
  return t => rise * (curveFn(c * t + sx) - min) + sy;
}