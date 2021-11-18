// Some broad generalizations on phoneme transposition:

import { AcousticModel } from "../../src/transcription";

// "interrupted" (hard cut off): voiceless
// "continuous" (amplitude fade): voiced obstruents
// "gradual decay" (fade and silence): nasals

// sharp (highest locus): t, j, nj, lj
// acute (high locus): t, s, d, z, l, n
// mid (vowel locus): k, g,
// grave (low locus): p, b, m, f, v, h, x 

/*
 * A Sample Phonology: 2 vowels, 9 consonants,
 * strict alternating structure.
 * 'a' = low vowel
 * 'i' = high vowel
 * Consonants:
 *      I   C   G
 * A    t   d   n
 * M    k   g   ng
 * G    p   b   m
 */

const H_LOCUS = 3000;
const I_LOCUS = 2600;
const A_LOCUS = 1750;
const L_LOCUS = 1350;

const model: AcousticModel = {
  wordBoundary: ' ',
  namedPronunciations: {
    silence: [{ 
      f: { type: 'constant', y: 0 },
      a: { type: 'constant', y: 0 },
      run: 10,
    }],

    // t
    a2t: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: A_LOCUS,
        ey: H_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    t2a: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: H_LOCUS,
        ey: A_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    i2t: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: I_LOCUS,
        ey: H_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    t2i: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: H_LOCUS,
        ey: I_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    // d
    a2d: [{ 
      f: {
        type: 'transition',
        sy: A_LOCUS,
        ey: H_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 25,
    }],
    d2a: [{ 
      f: {
        type: 'transition',
        sy: H_LOCUS,
        ey: A_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 25,
    }],
    i2d: [{ 
      f: {
        type: 'transition',
        sy: I_LOCUS,
        ey: H_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 25,
    }],
    d2i: [{ 
      f: {
        type: 'transition',
        sy: H_LOCUS,
        ey: I_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 25,
    }],
    // n
    a2n: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: A_LOCUS,
        ey: H_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 20,
    }],
    n2a: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: H_LOCUS,
        ey: A_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 20,
    }],
    i2n: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: I_LOCUS,
        ey: H_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 20,
    }],
    n2i: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: H_LOCUS,
        ey: I_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 20,
    }],
    
    // k
    k: ['silence', 'silence', 'silence'],
    // g
    a2g: [{
      f: { type: 'constant', y: A_LOCUS },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 25,
    }],
    g2a: [{
      f: { type: 'constant', y: A_LOCUS },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 25,
    }],
    i2g: [{
      f: { type: 'constant', y: I_LOCUS },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 25,
    }],
    g2i: [{
      f: { type: 'constant', y: I_LOCUS },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 25,
    }],
    // ng
    a2ng: [{
      f: { type: 'constant', y: A_LOCUS },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 20,
    }],
    ng2a: [{
      f: { type: 'constant', y: A_LOCUS },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 20,
    }],
    i2ng: [{
      f: { type: 'constant', y: I_LOCUS },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 20,
    }],
    ng2i: [{
      f: { type: 'constant', y: I_LOCUS },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 20,
    }],

    // p
    a2p: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: A_LOCUS,
        ey: L_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    p2a: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: L_LOCUS,
        ey: A_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    i2p: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: I_LOCUS,
        ey: L_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    p2i: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: L_LOCUS,
        ey: I_LOCUS,
      },
      a: { type: 'constant', y: 1 },
      run: 20,
    }],
    // b
    a2b: [{ 
      f: {
        type: 'transition',
        sy: A_LOCUS,
        ey: L_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 25,
    }],
    b2a: [{ 
      f: {
        type: 'transition',
        sy: L_LOCUS,
        ey: A_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 25,
    }],
    i2b: [{ 
      f: {
        type: 'transition',
        sy: I_LOCUS,
        ey: L_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 25,
    }],
    b2i: [{ 
      f: {
        type: 'transition',
        sy: L_LOCUS,
        ey: I_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 25,
    }],
    // m
    a2m: [{
      f: {
        type: 'transition',
        curve: 'convex',
        sy: A_LOCUS,
        ey: L_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 20,
    }],
    m2a: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: L_LOCUS,
        ey: A_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 20,
    }],
    i2m: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: I_LOCUS,
        ey: L_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 20,
    }],
    m2i: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: L_LOCUS,
        ey: I_LOCUS,
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 20,
    }],
  },
  graphemes: {
    a: {
      elsewhere: [{
        f: { type: 'constant', y: A_LOCUS },
        a: { type: 'constant', y: 1 },
        run: 50,
      }],
      contexts: [
        { con: ['t', 't'] },
        { con: ['t', 'd'] },
        { con: ['t', 'n'] },
        { con: ['t', 'k'] },
        { con: ['t', 'g'] },
        { con: ['t', 'ng'] },
        { con: ['t', 'p'] },
        { con: ['t', 'b'] },
        { con: ['t', 'm'] },
        { con: ['d', 't'] },
        { con: ['d', 'd'] },
        { con: ['d', 'n'] },
        { con: ['d', 'k'] },
        { con: ['d', 'g'] },
        { con: ['d', 'ng'] },
        { con: ['d', 'p'] },
        { con: ['d', 'b'] },
        { con: ['d', 'm'] },
        { con: ['n', 't'] },
        { con: ['n', 'd'] },
        { con: ['n', 'n'] },
        { con: ['n', 'k'] },
        { con: ['n', 'g'] },
        { con: ['n', 'ng'] },
        { con: ['n', 'p'] },
        { con: ['n', 'b'] },
        { con: ['n', 'm'] },
        { con: ['k', 't'] },
        { con: ['k', 'd'] },
        { con: ['k', 'n'] },
        { con: ['k', 'k'] },
        { con: ['k', 'g'] },
        { con: ['k', 'ng'] },
        { con: ['k', 'p'] },
        { con: ['k', 'b'] },
        { con: ['k', 'm'] },
        { con: ['g', 't'] },
        { con: ['g', 'd'] },
        { con: ['g', 'n'] },
        { con: ['g', 'k'] },
        { con: ['g', 'g'] },
        { con: ['g', 'ng'] },
        { con: ['g', 'p'] },
        { con: ['g', 'b'] },
        { con: ['g', 'm'] },
        { con: ['ng', 't'] },
        { con: ['ng', 'd'] },
        { con: ['ng', 'n'] },
        { con: ['ng', 'k'] },
        { con: ['ng', 'g'] },
        { con: ['ng', 'ng'] },
        { con: ['ng', 'p'] },
        { con: ['ng', 'b'] },
        { con: ['ng', 'm'] },
        { con: ['p', 't'] },
        { con: ['p', 'd'] },
        { con: ['p', 'n'] },
        { con: ['p', 'k'] },
        { con: ['p', 'g'] },
        { con: ['p', 'ng'] },
        { con: ['p', 'p'] },
        { con: ['p', 'b'] },
        { con: ['p', 'm'] },
        { con: ['b', 't'] },
        { con: ['b', 'd'] },
        { con: ['b', 'n'] },
        { con: ['b', 'k'] },
        { con: ['b', 'g'] },
        { con: ['b', 'ng'] },
        { con: ['b', 'p'] },
        { con: ['b', 'b'] },
        { con: ['b', 'm'] },
        { con: ['m', 't'] },
        { con: ['m', 'd'] },
        { con: ['m', 'n'] },
        { con: ['m', 'k'] },
        { con: ['m', 'g'] },
        { con: ['m', 'ng'] },
        { con: ['m', 'p'] },
        { con: ['m', 'b'] },
        { con: ['m', 'm'] },
      ]
    },
    i: {
      elsewhere: [{
        f: { type: 'constant', y: I_LOCUS },
        a: { type: 'constant', y: 1 },
        run: 50,
      }],
      contexts: [
        { con: ['t', 't'] },
        { con: ['t', 'd'] },
        { con: ['t', 'n'] },
        { con: ['t', 'k'] },
        { con: ['t', 'g'] },
        { con: ['t', 'ng'] },
        { con: ['t', 'p'] },
        { con: ['t', 'b'] },
        { con: ['t', 'm'] },
        { con: ['d', 't'] },
        { con: ['d', 'd'] },
        { con: ['d', 'n'] },
        { con: ['d', 'k'] },
        { con: ['d', 'g'] },
        { con: ['d', 'ng'] },
        { con: ['d', 'p'] },
        { con: ['d', 'b'] },
        { con: ['d', 'm'] },
        { con: ['n', 't'] },
        { con: ['n', 'd'] },
        { con: ['n', 'n'] },
        { con: ['n', 'k'] },
        { con: ['n', 'g'] },
        { con: ['n', 'ng'] },
        { con: ['n', 'p'] },
        { con: ['n', 'b'] },
        { con: ['n', 'm'] },
        { con: ['k', 't'] },
        { con: ['k', 'd'] },
        { con: ['k', 'n'] },
        { con: ['k', 'k'] },
        { con: ['k', 'g'] },
        { con: ['k', 'ng'] },
        { con: ['k', 'p'] },
        { con: ['k', 'b'] },
        { con: ['k', 'm'] },
        { con: ['g', 't'] },
        { con: ['g', 'd'] },
        { con: ['g', 'n'] },
        { con: ['g', 'k'] },
        { con: ['g', 'g'] },
        { con: ['g', 'ng'] },
        { con: ['g', 'p'] },
        { con: ['g', 'b'] },
        { con: ['g', 'm'] },
        { con: ['ng', 't'] },
        { con: ['ng', 'd'] },
        { con: ['ng', 'n'] },
        { con: ['ng', 'k'] },
        { con: ['ng', 'g'] },
        { con: ['ng', 'ng'] },
        { con: ['ng', 'p'] },
        { con: ['ng', 'b'] },
        { con: ['ng', 'm'] },
        { con: ['p', 't'] },
        { con: ['p', 'd'] },
        { con: ['p', 'n'] },
        { con: ['p', 'k'] },
        { con: ['p', 'g'] },
        { con: ['p', 'ng'] },
        { con: ['p', 'p'] },
        { con: ['p', 'b'] },
        { con: ['p', 'm'] },
        { con: ['b', 't'] },
        { con: ['b', 'd'] },
        { con: ['b', 'n'] },
        { con: ['b', 'k'] },
        { con: ['b', 'g'] },
        { con: ['b', 'ng'] },
        { con: ['b', 'p'] },
        { con: ['b', 'b'] },
        { con: ['b', 'm'] },
        { con: ['m', 't'] },
        { con: ['m', 'd'] },
        { con: ['m', 'n'] },
        { con: ['m', 'k'] },
        { con: ['m', 'g'] },
        { con: ['m', 'ng'] },
        { con: ['m', 'p'] },
        { con: ['m', 'b'] },
        { con: ['m', 'm'] },
      ]
    },
    t: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2t','silence','t2a'] },
        { con: ['a', 'i'], pron: ['a2t','silence','t2i'] },
        { con: ['i', 'i'], pron: ['i2t','silence','t2i'] },
        { con: ['i', 'a'], pron: ['i2t','silence','t2a'] },
        { con: ['', 'a'],  pron: 't2a' },
        { con: ['a', ''],  pron: 'a2t' },
        { con: ['', 'i'],  pron: 't2i' },
        { con: ['i', ''],  pron: 'i2t' },
      ],
    },
    d: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2d','d2a'] },
        { con: ['a', 'i'], pron: ['a2d','d2i'] },
        { con: ['i', 'i'], pron: ['i2d','d2i'] },
        { con: ['i', 'a'], pron: ['i2d','d2a'] },
        { con: ['', 'a'],  pron: 'd2a' },
        { con: ['a', ''],  pron: 'a2d' },
        { con: ['', 'i'],  pron: 'd2i' },
        { con: ['i', ''],  pron: 'i2d' },
      ],
    },
    n: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2n','silence','n2a'] },
        { con: ['a', 'i'], pron: ['a2n','silence','n2i'] },
        { con: ['i', 'i'], pron: ['i2n','silence','n2i'] },
        { con: ['i', 'a'], pron: ['i2n','silence','n2a'] },
        { con: ['', 'a'],  pron: 'n2a' },
        { con: ['a', ''],  pron: 'a2n' },
        { con: ['', 'i'],  pron: 'n2i' },
        { con: ['i', ''],  pron: 'i2n' },
      ],
    },
    k: {
      elsewhere: 'k',
      contexts: [],
    },
    g: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2g','g2a'] },
        { con: ['a', 'i'], pron: ['a2g','g2i'] },
        { con: ['i', 'i'], pron: ['i2g','g2i'] },
        { con: ['i', 'a'], pron: ['i2g','g2a'] },
        { con: ['', 'a'],  pron: 'g2a' },
        { con: ['a', ''],  pron: 'a2g' },
        { con: ['', 'i'],  pron: 'g2i' },
        { con: ['i', ''],  pron: 'i2g' },
      ],
    },
    ng: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2ng','silence','ng2a'] },
        { con: ['a', 'i'], pron: ['a2ng','silence','ng2i'] },
        { con: ['i', 'i'], pron: ['i2ng','silence','ng2i'] },
        { con: ['i', 'a'], pron: ['i2ng','silence','ng2a'] },
        { con: ['', 'a'],  pron: 'ng2a' },
        { con: ['a', ''],  pron: 'a2ng' },
        { con: ['', 'i'],  pron: 'ng2i' },
        { con: ['i', ''],  pron: 'i2ng' },
      ],
    },
    p: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2p','silence','p2a'] },
        { con: ['a', 'i'], pron: ['a2p','silence','p2i'] },
        { con: ['i', 'i'], pron: ['i2p','silence','p2i'] },
        { con: ['i', 'a'], pron: ['i2p','silence','p2a'] },
        { con: ['', 'a'],  pron: 'p2a' },
        { con: ['a', ''],  pron: 'a2p' },
        { con: ['', 'i'],  pron: 'p2i' },
        { con: ['i', ''],  pron: 'i2p' },
      ],
    },
    b: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2b','b2a'] },
        { con: ['a', 'i'], pron: ['a2b','b2i'] },
        { con: ['i', 'i'], pron: ['i2b','b2i'] },
        { con: ['i', 'a'], pron: ['i2b','b2a'] },
        { con: ['', 'a'],  pron: 'b2a' },
        { con: ['a', ''],  pron: 'a2b' },
        { con: ['', 'i'],  pron: 'b2i' },
        { con: ['i', ''],  pron: 'i2b' },
      ],
    },
    m: {
      contexts: [
        { con: ['a', 'a'], pron: ['a2m','silence','m2a'] },
        { con: ['a', 'i'], pron: ['a2m','silence','m2i'] },
        { con: ['i', 'i'], pron: ['i2m','silence','m2i'] },
        { con: ['i', 'a'], pron: ['i2m','silence','m2a'] },
        { con: ['', 'a'],  pron: 'm2a' },
        { con: ['a', ''],  pron: 'a2m' },
        { con: ['', 'i'],  pron: 'm2i' },
        { con: ['i', ''],  pron: 'i2m' },
      ],
    },
  }
};

export default model;