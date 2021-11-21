import { SignalComponent } from ".";
import { Segment } from "./segment";

export interface VoiceParams {
  center?: number;
  shift?: number;
  scale?: number;
}

export interface VoiceRange {
  f?: VoiceParams;
  a?: VoiceParams;
  rate?: number;
}

function mapComponent(com: SignalComponent, f: number, c: number, cs: number) {
  switch (com.type) {
    case 'transition': return { ...com, sy: f * (com.sy - c) + cs, ey: f * (com.ey - c) + cs };
    case 'contour': return { ...com, y: f * (com.y - c) + cs, a: f * com.a };
    case 'constant':  return { ...com, y: f * (com.y - c) + cs };
  }
}

export function * mapVoice(
  segments: Iterable<Segment>,
  {
    f: { scale: ff = 1, shift: fs = 0, center: fc = 0 } = {},
    a: { scale: af = 1, shift: as = 0, center: ac = 0 } = {},
    rate = 1,
  }: VoiceRange,
): Generator<Segment> {
  const fcs = fc + fs;
  const acs = ac + as;
  for (const { f, a, run } of segments) {
    yield {
      f: mapComponent(f, ff, fc, fcs),
      a: mapComponent(a, af, ac, acs),
      run: run * rate,
    };
  }
}