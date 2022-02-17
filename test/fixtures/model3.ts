import { AcousticModel } from "../../src/model";

const model: AcousticModel = {
  wordBoundary: ' ',
  classes: {
    VI: ['i','I'],
    VA: ['a','A'],
    VO: ['o','O'],
    V: ['VI', 'VA', 'VO'],
    CN: ['t', 'k', 'l', 'j', 'w', 's', 'n'],
    MP: ['m', 'p'],
    ANY: ['', 'V', 'CN', 'MP'],
  },
  constants: {
    SEG_LEN: 270, // milliseconds
    G_TRANS: 95, 
    I_TRANS: 50,
    C_TRANS: 170,

    H: 2600,
    M: 2100,
    L: 1750,
    
    SHARP_H: 3500,
    SHARP_L: 3300,
    ACUTE_H: 2900,
    ACUTE_L: 2700,
    GRAVE_H: 1900,
    GRAVE_L: 1200,
  },
  namedPronunciations: {
    I_SILENCE: [{ a: { type: 'constant', y: 0}, run: 170 }],
    G_SILENCE: [{ a: { type: 'constant', y: 0}, run: 80 }],
    C_SILENCE: [{ a: { type: 'constant', y: 0}, run: 30 }],
    
    HV: [{ f: { type: 'constant', y: 'H' } }],
    MV: [{ f: { type: 'constant', y: 'M' } }],
    LV: [{ f: { type: 'constant', y: 'L' } }],
    
    S_A: [{ a: { type: 'constant', y: 1 } }],
    S_R: [{ run: 'SEG_LEN * 1.5' }],
    STR: ['S_A', 'S_R'],

    L_A: [{ a: { type: 'constant', y: 0.8 } }],
    L_R: [{ run: 'SEG_LEN' }],
    LAX: ['L_A', 'L_R'],

    SHARP: [{ f: { type: 'constant', y: '(SHARP_L + SHARP_H) / 2' } }],
    ACUTE: [{ f: { type: 'constant', y: '(ACUTE_L + ACUTE_H) / 2' } }],
    GRAVE: [{ f: { type: 'constant', y: '(GRAVE_L + GRAVE_H) / 2' } }],


    I2i: [{
      f: { type: 'transition', curve: 'convex', ey: 'H' },
      run: 'I_TRANS',
    }],
    I2a: [{
      f: { type: 'transition', curve: 'convex', ey: 'M' },
      run: 'I_TRANS',
    }],
    I2o: [{
      f: { type: 'transition', curve: 'convex', ey: 'L' },
      run: 'I_TRANS',
    }],

    C2i: [{
      f: { type: 'transition', curve: 'sine', ey: 'H' },
      a: { type: 'transition', curve: 'sine', sy: 0, ey: 'la' },
      run: 'C_TRANS',
    }],
    C2a: [{
      f: { type: 'transition', curve: 'sine', ey: 'M' },
      a: { type: 'transition', curve: 'sine', sy: 0, ey: 'la' },
      run: 'C_TRANS',
    }],
    C2o: [{
      f: { type: 'transition', curve: 'sine', ey: 'L' },
      a: { type: 'transition', curve: 'sine', sy: 0, ey: 'la' },
      run: 'C_TRANS',
    }],

    G2i: [{
      f: { type: 'transition', curve: 'sine', ey: 'H' },
      a: { type: 'transition', curve: 'sine', sy: 0, ey: 'la' },
      run: 'G_TRANS',
    }],
    G2a: [{
      f: { type: 'transition', curve: 'sine', ey: 'M' },
      a: { type: 'transition', curve: 'sine', sy: 0, ey: 'la' },
      run: 'G_TRANS',
    }],
    G2o: [{
      f: { type: 'transition', curve: 'sine', ey: 'L' },
      a: { type: 'transition', curve: 'sine', sy: 0, ey: 'la' },
      run: 'G_TRANS',
    }],

    v2t: [{
      f: { type: 'transition', curve: 'concave', ey: 'lr(lf, L, H, SHARP_L, SHARP_H)' },
      run: 'I_TRANS',
    }],
    n2t: [{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_L' },
      run: 'G_TRANS',
    },{
      f: { type: 'transition', curve: 'concave', ey: 'SHARP_H' },
      run: 'I_TRANS',
    }],

    v2j: [{
      f: { type: 'transition', curve: 'sine', ey: 'lr(lf, L, H, SHARP_L, SHARP_H)' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'C_TRANS',
    }],
    n2j: [{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_L' },
      a: { type: 'transition', curve: 'sine', ey: 0.8 },
      run: 'G_TRANS',
    },{
      f: { type: 'transition', curve: 'sine', ey: 'SHARP_H' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'C_TRANS',
    }],

    v2s: [{
      f: { type: 'transition', curve: 'concave', ey: 'lr(lf, L, H, ACUTE_L, ACUTE_H)' },
      run: 'I_TRANS',
    }],
    n2s: [{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_L' },
      run: 'G_TRANS',
    },{
      f: { type: 'transition', curve: 'concave', ey: 'ACUTE_H' },
      run: 'I_TRANS',
    }],

    v2l: [{
      f: { type: 'transition', curve: 'sine', ey: 'lr(lf, L, H, ACUTE_L, ACUTE_H)' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'C_TRANS',
    }],
    n2l: [{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_L' },
      a: { type: 'transition', curve: 'sine', ey: 0.8 },
      run: 'G_TRANS',
    },{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_H' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'C_TRANS',
    }],
    
    v2n: [{
      f: { type: 'transition', curve: 'sine', ey: 'lr(lf, L, H, ACUTE_L, ACUTE_H)' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'G_TRANS',
    }],
    n2n: [{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_L' },
      a: { type: 'transition', curve: 'sine', ey: 0.8 },
      run: 'G_TRANS',
    },{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_H' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'G_TRANS',
    }],
    
    k2v: [{ f: { type: 'constant', y: '(H + L) / 2' } }],
    
    v2w: [{
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'C_TRANS',
    }],
    n2w: [{
      f: { type: 'transition', curve: 'sine', ey: 'ACUTE_L' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'G_TRANS + C_TRANS',
    }],

    v2p: [{
      f: { type: 'transition', curve: 'concave', ey: 'lr(lf, L, H, GRAVE_L, GRAVE_H)' },
      run: 'I_TRANS',
    }],
    n2p: [{
      f: { type: 'transition', curve: 'sine', ey: 'GRAVE_H' },
      run: 'G_TRANS',
    },{
      f: { type: 'transition', curve: 'concave', ey: 'GRAVE_L' },
      run: 'I_TRANS',
    }],

    v2m: [{
      f: { type: 'transition', curve: 'sine', ey: 'lr(lf, L, H, GRAVE_L, GRAVE_H)' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'G_TRANS',
    }],
    n2m: [{
      f: { type: 'transition', curve: 'sine', ey: 'GRAVE_H' },
      a: { type: 'transition', curve: 'sine', ey: 0.8 },
      run: 'G_TRANS',
    },{
      f: { type: 'transition', curve: 'sine', ey: 'GRAVE_L' },
      a: { type: 'transition', curve: 'sine', ey: 0 },
      run: 'G_TRANS',
    }],

  },
  graphemes: {
    /* VOWELS */
    i: {
      elsewhere: ['HV', 'LAX'],
      contexts: [{
        con: ['V', 'ANY'],
        pron: [{
          f: { type: "transition", curve: "sine", ey: 'H' },
          a: { type: "transition", curve: "sine", ey: 0.8 },
          run: 10
        }, 'LAX'],
      }],
    },
    I: {
      elsewhere: ['HV', 'STR'],
      contexts: [{
        con: ['V', 'ANY'],
        pron: [{
          f: { type: "transition", curve: "sine", ey: 'H' },
          a: { type: "transition", curve: "sine", ey: 1 },
          run: 10
        }, 'STR'],
      }],
    },
    a: {
      elsewhere: ['MV', 'LAX'],
      contexts: [{
        con: ['V', 'ANY'],
        pron: [{
          f: { type: "transition", curve: "sine", ey: 'M' },
          a: { type: "transition", curve: "sine", ey: 0.8 },
          run: 10
        }, 'LAX'],
      }],
    },
    A: {
      elsewhere: ['MV', 'STR'],
      contexts: [{
        con: ['V', 'ANY'],
        pron: [{
          f: { type: "transition", curve: "sine", ey: 'M' },
          a: { type: "transition", curve: "sine", ey: 1 },
          run: 10
        }, 'STR'],
      }],
    },
    o: {
      elsewhere: ['LV', 'LAX'],
      contexts: [{
        con: ['V', 'ANY'],
        pron: [{
          f: { type: "transition", curve: "sine", ey: 'L' },
          a: { type: "transition", curve: "sine", ey: 0.8 },
          run: 10
        }, 'LAX'],
      }],
    },
    O: {
      elsewhere: ['LV', 'STR'],
      contexts: [{
        con: ['V', 'ANY'],
        pron: [{
          f: { type: "transition", curve: "sine", ey: 'L' },
          a: { type: "transition", curve: "sine", ey: 1 },
          run: 10
        }, 'STR'],
      }],
    },

    /* CONSONANTS */
    t: { // Interrupted, sharp
      contexts: [
        { con: ['V', 'i'], pron: ['v2t', 'I_SILENCE', 'L_A', 'I2i'] },
        { con: ['V', 'I'], pron: ['v2t', 'I_SILENCE', 'S_A', 'I2i'] },
        { con: ['V', 'a'], pron: ['v2t', 'I_SILENCE', 'L_A', 'I2a'] },
        { con: ['V', 'A'], pron: ['v2t', 'I_SILENCE', 'S_A', 'I2a'] },
        { con: ['V', 'o'], pron: ['v2t', 'I_SILENCE', 'L_A', 'I2o'] },
        { con: ['V', 'O'], pron: ['v2t', 'I_SILENCE', 'S_A', 'I2o'] },
        { con: ['n', 'i'], pron: ['n2t', 'I_SILENCE', 'L_A', 'I2i'] },
        { con: ['n', 'I'], pron: ['n2t', 'I_SILENCE', 'S_A', 'I2i'] },
        { con: ['n', 'a'], pron: ['n2t', 'I_SILENCE', 'L_A', 'I2a'] },
        { con: ['n', 'A'], pron: ['n2t', 'I_SILENCE', 'S_A', 'I2a'] },
        { con: ['n', 'o'], pron: ['n2t', 'I_SILENCE', 'L_A', 'I2o'] },
        { con: ['n', 'O'], pron: ['n2t', 'I_SILENCE', 'S_A', 'I2o'] },
        { con: ['', 'i'], pron: ['L_A', 'SHARP', 'I2i'] },
        { con: ['', 'I'], pron: ['S_A', 'SHARP', 'I2i'] },
        { con: ['', 'a'], pron: ['L_A', 'SHARP', 'I2a'] },
        { con: ['', 'A'], pron: ['S_A', 'SHARP', 'I2a'] },
        { con: ['', 'o'], pron: ['L_A', 'SHARP', 'I2o'] },
        { con: ['', 'O'], pron: ['S_A', 'SHARP', 'I2o'] },
      ],
    },
    j: { // Continuous, sharp
      contexts: [
        { con: ['V', 'i'], pron: ['v2j', 'C_SILENCE', 'L_A', 'C2i'] },
        { con: ['V', 'I'], pron: ['v2j', 'C_SILENCE', 'S_A', 'C2i'] },
        { con: ['V', 'a'], pron: ['v2j', 'C_SILENCE', 'L_A', 'C2a'] },
        { con: ['V', 'A'], pron: ['v2j', 'C_SILENCE', 'S_A', 'C2a'] },
        { con: ['V', 'o'], pron: ['v2j', 'C_SILENCE', 'L_A', 'C2o'] },
        { con: ['V', 'O'], pron: ['v2j', 'C_SILENCE', 'S_A', 'C2o'] },
        { con: ['n', 'i'], pron: ['n2j', 'C_SILENCE', 'L_A', 'C2i'] },
        { con: ['n', 'I'], pron: ['n2j', 'C_SILENCE', 'S_A', 'C2i'] },
        { con: ['n', 'a'], pron: ['n2j', 'C_SILENCE', 'L_A', 'C2a'] },
        { con: ['n', 'A'], pron: ['n2j', 'C_SILENCE', 'S_A', 'C2a'] },
        { con: ['n', 'o'], pron: ['n2j', 'C_SILENCE', 'L_A', 'C2o'] },
        { con: ['n', 'O'], pron: ['n2j', 'C_SILENCE', 'S_A', 'C2o'] },
        { con: ['', 'i'], pron: ['L_A', 'SHARP','C2i'] },
        { con: ['', 'I'], pron: ['S_A', 'SHARP','C2i'] },
        { con: ['', 'a'], pron: ['L_A', 'SHARP','C2a'] },
        { con: ['', 'A'], pron: ['S_A', 'SHARP','C2a'] },
        { con: ['', 'o'], pron: ['L_A', 'SHARP','C2o'] },
        { con: ['', 'O'], pron: ['S_A', 'SHARP','C2o'] },
      ]
    },
    s: { // Interrupted, acute
      contexts: [
        { con: ['V', 'i'], pron: ['v2s', 'I_SILENCE', 'L_A', 'I2i'] },
        { con: ['V', 'I'], pron: ['v2s', 'I_SILENCE', 'S_A', 'I2i'] },
        { con: ['V', 'a'], pron: ['v2s', 'I_SILENCE', 'L_A', 'I2a'] },
        { con: ['V', 'A'], pron: ['v2s', 'I_SILENCE', 'S_A', 'I2a'] },
        { con: ['V', 'o'], pron: ['v2s', 'I_SILENCE', 'L_A', 'I2o'] },
        { con: ['V', 'O'], pron: ['v2s', 'I_SILENCE', 'S_A', 'I2o'] },
        { con: ['n', 'i'], pron: ['n2s', 'I_SILENCE', 'L_A', 'I2i'] },
        { con: ['n', 'I'], pron: ['n2s', 'I_SILENCE', 'S_A', 'I2i'] },
        { con: ['n', 'a'], pron: ['n2s', 'I_SILENCE', 'L_A', 'I2a'] },
        { con: ['n', 'A'], pron: ['n2s', 'I_SILENCE', 'S_A', 'I2a'] },
        { con: ['n', 'o'], pron: ['n2s', 'I_SILENCE', 'L_A', 'I2o'] },
        { con: ['n', 'O'], pron: ['n2s', 'I_SILENCE', 'S_A', 'I2o'] },
        { con: ['', 'i'], pron: ['L_A', 'ACUTE', 'I2i'] },
        { con: ['', 'I'], pron: ['S_A', 'ACUTE', 'I2i'] },
        { con: ['', 'a'], pron: ['L_A', 'ACUTE', 'I2a'] },
        { con: ['', 'A'], pron: ['S_A', 'ACUTE', 'I2a'] },
        { con: ['', 'o'], pron: ['L_A', 'ACUTE', 'I2o'] },
        { con: ['', 'O'], pron: ['S_A', 'ACUTE', 'I2o'] },
      ],
    },
    l: { // Continuous, acute
      contexts: [
        { con: ['V', 'i'], pron: ['v2l', 'C_SILENCE', 'L_A', 'C2i'] },
        { con: ['V', 'I'], pron: ['v2l', 'C_SILENCE', 'S_A', 'C2i'] },
        { con: ['V', 'a'], pron: ['v2l', 'C_SILENCE', 'L_A', 'C2a'] },
        { con: ['V', 'A'], pron: ['v2l', 'C_SILENCE', 'S_A', 'C2a'] },
        { con: ['V', 'o'], pron: ['v2l', 'C_SILENCE', 'L_A', 'C2o'] },
        { con: ['V', 'O'], pron: ['v2l', 'C_SILENCE', 'S_A', 'C2o'] },
        { con: ['n', 'i'], pron: ['n2l', 'C_SILENCE', 'L_A', 'C2i'] },
        { con: ['n', 'I'], pron: ['n2l', 'C_SILENCE', 'S_A', 'C2i'] },
        { con: ['n', 'a'], pron: ['n2l', 'C_SILENCE', 'L_A', 'C2a'] },
        { con: ['n', 'A'], pron: ['n2l', 'C_SILENCE', 'S_A', 'C2a'] },
        { con: ['n', 'o'], pron: ['n2l', 'C_SILENCE', 'L_A', 'C2o'] },
        { con: ['n', 'O'], pron: ['n2l', 'C_SILENCE', 'S_A', 'C2o'] },
        { con: ['', 'i'], pron: ['L_A', 'ACUTE', 'C2i'] },
        { con: ['', 'I'], pron: ['S_A', 'ACUTE', 'C2i'] },
        { con: ['', 'a'], pron: ['L_A', 'ACUTE', 'C2a'] },
        { con: ['', 'A'], pron: ['S_A', 'ACUTE', 'C2a'] },
        { con: ['', 'o'], pron: ['L_A', 'ACUTE', 'C2o'] },
        { con: ['', 'O'], pron: ['S_A', 'ACUTE', 'C2o'] },
      ],
    },
    n: { // Gradual, acute
      contexts: [
        { con: ['V', 'i'], pron: ['v2n', 'G_SILENCE', 'L_A', 'G2i'] },
        { con: ['V', 'I'], pron: ['v2n', 'G_SILENCE', 'S_A', 'G2i'] },
        { con: ['V', 'a'], pron: ['v2n', 'G_SILENCE', 'L_A', 'G2a'] },
        { con: ['V', 'A'], pron: ['v2n', 'G_SILENCE', 'S_A', 'G2a'] },
        { con: ['V', 'o'], pron: ['v2n', 'G_SILENCE', 'L_A', 'G2o'] },
        { con: ['V', 'O'], pron: ['v2n', 'G_SILENCE', 'S_A', 'G2o'] },
        { con: ['n', 'i'], pron: ['n2n', 'C_SILENCE', 'L_A', 'C2i'] },
        { con: ['n', 'I'], pron: ['n2n', 'C_SILENCE', 'S_A', 'C2i'] },
        { con: ['n', 'a'], pron: ['n2n', 'C_SILENCE', 'L_A', 'C2a'] },
        { con: ['n', 'A'], pron: ['n2n', 'C_SILENCE', 'S_A', 'C2a'] },
        { con: ['n', 'o'], pron: ['n2n', 'C_SILENCE', 'L_A', 'C2o'] },
        { con: ['n', 'O'], pron: ['n2n', 'C_SILENCE', 'S_A', 'C2o'] },
        { con: ['', 'i'], pron: ['L_A', 'ACUTE', 'G2i'] },
        { con: ['', 'I'], pron: ['S_A', 'ACUTE', 'G2i'] },
        { con: ['', 'a'], pron: ['L_A', 'ACUTE', 'G2a'] },
        { con: ['', 'A'], pron: ['S_A', 'ACUTE', 'G2a'] },
        { con: ['', 'o'], pron: ['L_A', 'ACUTE', 'G2o'] },
        { con: ['', 'O'], pron: ['S_A', 'ACUTE', 'G2o'] },
        { con: ['', 'O'], pron: ['S_A', 'ACUTE', 'G2o'] },
        { con: ['V', 'MP'], pron: ['v2m', 'G_SILENCE', 'L_A'] },
        { con: ['V', 'CN'], pron: ['v2n', 'G_SILENCE', 'L_A'] },
        { con: ['V', ''], pron: ['v2n'] },
      ],
    },
    k: { // Interrupted, mid
      contexts: [
        { con: ['V', 'i'], pron: ['I_SILENCE', 'L_A', 'k2v', 'I2i'] },
        { con: ['V', 'I'], pron: ['I_SILENCE', 'S_A', 'k2v', 'I2i'] },
        { con: ['V', 'a'], pron: ['I_SILENCE', 'L_A', 'k2v', 'I2a'] },
        { con: ['V', 'A'], pron: ['I_SILENCE', 'S_A', 'k2v', 'I2a'] },
        { con: ['V', 'o'], pron: ['I_SILENCE', 'L_A', 'k2v', 'I2o'] },
        { con: ['V', 'O'], pron: ['I_SILENCE', 'S_A', 'k2v', 'I2o'] },
        { con: ['n', 'i'], pron: ['I_SILENCE', 'L_A', 'k2v', 'I2i'] },
        { con: ['n', 'I'], pron: ['I_SILENCE', 'S_A', 'k2v', 'I2i'] },
        { con: ['n', 'a'], pron: ['I_SILENCE', 'L_A', 'k2v', 'I2a'] },
        { con: ['n', 'A'], pron: ['I_SILENCE', 'S_A', 'k2v', 'I2a'] },
        { con: ['n', 'o'], pron: ['I_SILENCE', 'L_A', 'k2v', 'I2o'] },
        { con: ['n', 'O'], pron: ['I_SILENCE', 'S_A', 'k2v', 'I2o'] },
        { con: ['', 'i'], pron: ['L_A', 'k2v', 'I2i'] },
        { con: ['', 'I'], pron: ['S_A', 'k2v', 'I2i'] },
        { con: ['', 'a'], pron: ['L_A', 'k2v', 'I2a'] },
        { con: ['', 'A'], pron: ['S_A', 'k2v', 'I2a'] },
        { con: ['', 'o'], pron: ['L_A', 'k2v', 'I2o'] },
        { con: ['', 'O'], pron: ['S_A', 'k2v', 'I2o'] },
      ],
    },
    w: { // Continuous, mid
      contexts: [
        { con: ['V', 'i'], pron: ['v2w', 'C_SILENCE', 'L_A', 'C2i'] },
        { con: ['V', 'I'], pron: ['v2w', 'C_SILENCE', 'S_A', 'C2i'] },
        { con: ['V', 'a'], pron: ['v2w', 'C_SILENCE', 'L_A', 'C2a'] },
        { con: ['V', 'A'], pron: ['v2w', 'C_SILENCE', 'S_A', 'C2a'] },
        { con: ['V', 'o'], pron: ['v2w', 'C_SILENCE', 'L_A', 'C2o'] },
        { con: ['V', 'O'], pron: ['v2w', 'C_SILENCE', 'S_A', 'C2o'] },
        { con: ['n', 'i'], pron: ['n2w', 'C_SILENCE', 'L_A', 'C2i'] },
        { con: ['n', 'I'], pron: ['n2w', 'C_SILENCE', 'S_A', 'C2i'] },
        { con: ['n', 'a'], pron: ['n2w', 'C_SILENCE', 'L_A', 'C2a'] },
        { con: ['n', 'A'], pron: ['n2w', 'C_SILENCE', 'S_A', 'C2a'] },
        { con: ['n', 'o'], pron: ['n2w', 'C_SILENCE', 'L_A', 'C2o'] },
        { con: ['n', 'O'], pron: ['n2w', 'C_SILENCE', 'S_A', 'C2o'] },
        { con: ['', 'i'], pron: ['L_A', 'k2v', 'C2i'] },
        { con: ['', 'I'], pron: ['S_A', 'k2v', 'C2i'] },
        { con: ['', 'a'], pron: ['L_A', 'k2v', 'C2a'] },
        { con: ['', 'A'], pron: ['S_A', 'k2v', 'C2a'] },
        { con: ['', 'o'], pron: ['L_A', 'k2v', 'C2o'] },
        { con: ['', 'O'], pron: ['S_A', 'k2v', 'C2o'] },
      ],
    },
    p: { // Interrupted, grave
      contexts: [
        { con: ['V', 'i'], pron: ['v2p', 'I_SILENCE', 'L_A', 'I2i'] },
        { con: ['V', 'I'], pron: ['v2p', 'I_SILENCE', 'S_A', 'I2i'] },
        { con: ['V', 'a'], pron: ['v2p', 'I_SILENCE', 'L_A', 'I2a'] },
        { con: ['V', 'A'], pron: ['v2p', 'I_SILENCE', 'S_A', 'I2a'] },
        { con: ['V', 'o'], pron: ['v2p', 'I_SILENCE', 'L_A', 'I2o'] },
        { con: ['V', 'O'], pron: ['v2p', 'I_SILENCE', 'S_A', 'I2o'] },
        { con: ['n', 'i'], pron: ['n2p', 'I_SILENCE', 'L_A', 'I2i'] },
        { con: ['n', 'I'], pron: ['n2p', 'I_SILENCE', 'S_A', 'I2i'] },
        { con: ['n', 'a'], pron: ['n2p', 'I_SILENCE', 'L_A', 'I2a'] },
        { con: ['n', 'A'], pron: ['n2p', 'I_SILENCE', 'S_A', 'I2a'] },
        { con: ['n', 'o'], pron: ['n2p', 'I_SILENCE', 'L_A', 'I2o'] },
        { con: ['n', 'O'], pron: ['n2p', 'I_SILENCE', 'S_A', 'I2o'] },
        { con: ['', 'i'], pron: ['L_A', 'GRAVE', 'I2i'] },
        { con: ['', 'I'], pron: ['S_A', 'GRAVE', 'I2i'] },
        { con: ['', 'a'], pron: ['L_A', 'GRAVE', 'I2a'] },
        { con: ['', 'A'], pron: ['S_A', 'GRAVE', 'I2a'] },
        { con: ['', 'o'], pron: ['L_A', 'GRAVE', 'I2o'] },
        { con: ['', 'O'], pron: ['S_A', 'GRAVE', 'I2o'] },
      ],
    },
    m: { // Gradual, grave
      contexts: [
        { con: ['V', 'i'], pron: ['v2m', 'G_SILENCE', 'L_A', 'G2i'] },
        { con: ['V', 'I'], pron: ['v2m', 'G_SILENCE', 'S_A', 'G2i'] },
        { con: ['V', 'a'], pron: ['v2m', 'G_SILENCE', 'L_A', 'G2a'] },
        { con: ['V', 'A'], pron: ['v2m', 'G_SILENCE', 'S_A', 'G2a'] },
        { con: ['V', 'o'], pron: ['v2m', 'G_SILENCE', 'L_A', 'G2o'] },
        { con: ['V', 'O'], pron: ['v2m', 'G_SILENCE', 'S_A', 'G2o'] },
        { con: ['n', 'i'], pron: ['n2m', 'C_SILENCE', 'L_A', 'G2i'] },
        { con: ['n', 'I'], pron: ['n2m', 'C_SILENCE', 'S_A', 'G2i'] },
        { con: ['n', 'a'], pron: ['n2m', 'C_SILENCE', 'L_A', 'G2a'] },
        { con: ['n', 'A'], pron: ['n2m', 'C_SILENCE', 'S_A', 'G2a'] },
        { con: ['n', 'o'], pron: ['n2m', 'C_SILENCE', 'L_A', 'G2o'] },
        { con: ['n', 'O'], pron: ['n2m', 'C_SILENCE', 'S_A', 'G2o'] },
        { con: ['', 'i'], pron: ['L_A', 'GRAVE', 'G2i'] },
        { con: ['', 'I'], pron: ['S_A', 'GRAVE', 'G2i'] },
        { con: ['', 'a'], pron: ['L_A', 'GRAVE', 'G2a'] },
        { con: ['', 'A'], pron: ['S_A', 'GRAVE', 'G2a'] },
        { con: ['', 'o'], pron: ['L_A', 'GRAVE', 'G2o'] },
        { con: ['', 'O'], pron: ['S_A', 'GRAVE', 'G2o'] },
      ],
    },
  },
};

export default model;