import { CurveOutput } from '.';
import { Segment, SignalComponent } from './segment';
import { spline, CurveInput } from './spline';
import { synthesize, WhistleSynthesisSettings } from './synthesize';

export interface ContextualPronunciation {
  con: [string, string];
  pron?: (Segment|string)[] | string;
}

export interface AcousticModel {
  wordBoundary?: string | RegExp;
  words?: { [key: string]: CurveInput | string };
  namedPronunciations?: { [key: string]: (Segment|string)[] };
  graphemes: { 
    [key: string]: {
      elsewhere?: CurveInput | string;
      contexts: ContextualPronunciation[];
    };
  };
}

export interface VoiceParams {
  center?: number;
  shift?: number;
  scale?: number;
}

export interface VoiceRange {
  f?: VoiceParams;
  a?: VoiceParams;
}

function mapComponent(comp: SignalComponent, { center = 0, shift = 0, scale = 1 }: VoiceParams) {
  const cs = center + shift;
  switch (comp.type) {
    case 'constant':   return { ...comp, y: scale * (comp.y - center) + cs };
    case 'contour':    return { ...comp, y: scale * (comp.y - center) + cs, a: comp.a * scale };
    case 'transition': return { ...comp, sy: scale * (comp.sy - center) + cs, ey: scale * (comp.ey - center) + cs }
  }
}

export function mapVoice(segments: CurveInput, voice: VoiceRange): CurveInput {
  return segments.map(({ a, f, run }) => ({
    f: voice.f ? mapComponent(f, voice.f) : f,
    a: voice.a ? mapComponent(a, voice.a) : a,
    run,
  }));
}

function resolvePron(
  name: (Segment|string)[] | string,
  namedProns: { [key: string]: (Segment|string)[] },
  seen = new Set<string>(),
): CurveInput | string {
  if (typeof name === 'string'){ 
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

type PronLookup = Map<string, { elsewhere?: CurveInput, contexts: Map<string, Map<string, CurveInput>> }>;

function graphemesToLookup({ namedPronunciations = {}, graphemes }: AcousticModel): PronLookup {
  const graphMap: PronLookup = new Map();
  for (let [grapheme, { elsewhere, contexts }] of Object.entries(graphemes)) {
    if (typeof elsewhere !== 'undefined') {
      elsewhere = resolvePron(elsewhere, namedPronunciations);
      if (typeof elsewhere === 'string') {
        throw new Error(`Could find named pronunciation "${elsewhere}" for grapheme "${grapheme}" in 'elsewhere' context.`);
      }
    }
    const anteMap = new Map<string, Map<string, CurveInput>>();
    graphMap.set(grapheme, { elsewhere, contexts: anteMap });
    for (const { con: [ante, post], pron } of contexts) {
      let postMap = anteMap.get(ante);
      if (!postMap) {
        postMap = new Map<string, CurveInput>();
        anteMap.set(ante, postMap);
      }
      if (typeof pron === 'undefined') {
        postMap.set(post, []);
      } else {
        const curve = resolvePron(pron, namedPronunciations);
        if (typeof curve === 'string') {
          if (curve === pron) {
            throw new Error(`Could not find named pronunciation "${pron}" for grapheme "${grapheme}" in context "${ante}"_"${post}".`);
          }
          throw new Error(`Could not resolve named pronunciation "${pron}" for grapheme "${grapheme}" in context "${ante}"_"${post}"; could not find name "${curve}".`);
        }
        postMap.set(post, curve);
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
    let candidate = '';
    while (i < len) {
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
  private wordBoundary?: string | RegExp;

  constructor(sys: AcousticModel) {
    this.wordBoundary = sys.wordBoundary;
    this.wordMap = wordsToLookup(sys);
    this.graphMap = graphemesToLookup(sys);
    this.tok = new GreedyTokenizer(sys.graphemes);
  }

  * transform(text: string, voice?: VoiceRange): Generator<Segment, void, undefined> {
    const { wordBoundary, tok, wordMap, graphMap } = this;
    const chunks = wordBoundary ? text.split(wordBoundary) : [text];
    const vmap: (s: CurveInput) => CurveInput = voice ? s => mapVoice(s, voice) : s => s;
    for (const chunk of chunks) {
      if (wordMap.has(chunk)) {
        yield * vmap(wordMap.get(chunk) as CurveInput);
      } else {
        let ante = '';
        let current = '';
        for (const post of tok.tokenize(chunk)) {
          if (current !== '') {
            const pron = getContextualPronunciation(graphMap, ante, current, post);
            yield * vmap(pron);
          }
          ante = current;
          current = post;
        }
        const pron = getContextualPronunciation(graphMap, ante, current, '');
        yield * vmap(pron);
      }
    }
  }

  spline({ text, sampleRate, voice, output }:
    { text: string, sampleRate: number, voice?: VoiceRange, output?: CurveOutput }
  ): [ArrayLike<number>, number] {
    return spline([...this.transform(text, voice)], sampleRate, output);
  }

  synthesize({ text, voice, settings }: { text: string, voice?: VoiceRange, settings: WhistleSynthesisSettings }): [ArrayLike<number>, number] {
    return synthesize({
      settings,
      segments: [...this.transform(text, voice)],
    })
  }
}