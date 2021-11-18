import fs from 'fs';
import WavEncoder from 'wav-encoder'; 
import { synthesize } from "../src";

const sampleRate = 44100;

const [PCM ] = synthesize({
  settings: { sampleRate },
  segments: [{
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
  }],
});

fs.writeFileSync('test.pcm', new Uint8Array((PCM as Float32Array).buffer));

WavEncoder.encode({
  sampleRate,
  channelData: [PCM as Float32Array],
}).then((buffer: ArrayBuffer) => {
  fs.writeFileSync('test.wav', new Uint8Array(buffer));
});