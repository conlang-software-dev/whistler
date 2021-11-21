import 'mocha';
import { expect } from 'chai';
import { spline } from "../src";
import { TransitionCurve } from '../src/transitions';

const sampleRate = 44100;
const run = 250;
const len = run * sampleRate / 500;

describe("Spline Test", function() {
  for (const curve of ['sine', 'arcsine', 'convex', 'concave'] as TransitionCurve[]) {
    for (const [sy, ey] of [[440, 880], [880, 440]]) {
          
      it(`Should synthesize samples with correct endpoints for ${sy < ey ? 'up' : 'down'}wards ${curve} transition`, () => {
        const [data] = spline({ 
          sampleRate,
          segments: [{
            f: { type: 'transition', curve, sy, ey },
            a: { type: 'constant', y: 1 },
            run,
          }],
        });
        expect(data[0]).to.eql(sy);
        expect(data[1]).to.eql(1);
        expect(Math.abs(data[len - 2] - ey)).to.be.lessThan(0.1);
        expect(data[len - 1]).to.eql(1);
      });
    }
  }
});