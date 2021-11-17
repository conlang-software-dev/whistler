#!/usr/bin/env node
import fs from 'fs';
import { CurveInput } from './spline';
import { synthesize } from './synthesize';
import { VoiceRange, TranscriptionSystem, Text2Formant } from './transcription';

function interpText(text: string, config: string, sampleRate: number, voice: VoiceRange) {
  let sys: TranscriptionSystem;
  try {
    sys = JSON.parse(fs.readFileSync(config, 'utf-8'));
  } catch (_) {
    console.error('Error reading config file.')
    process.exit(1);
  }
  const synth = new Text2Formant(sys);
  const [PCM ] = synth.synthesize({ text, voice, settings: { sampleRate }});
  return PCM;
}

function interpCurve(input: string, sampleRate: number) {
  let segments: CurveInput;
  try {
    segments = JSON.parse(input);
    if (!Array.isArray(segments) || typeof segments[0] !== 'object') { throw 0; }
  } catch (_) {
    console.error("Input must be a JSON array containing at least one object value.");
    process.exit(1);
  }

  const [PCM ] = synthesize({ segments, settings: { sampleRate } });
  return PCM;
}

function getPCM(argv: any): ArrayLike<number> {
  try {
    const data = fs.readFileSync(argv.input, 'utf-8');

    switch (argv._[0]) {
      case 'text': {
        const voice: VoiceRange = {
          f: {
            center: argv.fc as number,
            shift: argv.fs as number,
            scale: argv.fm as number,
          },
          a: {
            center: argv.ac as number,
            shift: argv.as as number,
            scale: argv.am as number,
          },
        };
        return interpText(data, argv.config as string, argv.sampleRate as number, voice);
      }
      case 'curve': return interpCurve(data, argv.sampleRate as number);
      default:
        console.error("Unrecognized command.");
        process.exit(1);
    }
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
}

async function main() {
  try {
    const [WavEncoder, { default: yargs }, { hideBin }] = await Promise.all([
      import('wav-encoder'),
      import('yargs'),
      import('yargs/helpers'),
    ]);

    const commonArgs = {
      output: {
        alias: 'o',
        describe: 'Path to output file',
        type: 'string',
        default: process.stdout.fd,
      },
      sampleRate: {
        alias: 'r',
        describe: 'Audio samples per second',
        type: 'number',
        default: 44100,
      },
    };

    const argv = await yargs(hideBin(process.argv))
      .command('curves', 'Synthesize audio from curve segments', {
        ...commonArgs,
        input: {
          alias: 'i',
          describe: 'Path to curve input file',
          type: 'string',
          default: process.stdin.fd, 
        },
      } as any)
      .command('text', 'Synthesize audio from text', {
        ...commonArgs,
        config: {
          alias: 'c',
          describe: 'Path to language config file',
          type: 'string',
          default: 'config.json', 
        },
        input: {
          alias: 'i',
          describe: 'Path to text input file',
          type: 'string',
          default: process.stdin.fd, 
        },
        fc: {
          describe: 'Center point of the frequency range',
          type: 'number',
          default: 0,
        },
        ac: {
          describe: 'Center point of the amplitude range',
          type: 'number',
          default: 0,
        },
        fs: {
          describe: 'Amount by which to shift the center of the frequency range',
          type: 'number',
          default: 0,
        },
        as: {
          describe: 'Amount by which to shift the center of the amplitude range',
          type: 'number',
          default: 0,
        },
        fm: {
          describe: 'Amount by which to scale / multiply the frequency range',
          type: 'number',
          default: 1,
        },
        am: {
          describe: 'Amount by which to scale / multiply the amplitude range',
          type: 'number',
          default: 1,
        },
      } as any)
      .help()
      .argv;
    
    const PCM = getPCM(argv);

    try {
      WavEncoder.encode({
        sampleRate: argv.sampleRate as number,
        channelData: [PCM as Float32Array],
      }).then((buffer: ArrayBuffer) => {
        fs.writeFileSync(argv.output as string | number, new Uint8Array(buffer));
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

main();
