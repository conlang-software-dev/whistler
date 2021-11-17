export interface Transition {
  type: 'transition';
  curve?: 'sin'; // TODO: add ellipsoid & arcsin [arcsin(2x/pi-1)/pi + 0.5 or 1 - arccos(2x/pi-1)/pi]
  sy: number;
  ey: number;
  sclip?: number;
  eclip?: number;
}

export interface Contour {
  type: 'contour';
  curve?: 'sin'; // TODO: add ellipsoids
  y: number;
  a: number;
  clip?: number;
}

export interface Constant {
  type: 'constant';
  y: number;
}

export type SignalComponent = Transition | Contour | Constant;

export type Segment = {
  f: SignalComponent;
  a: SignalComponent;
  run: number;
}

const HALFPI = Math.PI / 2;
function getTransitionFn(run: number, { sy, ey, sclip = 0, eclip = 0 }: Transition): (t: number) => number {
  const sx = sclip - HALFPI;
  const ex = HALFPI - eclip;
  const min = Math.sin(sx);
  const max = Math.sin(ex);
  const domain = ex - sx;
  const range = max - min;
  const rf = domain / run;
  const rise = (ey - sy)/(2 * range);
  return t => rise * (Math.sin(t * rf + sx) - min) + sy;
}

function getContourFn(run: number, { y, a, clip = 0 }: Contour): (t: number) => number {
  const sx = clip - Math.PI;
  const yoffset = (Math.cos(sx) + 1) * 0.5;
  // map [0, run] to [clip - pi, pi - clip]
  const domain = 2 * (Math.PI - clip);
  const c = domain / run;
  a /= 1 - yoffset;
  return t => a * ((Math.cos(c * t + sx) + 1) * 0.5 - yoffset) + y;
}

export function getComponentFn(run: number, c: SignalComponent): (t: number) => number {
  switch (c.type) {
    case 'transition': return getTransitionFn(run, c);
    case 'contour': return getContourFn(run, c);
    case 'constant': {
      const a = c.y;
      return _ => a;
    }
  }
}

export function getSegmentFns({ f, a, run }: Segment) {
  return [
    getComponentFn(run, f),
    getComponentFn(run, a),
  ];
}