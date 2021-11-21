import { Segment, getSegmentFns, ModelSegment, normalize } from "./segment";
import { DynamicFn, getInterpreter } from "./interpreter";
import { VoiceRange } from ".";
import { mapVoice } from "./voice";

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type CurveOutput = Writable<ArrayLike<number>>;
export type CurveInput = ModelSegment[];

function interpSegment(
  { f, a, run }: Segment,
  sampleRate: number,
  output: CurveOutput,
  offset: number,
  dynFn: DynamicFn,
): number {
  const samples = Math.floor(run * sampleRate / 1000);
  const [ frequency, amplitude ] = getSegmentFns(samples, f, a, dynFn);
  for (let t = 0; t < samples; t++) {
    output[offset++] = frequency(t);
    output[offset++] = amplitude(t);
  }
  return offset;
}

export function _spline(
  segments: Segment[],
  sampleRate: number,
  dynFn: DynamicFn,
  output?: CurveOutput,
  offset = 0,
): [CurveOutput, number] {
  const maxx = segments.reduce((acc, { run }) => acc + Math.round(run * sampleRate / 1000), offset);
  if (typeof output === 'undefined') { output = new Float32Array(2 * maxx); }
  else if (output.length < 2 * maxx) { throw new Error("Output has insufficient length"); }
  
  for (const segment of segments) {
    offset = interpSegment(segment, sampleRate, output, offset, dynFn);
  }

  return [output, offset];
}

export interface SplineArgs {
  segments: CurveInput;
  sampleRate: number;
  output?: CurveOutput
  offset?: number;
  constants?: { [key: string]: number; };
  voice?: VoiceRange;
}

export function spline({ segments, sampleRate, constants, voice, output, offset = 0 }: SplineArgs): [CurveOutput, number] {
  const [argFn, interpFn, dynFn] = getInterpreter(constants);
  let nsegs = normalize(segments, argFn, interpFn);
  if (typeof voice !== 'undefined') { nsegs = mapVoice(nsegs, voice); }
  return _spline([...nsegs], sampleRate, dynFn, output, offset);
}