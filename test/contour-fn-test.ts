import 'mocha';
import { expect } from 'chai';
import { ContourCurve, getContourFn } from '../src/contours';

const sampleRate = 44100;
const run = 250;
const samples = run * sampleRate / 1000;

describe("Contour Function Test", function() {
  for (const curve of ['sine', 'ellipse'] as ContourCurve[]) {
    for (const [y, a] of [[440, 880], [880, 440]]) {
      it(`Should calculate correct endpoints for ${a > 0 ? 'up' : 'down'}wards ${curve} contour`, () => {
        const fn = getContourFn(
          samples,
          { type: 'contour', curve, y, a },
        );
        expect(fn(0)).to.eql(y);
        expect(fn(samples / 2)).to.eql(y + a);
        expect(fn(samples)).to.eql(y);
      });
    }
  }
});