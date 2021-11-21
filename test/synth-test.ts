import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import WavEncoder from 'wav-encoder'; 
import { CurveInput, synthesize } from "../src";

const sampleRate = 44100;
const segments: CurveInput = [{
  f: {
    type: 'transition',
    sy: 440,
    ey: 880,
  },
  a: {
    type: 'contour',
    y: 0.25,
    a: 0.75,
  },
  run: 1000,
}, {
  f: {
    type: 'transition',
    curve: 'convex',
    sy: 880,
    ey: 220,
  },
  a: {
    type: 'transition',
    sy: 0.25,
    ey: 0.75,
  },
  run: 1000,
}, {
  f: {
    type: 'transition',
    curve: '=2 * t / pi',
    sy: 220,
    ey: 440,
  },
  a: {
    type: 'constant',
    y: 0.75,
  },
  run: 1000,
}];

describe("Curve Synthesis Test", function() {
  this.timeout(0);
  it("Should synthesize PCM data", () => {
    const pcmFile = path.join(__dirname, "fixtures/synth1.pcm");
    const buffer = fs.readFileSync(pcmFile);
    const a = new Uint8Array(buffer);
    const [PCM] = synthesize({ segments, settings: { sampleRate } });
    const b = new Uint8Array((PCM as Float32Array).buffer);
    //fs.writeFileSync(pcmFile, b);

    WavEncoder.encode({
      sampleRate,
      channelData: [PCM as Float32Array],
    }).then((buffer: ArrayBuffer) => {
      fs.writeFileSync('synth1.wav', new Uint8Array(buffer));
    });

    expect(b).to.eql(a);
  });
});