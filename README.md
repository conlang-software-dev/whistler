# whistler
A library and command line utility for synthesizing examples of whistled speech.

This package exports two functions:

Spline
------
`function spline(transitions: CurveInput, output?: CurveOutput, offset?: number): [CurveOutput, number];`

The `spline` function takes in a description of a frequency / amplitude curve in terms of a sequence of frequency transitions and outputs a writable `ArrayLike` object with interlaced [frequency, amplitude] data, along with a number indicating the next offset to be written to.

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

`CurveInput` is an array with length greater than zero of `Transition` objects, which are defined as follows:

```ts
interface Transition {
  sy: number;           // The starting frequency
  ey: number;           // The ending frequency
  run: number;          // The number of samples to use
  amplitude?: number;   // The peak amplitude during this transition; defaults to 1
  fadeIn: boolean;      // Whether or not the amplitude should rise from 0 at the start
  fadeOut: boolean;     // Whether or not the amplitude should fall to 0 at the end
}
```

Setting `sy` to zero indicates a period of silence, in which case all other properties except `run` become optional (and will be ignored).

It is up to the client to ensure that the starting and ending frequencies of adjacent `Transitions` are compatible. Setting `sy == ey` will produce a constant level tone, and adjacent `Transitions` with mismatched frequencies will result in an instantaneous transition between them.

Command Line Interface
======================

`whistler [--input/-i FilePath] [--output/-p FilePath] [--sampleRate/-r number]`

The command line utility reads in `CurveInput` data in JSON format, synthesizes PCM audio from it, and writes the results as a WAV file.

If an input file is missing, it will read from STDIN.
If an output file is missing, it will write to STDOUT.
If a sample rate is missing, it will default to 44100 samples/second.