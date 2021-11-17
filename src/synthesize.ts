import { FMSynthInterlacedInput, fromInterlaced } from "fm-synthesis";
import { spline, CurveInput } from './spline';

export type WhistleSynthesisSettings = Omit<FMSynthInterlacedInput, 'data'>;
export interface WhistleSynthesisArgs {
  segments: CurveInput;
  settings: WhistleSynthesisSettings;
}

export function synthesize({ segments, settings }: WhistleSynthesisArgs): [ArrayLike<number>, number] {
  const [data] = spline(segments) as [Float32Array, number];
  const { output: buffer = data } = settings;
  const [output, offset] = fromInterlaced( { ...settings, data, output: buffer });
  return [output === data ? data.subarray(0, data.length / 2) : output, offset];
}