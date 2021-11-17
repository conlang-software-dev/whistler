# whistler
A library and command line utility for synthesizing examples of whistled speech.

This package exports two functions:

Spline
------
`function spline(segments: CurveInput, output?: CurveOutput, offset?: number): [CurveOutput, number];`

The `spline` function takes in a description of a complete frequency / amplitude curve in terms of a sequence of segments of frequency & amplitude curves, represented in terms of segments of scaled and shifted sinusoids, and outputs a writable `ArrayLike` object with interlaced [frequency, amplitude] data, along with a number indicating the next offset to be written to.

If an `output` writable `ArrayLike` is provided, the output data will be written there, beginning at the specified `offset` (which defaults to 0). An error is thrown if the provided output buffer is not large enough. If no pre-allocated `output` buffer is provided, a new `Float32Array` will be automatically allocated.

Synthesize
----------
`function synthesize(transitions: CurveInput, settings: WhistleSynthesisSettings): [ArrayLike<number>, number];`

The `synthesize` function internally calls `spline`, and then passes the results to the `fm-synthesis` package to produce PCM data, and returns a writable `ArrayLike` object containing the PCM data, along with a number indicating the next offset to be written to.

The settings are as follows (determined by the inputs to `fm-synthesis`):
```ts
interface WhistleSynthesisSettings {
    sampleRate: number; // Samples per second for both input and output.
    phase?: number; // Initial phase offset. Defaults to zero.
    base?: number; // The base, carrier, or fundamental frequency to be modulated. Defaults to zero.
    start?: number; // Offset at which to begin reading data. Defaults to zero.
    end?: number; // Offset at which to stop reading data. Defaults the the minimum of the length of the input buffers.
    output?: FMOutputArray; // Optional pre-allocated buffer into which to write the generated samples.
    voice?: (t: number) => number; // Waveform function. For best results, `voice` should have a natural period of 2Pi. Defaults to Math.sin(t).
}
```

If an `output` writable `ArrayLike` is provided, the output data will be written there. If no pre-allocated `output` buffer is provided, a new `Float32Array` will be automatically allocated.

Input Format
============

`CurveInput` is an array of `Segment` objects, which are defined as follows:

```ts
type Segment = {
  f: SignalComponent; // Description of the frequency component.
  a: SignalComponent; // Description of the amplitude component.
  run: number;        // The number of samples to use for the this segment.
}

type SignalComponent = Transition | Contour | Constant;

interface Transition {
  type: 'transition';
  sy: number;     // Starting value of this segment.
  ey: number;     // Ending value of this segment.
  sclip?: number; // How much of the beginning of the curve,
                  // starting at the lower (upper) extremum, to
                  // clip off to achieve a sharper transition. 
  eclip?: number; // How much of the end of the curve,
                  // starting at the upper (lower) extremum, to
                  // clip off to achieve a sharper transition. 
}

export interface Contour {
  type: 'contour';
  y: number;      // The starting and ending value of this segment.
  a: number;      // The maximum amplitude by which to deviate from
                  // the boundary value (positive or negative).
  clip?: number;  // How much the clip off of the beginning and end
                  // of the curve between minima (maxima) to
                  // achieve sharper transitions.
}

export interface Constant {
  type: 'constant';
  y: number;  // The constant value to maintain during this segment.
}
```

By default, all types of curve segments will have slopes of zero at the boundaries. This makes it trivial to produce smooth transitions between segments--just make sure the y-values at adjacent segments match. Setting non-zero `clip`, `sclip`, or `eclip` values will change that, in which case you are responsible for your own discontinuities!

Command Line Interface
======================

`whistler [--input/-i FilePath] [--output/-p FilePath] [--sampleRate/-r number]`

The command line utility reads in `CurveInput` data in JSON format, synthesizes PCM audio from it, and writes the results as a WAV file.

If an input file is missing, it will read from STDIN.
If an output file is missing, it will write to STDOUT.
If a sample rate is missing, it will default to 44100 samples/second.