import { Transition } from "./transition";

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type CurveOutput = Writable<ArrayLike<number>>;
export type CurveInput = [Transition, ...Transition[]];

// Envelope functions using sinusoid arcs

function hill(run: number, a: number): (i: number) => number {
  return i => a * Math.sin(i * Math.PI / run);
}

function rampUp(run: number, a: number): (i: number) => number {
  const f = Math.PI / (2*run);
  return i => a * Math.sin(f * i);
}

function rampDown(run: number, a: number): (i: number) => number {
  const f = Math.PI / (2*run);
  return i => a * Math.cos(f * i);
}

function flat(_: number, a: number): (i: number) => number {
  return _ => a;
}

function generateEnvelope({ fadeIn, fadeOut, run, amplitude = 1 }: Transition) {
  return (fadeIn ? (fadeOut ? hill : rampUp) : (fadeOut ? rampDown : flat))(run, amplitude);
}


// Frequency transition functions based on sinusoid arcs

const PI2 = Math.PI/2;
const PI4 = Math.PI/4;
const SQRTHALF = Math.sqrt(0.5);
function generateTransition(trunc_start: boolean, trunc_end: boolean, sy: number, ey: number, run: number) {
  const [sx, ex, min, max] = trunc_start ?
    (trunc_end ? [-PI4, PI4, -SQRTHALF, SQRTHALF] : [0,    PI2, 0,  1]) :
    (trunc_end ? [-PI2, 0,   -1,        0       ] : [-PI2, PI2, -1, 1]);
  const domain = ex - sx;
  const range = max - min;
  const rf = domain / run;
  const rise = (ey - sy)/range;
  return (i: number) => rise * (Math.sin(i * rf + sx) - min) + sy;
}

// Implements sinusoid arcs for frequency and envelope transitions.
// Normally, the input range is mapped to [-pi/2,pi/2] on a sine curve,
// so that the ends have a slope of zero.
// trunc_start and trunc_end shift the endpoints in.
function interp(transition: Transition, output: CurveOutput, offset: number, trunc_start: boolean, trunc_end: boolean) {
  const { sy, ey, run } = transition;
  if (sy === 0) { // frequency of zero indicates silence
    for (let i = 0; i < run; i++) {
      output[offset++] = 0; // frequency
      output[offset++] = 0; // amplitude
    }
  } else {
    const envelope = generateEnvelope(transition);

    if (sy === ey) { // constant non-zero frequency
      for (let i = 0; i < run; i++) {
        output[offset++] = sy; // frequency
        output[offset++] = envelope(i); // amplitude
      }
    } else { // non-constant frequency
      const transition = generateTransition(trunc_start, trunc_end, sy, ey as number, run);
      for (let i = 0; i < run; i++) {
        output[offset++] = transition(i); // frequency
        output[offset++] = envelope(i);   // amplitude
      }
    }
  }
  return offset;
}

export function spline(transitions: CurveInput, output?: CurveOutput, offset = 0): [CurveOutput, number] {
  const maxx = transitions.reduce((acc, { run }) => acc + run, offset);
  if(typeof output === 'undefined') { output = new Float32Array(2 * maxx); }
  else if (output.length < 2 * maxx) { throw new Error("Output has insufficient length"); }
  

  // For each transition, we truncate the frequency curve
  // if it is not specified to fade and the neighboring
  // segment is silence.
  let t = transitions[0];
  if (transitions.length === 1) {
    offset = interp(t, output, offset, !t.fadeIn, !t.fadeOut);
  } else {
    let truncs = !t.fadeIn;
    let trunce = !t.fadeOut && transitions[1].sy === 0;
    offset = interp(t, output, offset, truncs, trunce);
    for (let i = 1; i < transitions.length-1; i++) {
      t = transitions[i];
      truncs = !t.fadeIn && transitions[i-1].sy === 0;
      trunce = !t.fadeOut && transitions[1+1].sy === 0;
      offset = interp(t, output, offset, truncs, trunce);
    }
    t = transitions[transitions.length-1];
    truncs = !t.fadeIn && transitions[transitions.length-2].sy === 0;
    trunce = !t.fadeOut;
    offset = interp(t, output, offset, truncs, trunce);
  }
  return [output, offset];
}