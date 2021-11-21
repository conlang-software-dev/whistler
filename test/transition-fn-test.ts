import 'mocha';
import { expect } from 'chai';
import { getTransitionFn, TransitionCurve } from '../src/transitions';

const sampleRate = 44100;
const run = 250;
const samples = run * sampleRate / 1000;

describe("Transition Function Test", function() {
  for (const curve of ['sine', 'arcsine', 'convex', 'concave'] as TransitionCurve[]) {
    for (const [sy, ey] of [[440, 880], [880, 440]]) {
      it(`Should calculate correct endpoints for ${sy < ey ? 'up' : 'down'}wards ${curve} transition`, () => {
        const fn = getTransitionFn(
          samples,
          { type: 'transition', curve, sy, ey },
          _ => _ => _,
        );
        expect(fn(0)).to.eql(sy);
        expect(fn(samples)).to.eql(ey);
      });
    }
  }
});