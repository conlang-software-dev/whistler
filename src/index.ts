#!/usr/bin/env node
import { Transition } from './transition';
import { spline, CurveInput, CurveOutput } from './spline';
import { fromInterlaced, FMSynthInterlacedInput, FMOutputArray } from 'fm-synthesis';

export { Transition, spline, CurveInput, CurveOutput, FMOutputArray };

export type WhistleSynthesisSettings = Omit<FMSynthInterlacedInput, 'data'>;

export function synthesize(transitions: CurveInput, settings: WhistleSynthesisSettings) {
  const [data,] = spline(transitions) as [Float32Array, number];
  const [output, offset] = fromInterlaced( { ...settings, data, output: settings.output ?? data });
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
      .default({ sampleRate: 44100 })
      .help()
      .argv;

    let transitions: CurveInput;
    try {
      const data = fs.readFileSync(input ?? process.stdin.fd, 'utf-8');
      transitions = JSON.parse(data);
      if (!Array.isArray(transitions) || typeof transitions[0] !== 'object') { throw 0; }
    } catch (_) {
      console.error("Input must be a JSON array containing at least one object value.");
      process.exit(1);
    }

    try {
      const [PCM, ] = synthesize(transitions, { sampleRate });

      WavEncoder.encode({
        sampleRate,
        channelData: [PCM as Float32Array],
      }).then((buffer: ArrayBuffer) => {
        fs.writeFileSync(output ?? process.stdout.fd, new Uint8Array(buffer));
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
