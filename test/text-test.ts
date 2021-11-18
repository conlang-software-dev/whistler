import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import WavEncoder from 'wav-encoder';
import { Text2Formant } from '../src';
import Model from './fixtures/model1';

describe("Text Synthesis", function() {
  const texts = fs.readFileSync(path.join(__dirname, 'fixtures/text1.txt'))
    .toString('utf8').split(/[\r\n]+/);

  const sampleRate = 44100;
  const interpreter = new Text2Formant(Model);

  let i = 1;
  for (const text of texts) {
    it(`Should synthesize audio for "${text}"`, () => {
      const pcmFile = path.join(__dirname, `fixtures/model1.text${i}.pcm`);
      const buffer = fs.readFileSync(pcmFile);
      const a = new Uint8Array(buffer);
      const [PCM ] = interpreter.synthesize({ text, settings: { sampleRate } });
      const b = new Uint8Array((PCM as Float32Array).buffer);
      //fs.writeFileSync(pcmFile, b);
      
      ((j: number) => {
          WavEncoder.encode({
          sampleRate,
          channelData: [PCM as Float32Array],
        }).then((buffer: ArrayBuffer) => {
          fs.writeFileSync(`model1.text${j}.wav`, new Uint8Array(buffer));
        });
      })(i++);
      
      expect(b).to.eql(a);
    });
  }
});