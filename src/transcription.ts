import { CurveOutput } from '.';
import { Segment, SignalComponent } from './segment';
import { spline, CurveInput } from './spline';
import { synthesize, WhistleSynthesisSettings } from './synthesize';

export interface ContextualPronunciation {
  ante: string;
  post: string;
  pron: CurveInput | string;
}

export interface TranscriptionSystem {
  wordBoundary?: string | RegExp;
  words?: { [key: string]: CurveInput | string };
  namedPronunciations: { [key: string]: CurveInput };
  graphemes: { [key: string]: ContextualPronunciation[] };
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

function mapVoice(segments: CurveInput, voice: VoiceRange): CurveInput {
  return segments.map(({ a, f, run }) => ({
    f: voice.f ? mapComponent(f, voice.f) : f,
    a: voice.a ? mapComponent(a, voice.a) : a,
    run,
  }));
}

type WordLookup = Map<string, CurveInput>

function wordsToLookup({ namedPronunciations, words }: TranscriptionSystem) : WordLookup {
  const wordMap: WordLookup = new Map();
  if (typeof words !== 'undefined') {
    for (const [word, pron] of Object.entries(words)) {
      if (typeof pron === 'string') {
        const curve = namedPronunciations[pron];
        if (curve) {
          wordMap.set(word, curve);
        } else {
          throw new Error(`Could find named pronunciation "${pron}" for word "${word}"`);
        }
      } else {
        wordMap.set(word, pron);
      }
    }
  }
  return wordMap;
}

type PronLookup = Map<string, Map<string, Map<string, CurveInput>>>;

function graphemesToLookup({ namedPronunciations, graphemes }: TranscriptionSystem): PronLookup {
  const graphMap: PronLookup = new Map();
  for (const [grapheme, contexts] of Object.entries(graphemes)) {
    const anteMap = new Map<string, Map<string, CurveInput>>();
    graphMap.set(grapheme, anteMap);
    for (const { ante, post, pron } of contexts) {
      let postMap = anteMap.get(ante);
      if (!postMap) {
        postMap = new Map<string, CurveInput>();
        anteMap.set(ante, postMap);
      }
      if (typeof pron === 'string') {
        const curve = namedPronunciations[pron];
        if (curve) {
          postMap.set(post, curve);
        } else {
          throw new Error(`Could find named pronunciation "${pron}" for grapheme "${grapheme}" in context "${ante}"_"${post}"`);
        }
      } else {
        postMap.set(post, pron);
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

export class Text2Formant {
  private wordMap: WordLookup;
  private graphMap: PronLookup;
  private tok: GreedyTokenizer;
  private wordBoundary?: string | RegExp;

  constructor(sys: TranscriptionSystem) {
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
            const anteMap = graphMap.get(current);
            const postMap = anteMap && anteMap.get(ante);
            const pron = postMap && postMap.get(post);
            if (!pron) throw new Error(`Unrecognized grapheme context: "${current}" in ${ante ? `"${ante}"` : ''}_"${post}"`);
            yield * vmap(pron);
          }
          ante = current;
          current = post;
        }
        const anteMap = graphMap.get(current);
        const postMap = anteMap && anteMap.get(ante);
        const pron = postMap && postMap.get('');
        if (!pron) throw new Error(`Unrecognized grapheme context: "${current}" in ${ante ? `"${ante}"` : ''}_`);
        yield * vmap(pron);
      }
    }
  }

  spline({ text, voice, output }: { text: string, voice?: VoiceRange, output?: CurveOutput }): [ArrayLike<number>, number] {
    return spline([...this.transform(text, voice)], output);
  }

  synthesize({ text, voice, settings }: { text: string, voice?: VoiceRange, settings: WhistleSynthesisSettings }): [ArrayLike<number>, number] {
    return synthesize({
      settings,
      segments: [...this.transform(text, voice)],
    })
  }
}