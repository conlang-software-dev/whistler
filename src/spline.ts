import { Segment, getSegmentFns } from "./segment";

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type CurveOutput = Writable<ArrayLike<number>>;
export type CurveInput = Segment[];

function interp(segment: Segment, output: CurveOutput, offset: number) {
  const [ frequency, amplitude ] = getSegmentFns(segment);
  const { run } = segment;
  for (let t = 0; t < run; t++) {
    output[offset++] = frequency(t);
    output[offset++] = amplitude(t);
  }
  return offset;
}

export function spline(segments: CurveInput, output?: CurveOutput, offset = 0): [CurveOutput, number] {
  const maxx = segments.reduce((acc, { run }) => acc + run, offset);
  if(typeof output === 'undefined') { output = new Float32Array(2 * maxx); }
  else if (output.length < 2 * maxx) { throw new Error("Output has insufficient length"); }
  
  for (const segment of segments) {
    offset = interp(segment, output, offset);
  }
  return [output, offset];
}