import { Constant, SignalComponent, Segment, ModelComponent, ModelConstant, ModelSegment } from './segment';
import { spline, CurveInput, CurveOutput } from './spline';
import { FMOutputArray } from 'fm-synthesis';
import { synthesize, WhistleSynthesisArgs, WhistleSynthesisSettings } from './synthesize';
import { Text2Formant, ContextualPronunciation, AcousticModel } from './model';
import { VoiceParams, VoiceRange } from './voice';
import { Contour, ContourCurve, ModelContour } from './contours';
import { Transition, TransitionCurve, ModelTransition } from './transitions';

export {
  Transition, TransitionCurve, Contour, ContourCurve, Constant, SignalComponent, Segment,
  ModelTransition, ModelContour, ModelConstant, ModelComponent, ModelSegment,
  spline, CurveInput, CurveOutput, FMOutputArray,
  synthesize, WhistleSynthesisSettings, WhistleSynthesisArgs,
  Text2Formant, ContextualPronunciation, AcousticModel, VoiceParams, VoiceRange,
}
