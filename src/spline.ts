import { Segment, getSegmentFns } from "./segment";

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type CurveOutput = Writable<ArrayLike<number>>;
export type CurveInput = Segment[];

function interp({ f, a, run }: Segment, sampleRate: number, output: CurveOutput, offset: number) {
  const samples = Math.round(run * sampleRate / 1000);
  const [ frequency, amplitude ] = getSegmentFns(samples, f, a);
  for (let t = 0; t < samples; t++) {
    output[offset++] = frequency(t);
    output[offset++] = amplitude(t);
  }
  return offset;
}

export function spline(segments: CurveInput, sampleRate: number, output?: CurveOutput, offset = 0): [CurveOutput, number] {
  const maxx = segments.reduce((acc, { run }) => acc + Math.round(run * sampleRate / 1000), offset);
  if (typeof output === 'undefined') { output = new Float32Array(2 * maxx); }
  else if (output.length < 2 * maxx) { throw new Error("Output has insufficient length"); }
  
  for (const segment of segments) {
    offset = interp(segment, sampleRate, output, offset);
  }
  return [output, offset];
}