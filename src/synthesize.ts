import { FMSynthInterlacedInput, fromInterlaced } from "fm-synthesis";
import { _spline, CurveInput } from './spline';
import { DynamicFn, getInterpreter } from "./interpreter";
import { mapVoice, VoiceRange } from "./voice";
import { normalize, Segment } from "./segment";

export type WhistleSynthesisSettings = Omit<FMSynthInterlacedInput, 'data'>;
export interface WhistleSynthesisArgs {
  segments: CurveInput;
  settings: WhistleSynthesisSettings;
  voice?: VoiceRange,
  constants?: { [key: string]: number };
}

export function _synthesize(segments: Segment[], dynFn: DynamicFn, settings: WhistleSynthesisSettings): [ArrayLike<number>, number] {
  const [data] = _spline(segments, settings.sampleRate, dynFn) as [Float32Array, number];
  const { output: buffer = data } = settings;
  const [output, offset] = fromInterlaced( { ...settings, data, output: buffer });
  return [output === data ? data.subarray(0, data.length / 2) : output, offset];
}

export function synthesize({ segments, settings, constants, voice }: WhistleSynthesisArgs): [ArrayLike<number>, number] {
  const [argFn, interpFn, dynFn] = getInterpreter(constants);
  let nsegs = normalize(segments, argFn, interpFn);
  if (typeof voice !== 'undefined') { nsegs = mapVoice(nsegs, voice); }
  return _synthesize([...nsegs], dynFn, settings);
}