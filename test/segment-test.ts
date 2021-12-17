import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { TextModel } from '../src';
import Model1 from './fixtures/model1';
import Model3 from './fixtures/model3';

describe("Segment Generation", function() {
  const texts1 = fs.readFileSync(path.join(__dirname, 'fixtures/text1.txt'))
    .toString('utf8').split(/[\r\n]+/);

  const interpreter1 = new TextModel(Model1);

  let i = 1;
  for (const text of texts1) {
    (j => it(`Should synthesize audio for "${text}"`, () => {
      const segFile = path.join(__dirname, `fixtures/model1.text${j}.seg`);
      const a = fs.readFileSync(segFile).toString('utf8');
      const b = JSON.stringify([...interpreter1.text2norm(text)]);
      //fs.writeFileSync(segFile, b, 'utf8');
      expect(b).to.eql(a);
    }))(i);
    i++;
  }
  
  const texts3 = fs.readFileSync(path.join(__dirname, 'fixtures/text3.txt'))
    .toString('utf8').split(/[\r\n]+/);

  const interpreter2 = new TextModel(Model3);
  i = 1;
  for (const text of texts3) {
    (j => it(`Should synthesize audio for "${text}"`, () => {
      const segFile = path.join(__dirname, `fixtures/model3.text${j}.seg`);
      const a = fs.readFileSync(segFile).toString('utf8');
      const b = JSON.stringify([...interpreter2.text2norm(text)]);
      //fs.writeFileSync(segFile, b, 'utf8');
      expect(b).to.eql(a);
    }))(i);
    i++;
  }
});