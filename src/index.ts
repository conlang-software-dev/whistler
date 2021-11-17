#!/usr/bin/env node
import { Transition, Contour, Constant, SignalComponent, Segment } from './segment';
import { spline, CurveInput, CurveOutput } from './spline';
import { fromInterlaced, FMSynthInterlacedInput, FMOutputArray } from 'fm-synthesis';

export {
  Transition, Contour, Constant, SignalComponent, Segment,
  spline, CurveInput, CurveOutput, FMOutputArray,
};

export type WhistleSynthesisSettings = Omit<FMSynthInterlacedInput, 'data'>;
export interface WhistleSynthesisArgs {
  segments: CurveInput;
  settings: WhistleSynthesisSettings;
}

export function synthesize({ segments, settings }: WhistleSynthesisArgs): [ArrayLike<number>, number] {
  const [data,] = spline(segments) as [Float32Array, number];
  const { output: buffer = data } = settings;
  const [output, offset] = fromInterlaced( { ...settings, data, output: buffer });
  return [output === data ? data.subarray(0, data.length/2) : output, offset];
}

async function main() {
  try{
    const [WavEncoder, fs, { default: yargs }, { hideBin }] = await Promise.all([
      import('wav-encoder'),
      import('fs'),
      import('yargs'),
      import('yargs/helpers'),
    ]);

    const { input, output, sampleRate } = await yargs(hideBin(process.argv))
      .option('input', {
        alias: 'i',
        describe: 'Path to input file',
        type: 'string',
      })
      .option('output', {
        alias: 'o',
        describe: 'Path to output file',
        type: 'string',
      })
      .option('sampleRate', {
        alias: 'r',
        describe: 'Audio samples per second',
        type: 'number',
      })
      .default({
        sampleRate: 44100,
        input: process.stdin.fd,
        output: process.stdout.fd,
      })
      .help()
      .argv;

    let segments: CurveInput;
    try {
      const data = fs.readFileSync(input, 'utf-8');
      segments = JSON.parse(data);
      if (!Array.isArray(segments) || typeof segments[0] !== 'object') { throw 0; }
    } catch (_) {
      console.error("Input must be a JSON array containing at least one object value.");
      process.exit(1);
    }

    try {
      const [PCM, ] = synthesize({ segments, settings: { sampleRate } });

      WavEncoder.encode({
        sampleRate,
        channelData: [PCM as Float32Array],
      }).then((buffer: ArrayBuffer) => {
        fs.writeFileSync(output, new Uint8Array(buffer));
      });
    } catch (e: any) {
      console.error(e.message);
      process.exit(1);
    }
  } catch (_) {
    console.error("Missing dependencies; ensure wav-encoder and yargs are installed.");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
