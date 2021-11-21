import { DynamicFn, getInterpreter, InterpArgs, InterpFn } from './interpreter';
import { ModelSegment, normalize, Segment } from './segment';
import { CurveInput, CurveOutput, _spline } from './spline';
import { WhistleSynthesisSettings, _synthesize } from './synthesize';
import { mapVoice, VoiceRange } from './voice';

export interface ContextualPronunciation {
  con: [string, string];
  pron?: (ModelSegment|string)[] | string;
}

export interface AcousticModel {
  wordBoundary?: string | RegExp;
  words?: { [key: string]: (ModelSegment|string)[] | string };
  constants?: { [key: string]: number | string };
  namedPronunciations?: { [key: string]: (ModelSegment|string)[] | string };
  classes?: { [key: string]: string[] };
  graphemes: { 
    [key: string]: {
      elsewhere?: (ModelSegment|string)[] | string;
      contexts: ContextualPronunciation[];
    };
  };
}

function resolvePron(
  name: (ModelSegment|string)[] | string,
  namedProns: { [key: string]: (ModelSegment|string)[] | string },
  seen = new Set<string>(),
): CurveInput | string {
  if (typeof name === 'string') { 
    if (seen.has(name)) {
      throw new Error(`Could not resolve recursive name "${name}".`);
    }

    const pron = namedProns[name];
    if (!pron) return name;
    seen.add(name);
    const ret = resolvePron(pron, namedProns, seen);
    seen.delete(name);
    return ret;
  }

  const ret: CurveInput = [];
  for (const s of name) {
    if (typeof s !== 'string') { ret.push(s); }
    else {
      const c = resolvePron(s, namedProns, seen);
      if (typeof c === 'string') return c;
      ret.push(...c);
    }
  }
  return ret;
}

type WordLookup = Map<string, CurveInput>

function wordsToLookup({ namedPronunciations = {}, words }: AcousticModel) : WordLookup {
  const wordMap: WordLookup = new Map();
  if (typeof words !== 'undefined') {
    for (const [word, pron] of Object.entries(words)) {
      const curve = resolvePron(pron, namedPronunciations);
      if (typeof curve === 'string') {
        throw new Error(`Could find named pronunciation "${pron}" for word "${word}"`);
      } else {
        wordMap.set(word, curve);
      }
    }
  }
  return wordMap;
}

function resolveClassMembers(classes: { [key: string]: string[] }, key: string, members: string[], seen: Set<string>) {
  const ret: string[] = [];
  for (const val of members) {
    if (seen.has(val)) {
      throw new Error(`Circular class definition for "${val}" encountered in "${key}".`);
    }
    const subclass = classes[val];
    if (subclass) {
      seen.add(key);
      ret.push(...resolveClassMembers(classes, val, subclass, seen));
      seen.delete(key);
    } else {
      ret.push(val);
    }
  }
  return ret;
}

function resolveClasses(classes: { [key: string]: string[] }) {
  const ret = { ...classes };
  const seen = new Set<string>();
  for (const [key, vals] of Object.entries(classes)) {
    ret[key] = resolveClassMembers(ret, key, vals, seen);
  }
  return ret;
}

type PronLookup = Map<string, { elsewhere?: CurveInput, contexts: Map<string, Map<string, CurveInput>> }>;

function graphemesToLookup({ namedPronunciations = {}, classes = {}, graphemes }: AcousticModel): PronLookup {
  const graphMap: PronLookup = new Map();
  classes = resolveClasses(classes);
  for (const [grapheme, { elsewhere, contexts }] of Object.entries(graphemes)) {
    const elsePron = (typeof elsewhere !== 'undefined') ?
      resolvePron(elsewhere, namedPronunciations) : void 0;
    if (typeof elsePron === 'string') {
      throw new Error(`Could find named pronunciation "${elsePron}" for grapheme "${grapheme}" in 'elsewhere' context.`);
    }
    
    const anteMap = new Map<string, Map<string, CurveInput>>();
    graphMap.set(grapheme, {
      elsewhere: elsePron,
      contexts: anteMap,
    });
    for (const { con: [anteClass, postClass], pron } of contexts) {
      const anteMembers = classes[anteClass] || [anteClass];
      const postMembers = classes[postClass] || [postClass];
      for (const ante of anteMembers) {
        let postMap = anteMap.get(ante);
        if (!postMap) {
          postMap = new Map<string, CurveInput>();
          anteMap.set(ante, postMap);
        }
        for (const post of postMembers) {
          if (typeof pron === 'undefined') {
            postMap.set(post, []);
          } else {
            const curve = resolvePron(pron, namedPronunciations);
            if (typeof curve === 'string') {
              if (curve === pron) {
                throw new Error(`Could not find named pronunciation "${pron}" for grapheme "${grapheme}" in context "${anteClass}"_"${postClass}".`);
              }
              throw new Error(`Could not resolve named pronunciation "${pron}" for grapheme "${grapheme}" in context "${anteClass}"_"${postClass}"; could not find name "${curve}".`);
            }
            postMap.set(post, curve);
          }
        }
      }
    }
  }
  return graphMap;
}

class GreedyTokenizer {
  private graphemes: Set<string>;
  constructor(graphemes: { [key: string]: unknown }) {
    this.graphemes = new Set(Object.keys(graphemes));
  }

  * tokenize(text: string) {
    const { graphemes } = this;
    const len = text.length;
    let i = 0;
    while (i < len) {
      let candidate = '';
      // Find a minimum length candidate
      while (!graphemes.has(candidate)) {
        if (i === len) throw new Error(`Unrecognized sequence: "${candidate}"`);
        candidate += text[i++];
      }
      // Keep extending to find the max length candidate
      if (i < len) {
        do {
          const nc = candidate + text[i];
          if (graphemes.has(nc)) {
            candidate = nc;
            i++;
          } else break;
        } while (i < len);
      }
      yield candidate;
    }
  }
}

function getContextualPronunciation(graphMap: PronLookup, ante: string, current: string, post: string): CurveInput {
  const info = graphMap.get(current);
  if (!info) { throw new Error(`Unrecognized grapheme: "${current}"`); }
  const { elsewhere, contexts: anteMap } = info;
  const postMap = anteMap && anteMap.get(ante);
  const pron = (postMap && postMap.get(post)) || elsewhere;
  if (!pron) throw new Error(`Unrecognized grapheme context: "${current}" in ${ante ? `"${ante}"` : ''}_"${post}"`);
  return pron;
}

export class Text2Formant {
  private wordMap: WordLookup;
  private graphMap: PronLookup;
  private tok: GreedyTokenizer;
  private wordBoundary?: RegExp;
  private argFn: InterpArgs;
  private interpFn: InterpFn;
  private dynFn: DynamicFn

  constructor(sys: AcousticModel) {
    this.wordBoundary = typeof sys.wordBoundary === 'string' ?
      new RegExp(sys.wordBoundary, 'g') : sys.wordBoundary;
    this.wordMap = wordsToLookup(sys);
    this.graphMap = graphemesToLookup(sys);
    this.tok = new GreedyTokenizer(sys.graphemes);
    [this.argFn, this.interpFn, this.dynFn] = getInterpreter(sys.constants);
  }

  * text2segments(text: string): Generator<ModelSegment, void, undefined> {
    const { wordBoundary, tok, wordMap, graphMap } = this;
    const chunks = wordBoundary ? text.split(wordBoundary) : [text];
    for (const chunk of chunks) {
      if (wordMap.has(chunk)) {
        yield * wordMap.get(chunk) as CurveInput;
      } else {
        let ante = '';
        let current = '';
        for (const post of tok.tokenize(chunk)) {
          if (current !== '') {
            yield * getContextualPronunciation(graphMap, ante, current, post);
          }
          ante = current;
          current = post;
        }
        yield * getContextualPronunciation(graphMap, ante, current, '');
      }
    }
  }

  normalize(segments: Iterable<ModelSegment>): Generator<Segment, void, undefined> {
    const { argFn, interpFn: interp } = this;
    return normalize(segments, argFn, interp);
  }

  text2norm(text: string): Generator<Segment, void, undefined> {
    return this.normalize(this.text2segments(text));
  }

  spline({ text, sampleRate, output, voice }:
    { text: string, sampleRate: number, output?: CurveOutput, voice?: VoiceRange }
  ): [ArrayLike<number>, number] {
    let segs = this.text2norm(text);
    if (typeof voice !== 'undefined') { segs = mapVoice(segs, voice); }
    return _spline([...segs], sampleRate, this.dynFn, output);
  }

  synthesize({ text, settings, voice }:
    { text: string, voice?: VoiceRange, settings: WhistleSynthesisSettings }
  ): [ArrayLike<number>, number] {
    let segs = this.text2norm(text);
    if (typeof voice !== 'undefined') { segs = mapVoice(segs, voice); }
    return _synthesize([...segs], this.dynFn, settings);
  }
}