import { getTransitionFn, Transition, TransitionCurve } from "./transitions";
import { Contour, ContourCurve, getContourFn } from "./countours";

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