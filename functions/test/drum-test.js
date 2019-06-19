
'use strict';

const winston = require('winston');
const chai = require('chai');
const expect = chai.expect;
const {
    // Drum,
    Toms,
    DrumTuning,
    SnareTunings,
    setQ,
    setNoteFreqs,
    tomRootNote,
    calculateNotes,
    getNotesForToms
    // BassDrumTunings
} = require('.././drum');

// Default logger 🌳
winston.loggers.add('DEFAULT_LOGGER', {
  console: {
    level: 'error',
    colorize: true,
    label: 'Default logger',
    json: true,
    timestamp: true
  }
});

describe('Constants', () => {
  describe('#SnareTunings', () => {
    // validates the size of the array
    it('validates the size of the array', () => {
      expect(Object.keys(SnareTunings).length).to.be.equal(12);
    });

    // validates the right order
    it('validates the right order', () => {
      expect(Object.keys(SnareTunings)).to.be.deep.equal([
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
      ]);
    });

    it('validates the right batter frequencies', () => {
      expect(Object.values(SnareTunings).map(tuning => tuning.batter)).to.be.deep.equal([
        206, 206, 206, 217, 229, 240, 252, 266, 299, 319, 356, 390
      ]);
    });

    it('validates the right resonant frequencies', () => {
      expect(Object.values(SnareTunings).map(tuning => tuning.resonant)).to.be.deep.equal([
        309, 309, 309, 326, 343, 359, 378, 398, 398, 398, 400, 400
      ]);
    });
  });

  describe('#tomRootNote', () => {
    it('checks tomRootNote mapping', () => {
      expect(Object.keys(tomRootNote)).to.be.deep.equal(
        ['8', '10', '12', '13', '14', '15', '16', '18']
      );
    });
  });

  describe('Tom Tuning', () => {
    // validates the right color
    it('validates the setQ method', () => {
      expect(setQ(0, 0)).to.be.equal(3.351);
      expect(setQ(0, 1)).to.be.equal(5.03);
      expect(setQ(1, 0)).to.be.equal(1.1181);
      expect(setQ(1, 1)).to.be.equal(2.1174);
      expect(setQ(0, 3)).to.be.equal(10000);
    });

    it('validates the setNoteFreqs method', () => {
      let noteFreqs = setNoteFreqs();
      expect(noteFreqs.length).to.be.equal(60);
      expect(noteFreqs[0]).to.be.equal(32.7032);
      expect(noteFreqs[noteFreqs.length - 1]).to.be.equal(987.7670437999097);
    });

    it('validates calculated notes', () => {
      let notes = calculateNotes([12, 14, 16]);
      expect(notes.length).to.be.equal(3);
      expect(notes).to.be.deep.equal(
        [14, 18, 22]
      );
    });

    it('validates notes for toms calculation', () => {
      let notes = getNotesForToms(3, 16, 2, 4);
      let noteFreqs = setNoteFreqs();

      expect(notes.length).to.be.equal(3);
      expect(notes).to.be.deep.equal(
        [4, 8, 12]
      );
      expect(noteFreqs[notes[0]]).to.be.equal(41.20345095640988);
      expect(noteFreqs[notes[1]]).to.be.equal(51.91309629385731);
      expect(noteFreqs[notes[2]]).to.be.equal(65.40640417877557);
    });

    it('validates the Toms class', () => {
      let tom = new Toms([12, 14, 16]);
      expect(tom.getBatters()).to.be.deep.equal(
        [119, 150, 189]
      );
      expect(tom.getResos()).to.be.deep.equal(
        [134, 169, 212]
      );
      expect(tom.getNotes()).to.be.deep.equal(
        ['D', 'F#', 'A#']
      );
      expect(tom.getSizes()).to.be.deep.equal(
        [12, 14, 16]
      );
      expect(tom.getImageUrl()).to.be.equal(
        'https://us-central1-drum-tuner.cloudfunctions.net/' +
        'drumsImage?background=true&drums=12,14,16&batters=119,150,189&resos=134,169,212&notes=D,F%23,A%23'
      );
    });
  });
});

describe('DrumTuning', () => {
  describe('Constructor', () => {
    it('should correctly create a generic tuning', () => {
      let cBassDrumTuning = new DrumTuning(52, 60, 26);
      expect(cBassDrumTuning.batter).to.be.equal(52);
      expect(cBassDrumTuning.resonant).to.be.equal(60);
      expect(cBassDrumTuning.size).to.be.equal(26);
    });
  });
});
