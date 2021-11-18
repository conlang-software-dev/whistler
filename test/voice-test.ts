import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import WavEncoder from 'wav-encoder';
import { Text2Formant, VoiceRange } from '../src';
import Model from './fixtures/model1';

describe("Text Synthesis with Voice", function() {
  const texts = fs.readFileSync(path.join(__dirname, 'fixtures/text1.txt'))
    .toString('utf8').split(/[\r\n]+/);

  const sampleRate = 44100;
  const interpreter = new Text2Formant(Model);
  const voice: VoiceRange = {
    f: {
      center: 2175,
      shift: -500,
      scale: 0.8,
    },
  };

  const text = texts[0];
  it(`Should synthesize shifted audio for "${text}"`, () => {
    const pcmFile = path.join(__dirname, 'fixtures/model1.voice1.pcm');
    const buffer = fs.readFileSync(pcmFile);
    const a = new Uint8Array(buffer);
    const [PCM ] = interpreter.synthesize({ text, voice, settings: { sampleRate } });
    const b = new Uint8Array((PCM as Float32Array).buffer);
    //fs.writeFileSync(pcmFile, b);
    
    WavEncoder.encode({
      sampleRate,
      channelData: [PCM as Float32Array],
    }).then((buffer: ArrayBuffer) => {
      fs.writeFileSync(`model1.voice1.wav`, new Uint8Array(buffer));
    });
    
    expect(b).to.eql(a);
  });
});