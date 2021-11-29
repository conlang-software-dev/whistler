# whistler
A library and command line utility for synthesizing examples of whistled speech.

Install with `npm i whistle-synthesis`

Say What Now?
=============

[Whistled speech](https://en.wikipedia.org/wiki/Whistled_language) is an alternate modality available to many language for communication over large distances. It simplifies the complexities of normal human speech down to a single frequency curve, encoding either lexical tone or major vowel formants and major frequency contour properties of consonants. While many distinctions present in normal spoken language are lost (i.e., Silbo, the whistled register of Spanish, has only 2 vowels instead of 5), whistling is still capable of conveying arbitrary complex messages.

Since the function of whistled speech is to communicate over larger distances than are practical with normal speech, details of articulation and timbre (sound quality) don't matter--you can whistle however you want to whistle, in whatever way allows you be loudest, as long as you can produce the right frequency curves. Even using musical instruments like [slide whistles](https://en.wikipedia.org/wiki/Slide_whistle) is an option. This means that whistle speech synthesis can be significantly simpler than general speech synthesis. The computer doesn't have to reproduce the quality of a human voice, or a human-produced whistle, exactly--it just has to reproduce the frequency curves.

So, this library gives you the tools for describing those frequency curves, and then generating actual PCM audio data from them.

Why?
===

I originally wanted to build this to make it easier to develop whistled conlangs; sure, I *could* learn to whistle myself, but I'm a software engineer, so this was easier (especially as a follow-on to my previous [xenophonology](https://github.com/conlang-software-dev/xenophonology) project), and it avoids the risk of performance anxiety! But hey, now that it's done, it ought to be perfectly suitable for building synthesizers for natural whistled languages, if any adventurous linguists feel like putting in the effort to write accurate acoustic models for them.

What's In It
============

This package exports three free functions and a class:

Spline
------
```ts
interface SplineArgs {
  // Curve segments to render into samples
  segments: CurveInput;
  // Samples per second
  sampleRate: number;
  // Optional pre-allocated output buffer
  output?: CurveOutput
  // Where in the output buffer to start writing; defaults to 0
  offset?: number;
  // Constant values that may be referenced in segment definitions.
  constants?: { [key: string]: number; };
  // Optional specification of how to shift the output
  // frequency and amplitude ranges and speech rate.
  voice?: VoiceRange;
}

function spline(ars: SplineArgs): [CurveOutput, number]
```

The `spline` function takes in a description of a complete frequency / amplitude curve in terms of a sequence of segments of independently-controllable frequency & amplitude curves, represented in terms of segments of scaled and shifted sinusoids and elliptical arcs, and outputs a writable `ArrayLike` `CurveOutput` object with interlaced [frequency, amplitude] data, along with a number indicating the next offset to be written to in the output buffer. Sinusoids and ellipses are chosen as the basic components because they guarantee constant boundary slopes (either horizontal or vertical) at the boundaries, regardless of how they are scaled, thus making it easy to produce smooth transitions between segments.

If an `output` writable `ArrayLike` is provided, the output data will be written there, beginning at the specified `offset` (which defaults to 0). An error is thrown if the provided output buffer is not large enough. If no pre-allocated `output` buffer is provided, a new `Float32Array` will be automatically allocated.

Synthesize
----------

```ts
interface WhistleSynthesisArgs {
  // Curve segments to render into samples
  segments: CurveInput;
  // General audio synthesis settings
  settings: WhistleSynthesisSettings;
  // Optional specification of how to shift the output
  // frequency and amplitude ranges and speech rate.
  voice?: VoiceRange,
  // Constant values that may be referenced in segment definitions.
  constants?: { [key: string]: number; };
}

function synthesize(args: WhistleSynthesisArgs): [ArrayLike<number>, number]
```

The `synthesize` function internally calls `spline`, passes the results to the `fm-synthesis` package to produce PCM data, and returns a writable `ArrayLike` object containing the PCM data, along with a number indicating the next offset to be written to.

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
```ts
function mapVoice(segments: Iterable<Segment>, voice: VoiceRange): Generator<Segment>
```

The `mapVoice` function transforms a sequence of concrete curve segments (i.e., segments where all parameters are specific numbers, not formulae) into a new sequence of segments which have had their frequency and amplitude ranges and speech rate adjusted.

This function is used internally by `spline` and `synthesize` to handle voice transformations, but it can be called independently if you wish.

TextModel
------------
The `TextModel` class encapsulates information about how to transform text into formant curves, and allows direct synthesis of interlaced frequency & amplitude formant samples or PCM samples.

```ts
class TextModel {

    constructor(sys: AcousticModel);

    // Produces a sequence of ModelSegments from an input text,
    // based on the stored acoustic model.
    text2segments(text: string): Generator<ModelSegment>;
    
    // Turns a sequence of ModelSegments, which may contain
    // interpretable expressions, into concrete Segments
    // with all expressions replaced by numbers.
    normalize(segments: Iterable<ModelSegment>): Generator<Segment>;
    
    // Produces concrete Segments directly from input text.
    text2norm(text: string): Generator<Segment>;

    // Generates interlaced frequency and amplitude data from text.
    spline(args: {
        text: string;
        sampleRate: number;
        output?: CurveOutput;
        voice?: VoiceRange;
    }): [ArrayLike<number>, number];

    // Generate PCM data directly from text.
    synthesize(args: {
        text: string;
        voice?: VoiceRange;
        settings: WhistleSynthesisSettings;
    }): [ArrayLike<number>, number];
}
```

Curve Input Format
============

`CurveInput` is an array of `ModelSegment` objects, which are defined as follows:

```ts
type ModelSegment = {
  // Description of the frequency component.
  // Defaults to a constant continuing the
  // previous segment's final value.
  f?: ModelComponent;

  // Description of the amplitude component.
  // Defaults to a constant continuing the
  // previous segment's final value.
  a?: ModelComponent;

  // The duration of this segment in milliseconds.
  // Defaults to zero.
  run?: number | string;       
}

type ModelComponent = ModelTransition | ModelContour | ModelConstant;

type TransitionCurve = 'sine' | 'arcsine' | 'concave' | 'convex' | `=${string}`;
interface ModelTransition {
  type: 'transition';
  curve?: TransitionCurve; // Defaults to 'sine'.
  
  // Starting value of this segment.
  // Defaults to previous segment's final value.
  sy?: number | string;
  
  // Ending value of this segment.
  // Defaults to previous segment's final value.  
  ey?: number | string;
  
  // How much of the start of the base curve to clip off. 
  sclip?: number | string;

  // How much of the start of the base curve to clip off.
  eclip?: number | string;
}

type ContourCurve = 'sine' | 'ellipse';
interface ModelContour {
  type: 'contour';
  curve?: ContourCurve; // Defaults to 'sine'.

  // The starting and ending value of this segment.
  // Defaults to previous segment's final value.
  y?: number | string;      
  
  // The maximum amplitude by which to deviate from
  // the boundary value (positive or negative).
  a: number | string;

  // How much to clip off of the start
  // and end of the base curve.
  clip?: number | string;  
                           
}

interface ModelConstant {
  type: 'constant';
  // The constant value to maintain during this segment.
  // Defaults to the previous segment's final value.
  y?: number | string;
}
```

Each of these `Model` types have corresponding plain types (`Segment`, `SignalComponent`, `Transition`, `Contour`, and `Constant`) with identical semantics, in which all `number | string` fields are instead specified as strict `number` fields. `Model` types are converted into their corresponding concrete types during `spline`ing, when string fields are interpreted as mathematical expressions referring to predefined constants.

Curve Types
-----------

By default, `sine` curve segments (and constant segments) will have slopes of zero (horizontal) at the boundaries. This makes it trivial to produce smooth transitions between segments--just make sure the y-values at adjacent segments match. Setting non-zero `clip`, `sclip`, or `eclip` values will change that, in which case you are responsible for your own discontinuities!

In contrast, `ellipse` and `arcsine` curves will have vertical slopes at the boundaries, which also facilitates smooth transitions, although in this case it is up to you to ensure that the direction (up vs. down) matches across segments--unless, of course, you *want* a spike. Again, clipping will change that, resulting in arbitrary boundary slopes.

An `arcsine` transition will have up-vertical slopes at both boundaries if `sy < ey`, and down-vertical slopes at both boundaries if `sy > ey`.

An `ellipse` contour will have an up-vertical starting boundary and down-vertical ending boundary when `a > 0` and a down-vertical starting boundary and up-vertical ending boundary when `a < 0`.

The `concave` and `convex` transition curve types permit switching between horizontal and vertical boundary slopes using elliptical quarter arcs. If `sy < ey` (i.e., we are transitioning upwards), then a `concave` curve will start horizontal and transition to up-vertical, while a `convex` start up-vertical and transition to horizontal. If `sy > ey` (i.e., we are transitioning downwards), a `concave` curve will start down-vertical and transition to horizontal, while a `convex` curve will start horizontal and transition to down-vertical.

The `=${string}` curve type allows you to define arbitrary curves based on mathematical expressions. Custom curve functions will be evaluated between -pi/2 and +pi/2, and are expected to range between -1 and 1.

Model Expression Language
-------------------------

Model expressions are parenthesized mathematical expressions. Expressions can use decimal numbers, as well as named constants defined by an `AcousticModel` or passed into the `spline` or `synthesize` functions, and also have acccess to the predefined constants `pi` and `e`.

Expressions curve expressions also have acces to, and are expected to use, the special variable `t` (for 'time' or 'theta', whichever you prefer). For example, a strictly linear transition curve would look like this:

`=2 * t / pi`

Other expressions do not have access to the `t` variable, but do have four other special contextual variables:

* `lf` refers to the last frequency value of the preceding segment.
* `la` refers to the last amplitude value of the preceding segment.
* `f_phi` refers to final phase of the frequency curve in the preceding segment.
* `a_phi` refers to the final phase of the amplitude curve in the preceding segment.

`ModelSegment`s with `run` values of 0 can be used to intentionally set `lf`, `la`, `f_phi`, and `a_phi` values for subsequent contextual segments.

### Operators & Functions
Expressions can use all of the basic infix operators (`+`, `-`, `/`, `*` (multiplication), and `^` (exponentiation)), wich have the usual precedence order, as well as parentheses for grouping terms. Additionally, there are the following built-in functions:

* `sin(x)`
* `cos(x)`
* `log(x)` -- natural logarithm
* `lr(x, a1, b1, a2, b2)` -- linear range; maps a value `x` from the interval [`a1`, `b1`] to the new interval [`a2`, `b2`].

Voice Range Format
==================

```ts
interface VoiceRange {
  f?: VoiceParams; // Describes changes to the frequency channel
  a?: VoiceParams; // Describes changes to the amplitude channel
  rate?: number    // Factor by which to scale the speaking rate
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

Acoustic Models
===============

Acoustic models are structures of the following form:

```ts
interface AcousticModel {
  // Specifies how to segment text into words.
  // String values will treated as regex source and converted into
  // regular expressions internally; this permits AcousticModels
  // to be specified entirely in JSON, rather than code. 
  wordBoundary?: string | RegExp;

  // Defines named curves that may be re-used as the pronunciations
  // of multiple different words or contextual graphemes.
  // Named curves can themselves include other names of curves
  // to include as sub-components, or refer to them as aliases.
  namedPronunciations?: { [name: string]: (ModelSegment | string)[] | string };

  // Defines special words with idiomatic pronunciations.
  words?: { [word: string]: (ModelSegment | string)[] | string; };

  // Defines named constants that can be used in mathematical
  // expressions. Constants can be defined in terms of other
  // constants, as long as there are no circular definitions.
  constants?: { [key: string]: number | string; };

  // Defines sets of graphemes which can be referred to by
  // name in context definitions. Like named curves, classes
  // can contain other classes as sub-components.
  classes?: { [className: string]: string[] };

  // The only required field; defines graphemes and how they
  // are pronounced in all possible contexts.
  graphemes: { 
    [grapheme: string]: {
      // The optional 'elsewhere' field describes
      // a generic pronunciation to insert when
      // a context that has not been specifically
      // encoded in the model is encountered.
      elsewhere?: (ModelSegment | string)[] | string;

      // A list of contexts in which this grapheme
      // may appear, along with its pronunciations
      // in those contexts.
      contexts?: ContextualPronunciation[];
    };
  };
}

interface ContextualPronunciation {
  // Specifies the preceding and following
  // context graphemes (or empty strings)
  // for this pronunciation. 'pre' and 'post'
  // may each be either an individual
  // grapheme, or the name of a class.
  con: [pre: string, post: string];

  // Specifies the pronunciation for this context.
  // Omitting this field indicates that the
  // grapheme is realized entirely by its effects
  // on its neighbors, and takes no time of its own
  // in this context.
  pron?: (ModelSegment | string)[] | string;
}
```

Graphemes in a model can be multiple characters long, but words will be parsed into graphemes in a strictly greedy, longest-possible-match manner, and contexts can only be one grapheme long in either direction.

Command Line Interface
======================

`whistler curves [--input/-i FilePath] [--output/-p FilePath] [--sampleRate/-r number]`

The `curves` command reads in `CurveInput` data in JSON format, synthesizes PCM audio from it, and writes the results as a WAV file.

* If an input file is missing, it will read from STDIN.
* If an output file is missing, it will write to STDOUT. An `output` value `:speaker` will play the audio directly instead of producing a WAV file.
* If a sample rate is missing, it will default to 44100 samples/second.

`whistler text [--config/-c FilePath] [--input/-i FilePath] [--output/-p FilePath] [--sampleRate/-r number] [--voiceRate number] [--fc number] [--ac number] [--fs number] [--as number] [--fm number] [--am number]`

The `text` command reads in an acoustic model stored in a JSON config file (note that this does not permit the use of `RegExp` objects for word boundaries) and uses it to create a WAV audio file from input text. Input, output, and sample rate defaults are as above.

The additional parameters specify `VoiceRange` fields:

* `fc` and `ac` specify the frequency and amplitude centers, and default to zero.
* `fs` and `as` specify the frequency and amplitude shifts, and default to zero.
* `fm` and `am` specify the frequency and amplitude scales (multiples), and default to one.
* `voiceRate` specifies the factor by which to scale the speech rate.

Usage Examples
==============

See the `/test` folder for basic usage examples. `/test/synth-test.ts` has a short example of manually-constructed `CurveInput` and call to the `synthesize` function. `/test/fixtures/model1.ts` contains a (not terribly realistic) example `AcousticModel`, which is used to synthesize audio from text in `/test/text-test.ts`.