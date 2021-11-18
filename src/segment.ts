import { getTransitionFn, Transition, TransitionCurve } from "./transitions";
import { Contour, ContourCurve, getContourFn } from "./contours";

export { Transition, TransitionCurve, Contour, ContourCurve }

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

export function getComponentFn(samples: number, c: SignalComponent): (t: number) => number {
  switch (c.type) {
    case 'transition': return getTransitionFn(samples, c);
    case 'contour': return getContourFn(samples, c);
    case 'constant': {
      const a = c.y;
      return _ => a;
    }
  }
}

export function getSegmentFns(samples: number, f: SignalComponent, a: SignalComponent): [(t: number) => number, (t: number) => number] {
  return [
    getComponentFn(samples, f),
    getComponentFn(samples, a),
  ];
}