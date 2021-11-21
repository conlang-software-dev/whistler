import { getTransitionFn, M2STransition, ModelTransition, Transition, TransitionCurve } from "./transitions";
import { Contour, ContourCurve, getContourFn, M2SContour, ModelContour } from "./contours";
import { DynamicFn, InterpArgs, InterpFn } from "./interpreter";

export { Transition, TransitionCurve, Contour, ContourCurve }

export interface ModelConstant {
  type: 'constant';
  y: number | string;
}

export interface Constant {
  type: 'constant';
  y: number;
}

function M2SConstant(m: ModelConstant, interp: InterpFn): Constant {
  return {
    type: 'constant',
    y: interp(m.y),
  };
}

export type ModelComponent = ModelTransition | ModelContour | ModelConstant;
export type SignalComponent = Transition | Contour | Constant;

function M2SComponent(m: ModelComponent, interp: InterpFn): SignalComponent {
  switch (m.type) {
    case 'transition': return M2STransition(m, interp);
    case 'contour': return M2SContour(m, interp);
    case 'constant': return M2SConstant(m, interp);
  }
}

export type ModelSegment = {
  f: ModelComponent;
  a: ModelComponent;
  run: number;
}

export type Segment = {
  f: SignalComponent;
  a: SignalComponent;
  run: number;
}

function Model2Segment(m: ModelSegment, interp: InterpFn): Segment {
  return {
    f: M2SComponent(m.f, interp),
    a: M2SComponent(m.a, interp),
    run: m.run,
  }
}

function getComponentFn(
  samples: number,
  c: SignalComponent,
  dynFn: DynamicFn,
): (t: number) => number {
  switch (c.type) {
    case 'transition': return getTransitionFn(samples, c, dynFn);
    case 'contour': return getContourFn(samples, c);
    case 'constant': {
      const a = c.y;
      return _ => a;
    }
  }
}

export function getSegmentFns(
  samples: number,
  f: SignalComponent,
  a: SignalComponent,
  dynFn: DynamicFn,
): [(t: number) => number, (t: number) => number] {
  return [
    getComponentFn(samples, f, dynFn),
    getComponentFn(samples, a, dynFn),
  ];
}

const HALFPI = Math.PI / 2;

function getComponentValue(
  c: SignalComponent,
) {
  switch (c.type) {
    case 'transition': return { y: c.ey, phi: HALFPI - (c.eclip||0) };
    case 'contour': return { y: c.y, phi: Math.PI - (c.clip||0) };
    case 'constant': return { y: c.y, phi: Math.PI };
  }
}

function getTerminalValues({ f, a }: Segment) {
  const { y: lf, phi: f_phi } = getComponentValue(f);
  const { y: la, phi: a_phi } = getComponentValue(a);
  return {
    lf, f_phi,
    la, a_phi,
  }
}

export function * normalize(segments: Iterable<ModelSegment>, argFn: InterpArgs, interpFn: InterpFn): Generator<Segment, void, undefined> {
  let i_args = { lf: 0, f_phi: Math.PI, la: 0, a_phi: Math.PI };
  for (const segment of segments) {
    argFn(i_args);
    const iseg = Model2Segment(segment, interpFn);
    if (iseg.run > 0) { yield iseg; }
    i_args = getTerminalValues(iseg);
  }
}