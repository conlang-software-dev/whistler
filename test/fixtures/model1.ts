import { AcousticModel } from "../../src/model";

// Some broad generalizations on phoneme transposition:

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

const model: AcousticModel = {
  wordBoundary: ' ',
  classes: {
    I: ['t', 'k', 'p'], // Interrupted
    K: ['d', 'g', 'b'], // Continuous
    D: ['n', 'ng', 'm'], // Delayed
    C: ['I', 'K', 'D'],
    V: ['a', 'i'],
  },
  constants: {
    H_LOCUS: 3000,
    I_LOCUS: 2600,
    A_LOCUS: 1750,
    L_LOCUS: 1350,
  },
  namedPronunciations: {
    silence: [{ 
      f: { type: 'constant', y: 0 },
      a: { type: 'constant', y: 0 },
      run: 166,
    }],
    A: [{ 
      f: { type: 'constant', y: 'H_LOCUS' },
      a: { type: 'constant', y: 1 },
      run: 0,
    }],
    G: [{ 
      f: { type: 'constant', y: 'L_LOCUS' },
      a: { type: 'constant', y: 1 },
      run: 0,
    }],
    I2a: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'A_LOCUS',
      },
      a: { type: 'constant', y: 1 },
      run: 200,
    }],
    I2i: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'I_LOCUS',
      },
      a: { type: 'constant', y: 1 },
      run: 200,
    }],
    K2a: [{ 
      f: {
        type: 'transition',
        sy: 'lf',
        ey: 'A_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 250,
    }],
    K2i: [{ 
      f: {
        type: 'transition',
        sy: 'lf',
        ey: 'I_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 250,
    }],
    D2a: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'A_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 200,
    }],
    D2i: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'I_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 200,
    }],
    // t
    t2a: ['A', 'I2a'],
    t2i: ['A', 'I2i'],
    v2t: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'H_LOCUS',
      },
      a: { type: 'constant', y: 1 },
      run: 200,
    }],
    // d
    d2a: ['A', 'K2a'],
    d2i: ['A', 'K2i'],
    v2d: [{ 
      f: {
        type: 'transition',
        sy: 'lf',
        ey: 'H_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 250,
    }],
    // n
    n2a: ['A', 'D2a'],
    n2i: ['A', 'D2i'],
    v2n: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'H_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 200,
    }],
    
    // k
    v2k: [{
      f: { type: 'constant', y: 'lf' },
      a: { type: 'constant', y: 1 },
      run: 166,
    }, 'silence'],
    k2a: ['silence', {
      f: { type: 'constant', y: 'A_LOCUS' },
      a: { type: 'constant', y: 1 },
      run: 166,
    }],
    k2i: ['silence', {
      f: { type: 'constant', y: 'I_LOCUS' },
      a: { type: 'constant', y: 1 },
      run: 166,
    }],
    // g
    v2g: [{
      f: { type: 'constant', y: 'lf' },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 250,
    }],
    g2a: [{
      f: { type: 'constant', y: 'A_LOCUS' },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 250,
    }],
    g2i: [{
      f: { type: 'constant', y: 'I_LOCUS' },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 250,
    }],
    // ng
    v2ng: [{
      f: { type: 'constant', y: 'lf' },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 200,
    }],
    ng2a: [{
      f: { type: 'constant', y: 'A_LOCUS' },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 200,
    }],
    ng2i: [{
      f: { type: 'constant', y: 'I_LOCUS' },
      a: {
        type: 'transition',
        sy: 0, ey: 1,
      },
      run: 200,
    }],

    // p
    p2a: ['G', 'I2a'],
    p2i: ['G', 'I2i'],
    v2p: [{ 
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'L_LOCUS',
      },
      a: { type: 'constant', y: 1 },
      run: 200,
    }],
    // b
    b2a: ['G', 'K2a'],
    b2i: ['G', 'K2i'],
    v2b: [{ 
      f: {
        type: 'transition',
        sy: 'lf',
        ey: 'L_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 250,
    }],
    // m
    m2a: ['G', 'D2a'],
    m2i: ['G', 'D2i'],
    v2m: [{
      f: {
        type: 'transition',
        curve: 'convex',
        sy: 'lf',
        ey: 'L_LOCUS',
      },
      a: {
        type: 'transition',
        sy: 1, ey: 0,
      },
      run: 200,
    }],
  },
  graphemes: {
    a: {
      elsewhere: [{
        f: { type: 'constant', y: 'A_LOCUS' },
        a: { type: 'constant', y: 1 },
        run: 200,
      }],
      contexts: [{ con: ['C', 'C'] }],
    },
    i: {
      elsewhere: [{
        f: { type: 'constant', y: 'I_LOCUS' },
        a: { type: 'constant', y: 1 },
        run: 200,
      }],
      contexts: [{ con: ['C', 'C'] }],
    },
    t: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2t', 'silence', 't2a'] },
        { con: ['V', 'i'], pron: ['v2t', 'silence', 't2i'] },
        { con: ['V', ''],  pron: ['v2t', 'silence'] },
        { con: ['', 'a'],  pron: 't2a' },
        { con: ['', 'i'],  pron: 't2i' },
      ],
    },
    d: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2d', 'd2a'] },
        { con: ['V', 'i'], pron: ['v2d', 'd2i'] },
        { con: ['V', ''],  pron: ['v2d', 'silence'] },
        { con: ['', 'a'],  pron: 'd2a' },
        { con: ['', 'i'],  pron: 'd2i' },
      ],
    },
    n: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2n', 'silence', 'n2a'] },
        { con: ['V', 'i'], pron: ['v2n', 'silence', 'n2i'] },
        { con: ['V', ''],  pron: ['v2n', 'silence'] },
        { con: ['', 'a'],  pron: 'n2a' },
        { con: ['', 'i'],  pron: 'n2i' },
      ],
    },
    k: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2k', 'k2a'] },
        { con: ['V', 'i'], pron: ['v2k', 'k2i'] },
        { con: ['V', ''],  pron: ['v2k', 'silence'] },
        { con: ['', 'a'],  pron: 'k2a' },
        { con: ['', 'i'],  pron: 'k2i' },
      ],
    },
    g: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2g', 'g2a'] },
        { con: ['V', 'i'], pron: ['v2g', 'g2i'] },
        { con: ['V', ''],  pron: ['v2g', 'silence'] },
        { con: ['', 'a'],  pron: 'g2a' },
        { con: ['', 'i'],  pron: 'g2i' },
      ],
    },
    ng: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2ng', 'silence', 'ng2a'] },
        { con: ['V', 'i'], pron: ['v2ng', 'silence', 'ng2i'] },
        { con: ['V', ''],  pron: ['v2ng', 'silence'] },
        { con: ['', 'a'],  pron: 'ng2a' },
        { con: ['', 'i'],  pron: 'ng2i' },
      ],
    },
    p: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2p', 'silence', 'p2a'] },
        { con: ['V', 'i'], pron: ['v2p', 'silence', 'p2i'] },
        { con: ['V', ''],  pron: ['v2p', 'silence'] },
        { con: ['', 'a'],  pron: 'p2a' },
        { con: ['', 'i'],  pron: 'p2i' },
      ],
    },
    b: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2b', 'b2a'] },
        { con: ['V', 'i'], pron: ['v2b', 'b2i'] },
        { con: ['V', ''],  pron: ['v2b', 'silence'] },
        { con: ['', 'a'],  pron: 'b2a' },
        { con: ['', 'i'],  pron: 'b2i' },
      ],
    },
    m: {
      contexts: [
        { con: ['V', 'a'], pron: ['v2m', 'silence', 'm2a'] },
        { con: ['V', 'i'], pron: ['v2m', 'silence', 'm2i'] },
        { con: ['V', ''],  pron: ['v2m', 'silence'] },
        { con: ['', 'a'],  pron: 'm2a' },
        { con: ['', 'i'],  pron: 'm2i' },
      ],
    },
  },
};

export default model;