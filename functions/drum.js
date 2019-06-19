'use strict';

const { normalizeNotes } = require('./music');

class DrumTuning {
  constructor(batter, resonant, size) {
    this.batter = batter;
    this.resonant = resonant;
    this.size = size;
  }
}

const DrumTypes = {
  SNARE: 'snare',
  TOM: 'tom',
  FLOOR_TOM: 'floor tom',
  BASS_DRUM: 'bass drum'
};

/**
 * Snare tuning frequencies near the lug
 * All notes in 3rd octave
 */
const SnareTunings = {
  'C': new DrumTuning(206, 309),
  'C#': new DrumTuning(206, 309),
  'D': new DrumTuning(206, 309),
  'D#': new DrumTuning(217, 326),
  'E': new DrumTuning(229, 343),
  'F': new DrumTuning(240, 359),
  'F#': new DrumTuning(252, 378),
  'G': new DrumTuning(266, 398),
  'G#': new DrumTuning(299, 398),
  'A': new DrumTuning(319, 398),
  'A#': new DrumTuning(356, 400),
  'B': new DrumTuning(390, 400)
};

/**
 * Bass drum tuning frequencies near the lug
 * All notes in 1st octave
 */
const BassDrumTunings = {
  'C': new DrumTuning(52, 60, 26),
  'C#': new DrumTuning(56, 64, 24),
  'D': new DrumTuning(59, 68, 24),
  'D#': new DrumTuning(62, 72, 22),
  'E': new DrumTuning(66, 76, 22),
  'F': new DrumTuning(70, 81, 20),
  'F#': new DrumTuning(74, 85, 20),
  'G': new DrumTuning(79, 90, 18),
  'G#': new DrumTuning(83, 96, 18)
};

function setQ(headHigher, resonance) {
  let Q;

  switch (resonance) {
    case 0:
      // ft/f0 = 1.33 or ft/fb = 3 semi-tones
      Q = headHigher ? 1.1181 : 3.351;
      break;
    case 1:
      // ft/f0 = 1.5 or ft/fb = 2 semi-tones
      Q = headHigher ? 2.1174 : 5.03;
      break;
    case 2:
      // ft/f0 = 1.67 or ft/fb = 1 semi-tone
      Q = headHigher ? 9.2274 : 10.064;
      break;
    case 3:
      Q = 10000;
      break;
    default:
      Q = 1;
      break;
  }

  return Q;
}

function setNoteFreqs() {
  const semiToneRatio = 1.0594631;
  let c1note = 32.7032;
  let noteFreqs = [];

  for (let i = 0; i < 60; i++) {
    noteFreqs[i] = c1note;
    c1note *= semiToneRatio;
  }

  return noteFreqs;
}

function getNotesForToms(tomsCount, lowestTom, tomGap, rootNote) {
  let fo = [];

  switch (tomsCount) {
    case 1:
      fo = [0];
      break;
    case 2:
      if (tomGap < 3) {
        // Perfect Fifth
        fo = [0, 7];
      } else {
        // Octave
        fo = [0, 12];
      }
      break;
    case 3:
      if (tomGap < 2) {
        // Major Chord
        fo = [0, 4, 7];
      } else if (tomGap === 2) {
        // Major Thirds
        fo = [0, 4, 8];
      } else {
        // Perfect Fourths
        fo = [0, 5, 10];
      }
      break;
    case 4:
      if (tomGap < 2) {
        // Call to the Post
        fo = [0, 5, 9, 12];
      } else if (tomGap === 2) {
        // Major Thirds
        fo = [0, 4, 8, 12];
      } else {
        // Perfect Fourths
        fo = [0, 5, 10, 15];
      }
      break;
    case 5:
      if (tomGap < 2) {
        // Major Thirds
        fo = [0, 4, 8, 12, 16];
      } else {
        // Perfect Fourths
        fo = [0, 5, 10, 15, 20];
      }
      break;
    case 6:
      if (lowestTom === 18) {
        // Major Thirds
        fo = [0, 4, 8, 12, 16, 20];
      } else if (lowestTom === 16) {
        // Minor Thirds
        fo = [0, 3, 6, 9, 12, 15];
      } else if (lowestTom === 15) {
        // Hybrid
        fo = [0, 3, 6, 9, 12, 14];
      }
      break;
    case 7:
      if (lowestTom === 18) {
        // Minor Thirds
        fo = [0, 3, 6, 9, 12, 15, 18];
      } else if (lowestTom === 16) {
        // Hybrid
        fo = [0, 2, 4, 7, 10, 13, 16];
      }
      break;
    case 8:
      // Hybrid
      fo = [0, 2, 4, 7, 10, 13, 16, 19];
      break;
    default:
      break;
  }

  return fo.map(i => rootNote + i);
}

const tomRootNote = {
  18: 11,
  16: 14,
  15: 16,
  14: 17,
  13: 19,
  12: 22,
  10: 26,
  8: 31
};

/**
 *
 * @param {numer} position 1 if batter, -1 if resonant
 * @param {*} fo
 * @param {*} Q
 */
function headFreq(position, fo, Q) {
  const A = 1 / 1.72;
  return (fo / (2 * Q)) * (Math.sqrt(1.0 + Math.pow(2 * Q / A, 2)) + position);
}

function calculateNotes(sizes) {
  let tomsCount = sizes.length;
  let lowestTom = Math.max(...sizes);
  let highestTom = Math.min(...sizes);
  let tomGap = lowestTom - highestTom - tomsCount + 1; // gap between the toms

  return getNotesForToms(tomsCount, lowestTom, tomGap, tomRootNote[lowestTom]);
}

class Toms {
  constructor(sizes) {
    let headHigher = false;

    this.sizes = sizes;
    this.resonance = 1; // 0 is low 3 is max
    this.pitchTranspose = 3; // 3 is default or medium

    this.batters = [];
    this.resos = [];
    this.notes = [];

    const Q = setQ(headHigher, this.resonance);
    const noteFreqs = setNoteFreqs();
    const fo = calculateNotes(this.sizes);

    let result = [];
    const letters = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
    const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const sharps = ['', '#', '', '#', '', '', '#', '', '#', '', '#', ''];

    sizes.forEach((tom, i) => {
      let fundamental = noteFreqs[fo[i]];
      let batter = headFreq(headHigher ? 1 : -1, fundamental, Q);
      let resonant = headFreq(headHigher ? -1 : 1, fundamental, Q);

      let octave = (fo[i] / 12) + 1;
      let note = fo[i] % 12;
      let noteLetter = letters[note];

      this.batters.push(Math.round(batter));
      this.resos.push(Math.round(resonant));
      this.notes.push(scale[noteLetter] + sharps[note]);

      result.push([
        tom,
        Math.floor(octave),
        scale[noteLetter] + sharps[note],
        Math.round(fundamental),
        Math.round(batter),
        Math.round(resonant)
      ]);
    });
  }

  getBatters() {
    return this.batters;
  }

  getResos() {
    return this.resos;
  }

  getNotes() {
    return this.notes;
  }

  getSizes() {
    return this.sizes;
  }
  getImageUrl() {
    let drums = this.sizes;
    let batter = this.batters;
    let reso = this.resos;
    let note = this.notes.map(note => note.replace(/#/g, '%23'));

    return `${DRUMS_IMAGE_ENDPOINT}?background=true&drums=${drums}&batters=${batter}&resos=${reso}&notes=${note}`;
  }
}

const DRUMS_IMAGE_ENDPOINT = `https://us-central1-drum-tuner.cloudfunctions.net/drumsImage`;

class Drum {
  constructor() {
    this.type = '';
    this.fundamental = '';
  }

  fromFundamental(type, fundamental) {
    this.fundamental = normalizeNotes(fundamental);
    this.type = type;
    let tuning = {};

    switch (this.type) {
      case DrumTypes.BASS_DRUM:
        tuning = BassDrumTunings[this.fundamental];
        this.size = tuning.size || 22;
        break;
      case DrumTypes.SNARE:
      default:
        tuning = SnareTunings[this.fundamental];
        this.size = tuning.size || 14;
        break;
    }

    this.batter = tuning.batter;
    this.resonant = tuning.resonant;
  }

  getBatterLugFreq() {
    return this.batter;
  }

  getResonantLugFreq() {
    return this.resonant;
  }

  getFundamental() {
    return this.fundamental;
  }

  getSize() {
    return this.size;
  }

  getImageUrl() {
    let drum = this.size;
    let batter = this.batter;
    let reso = this.resonant;
    let note = this.fundamental.replace(/#/g, '%23');

    return `${DRUMS_IMAGE_ENDPOINT}?background=true&drums=${drum}&batters=${batter}&resos=${reso}&notes=${note}`;
  }
}

module.exports = {
  Drum,
  Toms,
  DrumTuning,
  SnareTunings,
  BassDrumTunings,

  setQ,
  setNoteFreqs,
  tomRootNote,
  calculateNotes,
  getNotesForToms
};
