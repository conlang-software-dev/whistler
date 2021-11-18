import fs from 'fs';
import { join } from 'path';
import WavEncoder from 'wav-encoder';
import { Text2Formant } from '../src';
import Model from './fixtures/model1';

const texts = fs.readFileSync(join(__dirname, 'fixtures/text1.txt'))
  .toString('utf8').split(/[\r\n]+/);

const interpreter = new Text2Formant(Model);

(async function() {
  let i = 0;
  for (const text of texts) {
    const [PCM, ] = interpreter.synthesize({ text, settings: { sampleRate: 44100 } });
    const buffer = await WavEncoder.encode({
      sampleRate: 44100,
      channelData: [PCM as Float32Array],
    });
    fs.writeFileSync(`model1.text${i++}.wav`, new Uint8Array(buffer));
  }
})();