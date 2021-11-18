# whistler
A library and command line utility for synthesizing examples of whistled speech.

`npm i whistle-synthesis`

This package exports three free functions and a class:

Spline
------
`function spline(segments: CurveInput, output?: CurveOutput, offset?: number): [CurveOutput, number];`

The `spline` function takes in a description of a complete frequency / amplitude curve in terms of a sequence of segments of independently-controllable frequency & amplitude curves, represented in terms of segments of scaled and shifted sinusoids and elliptical arcs, and outputs a writable `ArrayLike` object with interlaced [frequency, amplitude] data, along with a number indicating the next offset to be written to. Sinusoids and ellipses are chosen as the basic components because they guarantee constant boundary slopes (either horizontal or vertical) at the boundaries, regardless of how they are scaled, thus making it easy to produce smooth transitions between segments.

If an `output` writable `ArrayLike` is provided, the output data will be written there, beginning at the specified `offset` (which defaults to 0). An error is thrown if the provided output buffer is not large enough. If no pre-allocated `output` buffer is provided, a new `Float32Array` will be automatically allocated.

Synthesize
----------
`function synthesize({ segments: CurveInput, settings: WhistleSynthesisSettings }: WhistleSynthesisArgs): [ArrayLike<number>, number];`

The `synthesize` function internally calls `spline`, and then passes the results to the `fm-synthesis` package to produce PCM data, and returns a writable `ArrayLike` object containing the PCM data, along with a number indicating the next offset to be written to.

The settings are as follows (determined by the inputs to `fm-synthesis`):
```ts
interface WhistleSynthesisSettings {
    // Samples per second for both input and output.
    sampleRate: number;
    // Initial phase offset. Defaults to zero.
    phase?: number;
    // The base, carrier, or fundamental frequency to be modulated. Defaults to zero.
    base?: number;
    // Offset at which to begin reading data. Defaults to zero.
    start?: number;
    // Offset at which to stop reading data. Defaults the the minimum of the length of the input buffers.
    end?: number;
    // Optional pre-allocated buffer into which to write the generated samples.
    output?: FMOutputArray;
    // Optional offset in the output buffer at which to start writing. Defaults to zero.
    // This also applies to internally-allocated output buffers, and will increase their length.
    offset?: number;
    // Waveform function. For best results, `voice` should have a natural period of 2Pi, and a range of -1 to 1. Defaults to Math.sin.
    voice?: ((t: number) => number) | 'sine' | 'square' | 'triangle' | 'sawtooth' | 'elliptical';
}
```

If an `output` writable `ArrayLike` is provided, the output data will be written there. If no pre-allocated `output` buffer is provided, a new `Float32Array` will be automatically allocated.

MapVoice
--------
`function mapVoice(segments: CurveInput, voice: VoiceRange): CurveInput`

The `mapVoice` function shifts the frequency and amplitude ranges of a pre-existing set of curve segments, based on a `VoiceRange` structure of the following form:

```ts
interface VoiceRange {
  f?: VoiceParams; // Describes changes to the frequency channel
  a?: VoiceParams; // Describes changes to the amplitude channel
}

interface VoiceParams {
  // Specifies the center around which to
  // scale the voice range Defaults to zero.
  center?: number;

  // Specifies how far to shift the center
  // of the range. Defaults to zero.
  shift?: number;

  // Specifies how much to scale the range.
  // Defaults to one.
  scale?: number;
}
```

Text2Formant
------------
The `Text2Formant` class encapsulates information about how to transform text into formant curves, and allows direct synthesis of interlaced frequency & amplitude formant samples or PCM samples.

```ts
class Text2Formant {

    constructor(sys: AcousticModel);

    // Produces a sequence of curve Segments from an input text,
    // based on the stored acoustic model, and optionally applies
    // a VoiceRange transformation concurrently.
    transform(text: string, voice?: VoiceRange): Generator<Segment>;

    // Generate interlaced frequency and amplitude data from text.
    spline(args: {
        text: string;
        voice?: VoiceRange;
        output?: CurveOutput;
    }): [ArrayLike<number>, number];

    // Generate PCM data directly from text.
    synthesize({ text, voice, settings }: {
        text: string;
        voice?: VoiceRange;
        settings: WhistleSynthesisSettings;
    }): [ArrayLike<number>, number];
}
```

Curve Input Format
============

`CurveInput` is an array of `Segment` objects, which are defined as follows:

```ts
type Segment = {
  f: SignalComponent; // Description of the frequency component.
  a: SignalComponent; // Description of the amplitude component.
  run: number;        // The number of samples to use for the this segment.
}

type SignalComponent = Transition | Contour | Constant;

type TransitionCurve = 'sine' | 'arcsine' | 'concave' | 'convex';
interface Transition {
  type: 'transition';
  curve?: TransitionCurve; // Defaults to 'sine'.
  sy: number;     // Starting value of this segment.
  ey: number;     // Ending value of this segment.
  sclip?: number; // How much of the start of the base curve to clip off. 
  eclip?: number; // How much of the end of the base curve to clip off. 
}

type ContourCurve = 'sine' | 'ellipse';
interface Contour {
  type: 'contour';
  curve?: ContourCurve; // Defaults to 'sine'.
  y: number;      // The starting and ending value of this segment.
  a: number;      // The maximum amplitude by which to deviate from
                  // the boundary value (positive or negative).
  clip?: number;  // How much to clip off of the start and end
                  // of the base curve.
}

interface Constant {
  type: 'constant';
  y: number;  // The constant value to maintain during this segment.
}
```

By default, `sine` curve segments (and constant segments) will have slopes of zero (horizontal) at the boundaries. This makes it trivial to produce smooth transitions between segments--just make sure the y-values at adjacent segments match. Setting non-zero `clip`, `sclip`, or `eclip` values will change that, in which case you are responsible for your own discontinuities!

In contrast, `ellipse` and `arcsine` curves will have vertical slopes at the boundaries, which also facilitates smooth transitions, although in this case it is up to you to ensure that the direction (up vs. down) matches across segments--unless, of course, you *want* a spike. Again, clipping will change that, resulting in arbitrary boundary slopes.

An `arcsine` transition will have up-vertical slopes at both boundaries if `sy < ey`, and down-vertical slopes at both boundaries if `sy > ey`.

An `ellipse` contour will have an up-vertical starting boundary and down-vertical ending boundary when `a > 0` and a down-vertical starting boundary and up-vertical ending boundary when `a < 0`.

The `concave` and `convex` transition curve types permit switching between horizontal and vertical boundary slopes using elliptical quarter arcs. If `sy < ey` (i.e., we are transitioning upwards), then a `concave` curve will start horizontal and transition to up-vertical, while a `convex` start up-vertical and transition to horizontal. If `sy > ey` (i.e., we are transitioning downwards), a `concave` curve will start down-vertical and transition to horizontal, while a `convex` curve will start horizontal and transition to down-vertical.

For usage examples, see `src/test.ts`.

Acoustic Models
===============

Acoustic models are structures of the following form:

```ts
interface AcousticModel {
  // Specifies how to segment text into words.
  wordBoundary?: string | RegExp;

  // Defines named curves that may be re-used as the pronunciations
  // of multiple different words or contextual graphemes.
  namedPronunciations?: { [name: string]: CurveInput };

  // Defines special words with idiomatic pronunciations.
  words?: { [word: string]: CurveInput | string };

  // The only required field; defines graphemes and how they
  // are pronounced in all possible contexts.
  graphemes: { [grapheme: string]: ContextualPronunciation[] };
}

interface ContextualPronunciation {
  ante: string; // Specifies the preceding context grapheme (or empty string) for this pronunciation.
  post: string; // Specifies the following context grapheme (or empty string) for this pronunciation.
  pron: CurveInput | string; // Specifies the pronunciation to be used in this context.
}
```

Graphemes in a model can be multiple characters long, but words will be paersed into graphemes in a strictly greedy, longest-possible-match manner, and contexts can only be one grapheme long in either direction.

Command Line Interface
======================

`whistler curves [--input/-i FilePath] [--output/-p FilePath] [--sampleRate/-r number]`

The `curves` command reads in `CurveInput` data in JSON format, synthesizes PCM audio from it, and writes the results as a WAV file.

* If an input file is missing, it will read from STDIN.
* If an output file is missing, it will write to STDOUT.
* If a sample rate is missing, it will default to 44100 samples/second.

`whistler text [--config/-c FilePath] [--input/-i FilePath] [--output/-p FilePath] [--sampleRate/-r number] [--fc number] [--ac number] [--fs number] [--as number] [--fm number] [--am number]`

The `text` command reads in an acoustic model stored in a JSON config file (note that this does not permit the use of `RegExp` objects for word boundaries) and uses it to create a WAV audio file from input text. Input, output, and sample rate defaults are as above.

The additional parameters specify `VoiceRange` fields:

* `fc` and `ac` specify the frequency and amplitude centers, and default to zero.
* `fs` and `as` specify the frequency and amplitude shifts, and default to zero.
* `fm` and `am` specify the frequency and amplitude scales (multiples), and default to one.
