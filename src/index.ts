import { Transition, Contour, Constant, SignalComponent, Segment } from './segment';
import { spline, CurveInput, CurveOutput } from './spline';
import { FMOutputArray } from 'fm-synthesis';
import { synthesize, WhistleSynthesisArgs, WhistleSynthesisSettings } from './synthesize';
import { Text2Formant, ContextualPronunciation, TranscriptionSystem, VoiceParams, VoiceRange } from './transcription';

export {
  Transition, Contour, Constant, SignalComponent, Segment,
  spline, CurveInput, CurveOutput, FMOutputArray,
  synthesize, WhistleSynthesisSettings, WhistleSynthesisArgs,
  Text2Formant, ContextualPronunciation, TranscriptionSystem, VoiceParams, VoiceRange, 
}
