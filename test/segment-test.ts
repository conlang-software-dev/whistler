import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { TextModel } from '../src';
import Model from './fixtures/model1';

describe("Segment Generation", function() {
  const texts = fs.readFileSync(path.join(__dirname, 'fixtures/text1.txt'))
    .toString('utf8').split(/[\r\n]+/);

  const interpreter = new TextModel(Model);

  let i = 1;
  for (const text of texts) {
    it(`Should synthesize audio for "${text}"`, () => {
      const segFile = path.join(__dirname, `fixtures/model1.text${i}.seg`);
      const a = fs.readFileSync(segFile).toString('utf8');
      const b = JSON.stringify([...interpreter.text2norm(text)]);
      //fs.writeFileSync(segFile, b, 'utf8');
      i++;
      expect(b).to.eql(a);
    });
  }
});