
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

//   describe('#Bands', () => {
//     it('validates the right values', () => {
//       const BAND_ORANGE = Bands.ORANGE;
//       expect(BAND_ORANGE.color).to.be.equal(Colors.ORANGE);
//       expect(BAND_ORANGE.value).to.be.equal(3);
//       expect(BAND_ORANGE.hex).to.be.equal(HexValues.ORANGE);
//     });

//     it('validates the right band', () => {
//       expect(Bands[Colors['ORANGE']].value).to.be.equal(3);
//     });
//   });
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

// describe('Resistor', () => {
//   describe('class', () => {
//     it('#constructor', () => {
//       const resistor = new Resistor();
//       expect(resistor.debugLogs).to.be.equal(false);
//       expect(resistor.getStripes()).to.be.deep.equal([]);
//     });
//   });

//   describe('Decoding', () => {
//     it('parse 3-stripe color names', () => {
//       const resistor = new Resistor();
//       resistor.fromColorNames('red', 'blue', 'yellow', undefined, undefined);
//       expect(resistor.colors).to.be.deep.equal(['red', 'blue', undefined, 'yellow', undefined]);
//       const stripes = resistor.getStripes();
//       expect(stripes[0].color).to.be.equal(Colors.RED);
//       expect(stripes[1].color).to.be.equal(Colors.BLUE);
//       expect(stripes[2]).to.be.equal(undefined);
//       expect(stripes[3].color).to.be.equal(Colors.YELLOW);
//       expect(stripes[4]).to.be.equal(undefined);
//     });

//     it('parse 4-stripe color names', () => {
//       const resistor = new Resistor();
//       resistor.fromColorNames('red', 'blue', 'yellow', 'orange', undefined);
//       expect(resistor.colors).to.be.deep.equal(['red', 'blue', undefined, 'yellow', 'orange']);
//       const stripes = resistor.getStripes();
//       expect(stripes[0].color).to.be.equal(Colors.RED);
//       expect(stripes[1].color).to.be.equal(Colors.BLUE);
//       expect(stripes[2]).to.be.equal(undefined);
//       expect(stripes[3].color).to.be.equal(Colors.YELLOW);
//       expect(stripes[4].color).to.be.equal(Colors.ORANGE);
//     });

//     it('parse 5-stripe color names', () => {
//       const resistor = new Resistor();
//       resistor.fromColorNames('red', 'blue', 'yellow', 'orange', 'gold');
//       expect(resistor.colors).to.be.deep.equal(['red', 'blue', 'yellow', 'orange', 'gold']);
//       const stripes = resistor.getStripes();
//       expect(stripes[0].color).to.be.equal(Colors.RED);
//       expect(stripes[1].color).to.be.equal(Colors.BLUE);
//       expect(stripes[2].color).to.be.equal(Colors.YELLOW);
//       expect(stripes[3].color).to.be.equal(Colors.ORANGE);
//       expect(stripes[4].color).to.be.equal(Colors.GOLD);
//     });

//     it('22K Ohm decoding', () => {
//       const resistor = new Resistor();
//       resistor.fromColorNames('red', 'red', 'orange', undefined, undefined);
//       expect(resistor.getImpedance()).to.be.equal(22000);
//       expect(resistor.getTolerance()).to.be.equal(undefined);
//       expect(resistor.getImageUrl()).to.be
//                   .equal(`${RESISTOR_IMAGE_ENDPOINT}?background=true&colors=RED,RED,ORANGE`);
//       expect(resistor.getDisplayImpedance()).to.be.equal('22 Kilo');
//     });

//     it('220 Ohm decoding with empty strings', () => {
//       const resistor = new Resistor();
//       resistor.fromColorNames('red', 'red', 'brown', '', '');
//       expect(resistor.colors).to.be.deep.equal(['red', 'red', undefined, 'brown', undefined]);
//       expect(resistor.getImpedance()).to.be.equal(220);
//       expect(resistor.getTolerance()).to.be.equal(undefined);
//       expect(resistor.getImageUrl()).to.be
//                 .equal(`${RESISTOR_IMAGE_ENDPOINT}?background=true&colors=RED,RED,BROWN`);
//       expect(resistor.getDisplayImpedance()).to.be.equal(220);
//     });

//     it('220 Ohm decoding with null strings', () => {
//       const resistor = new Resistor();
//       resistor.fromColorNames('red', 'red', 'brown', null, null);
//       expect(resistor.colors).to.be.deep.equal(['red', 'red', undefined, 'brown', undefined]);
//       expect(resistor.getImpedance()).to.be.equal(220);
//       expect(resistor.getTolerance()).to.be.equal(undefined);
//       expect(resistor.getImageUrl()).to.be
//                   .equal(`${RESISTOR_IMAGE_ENDPOINT}?background=true&colors=RED,RED,BROWN`);
//       expect(resistor.getDisplayImpedance()).to.be.equal(220);
//     });

//     it('22K Ohm 5% decoding', () => {
//       const resistor = new Resistor();
//       resistor.fromColorNames('red', 'red', 'orange', 'gold', undefined);
//       expect(resistor.getImpedance()).to.be.equal(22000);
//       expect(resistor.getTolerance()).to.be.equal(5);
//       expect(resistor.getImageUrl()).to.be
//                 .equal(`${RESISTOR_IMAGE_ENDPOINT}?background=true&colors=RED,RED,ORANGE,GOLD`);
//       expect(resistor.getDisplayImpedance()).to.be.equal('22 Kilo');
//     });
//   });

//   describe('Encoding', () => {
//     it('encodes 3-strip 220 Ohm', () => {
//       const resistor = new Resistor();
//       resistor.fromNumericalParameters(220, undefined, undefined);
//       expect(resistor.stripes[0].color).to.be.equal(Colors.RED);
//       expect(resistor.stripes[1].color).to.be.equal(Colors.RED);
//       expect(resistor.stripes[2]).to.be.equal(undefined);
//       expect(resistor.stripes[3].color).to.be.equal(Colors.BROWN);
//       expect(resistor.stripes[4]).to.be.equal(undefined);
//     });

//     it('should provide access to decoding functions', () => {
//       const resistor = new Resistor();
//       resistor.fromNumericalParameters(220, undefined, undefined);
//       expect(resistor.getImpedance()).to.be.equal(220);
//       expect(resistor.getTolerance()).to.be.equal(undefined);
//       expect(resistor.getImageUrl()).to.be
//                 .equal(`${RESISTOR_IMAGE_ENDPOINT}?background=true&colors=RED,RED,BROWN`);
//       expect(resistor.getDisplayImpedance()).to.be.equal(220);
//     });

//     it('encodes 3-strip 1 Ohm', () => {
//       const resistor = new Resistor();
//       resistor.fromNumericalParameters(1, undefined, undefined);
//       expect(resistor.stripes[0].color).to.be.equal(Colors.BROWN);
//       expect(resistor.stripes[1].color).to.be.equal(Colors.BLACK);
//       expect(resistor.stripes[2]).to.be.equal(undefined);
//       expect(resistor.stripes[3].color).to.be.equal(Colors.GOLD);
//       expect(resistor.stripes[4]).to.be.equal(undefined);
//     });

//     it('encodes 5-strip 543 Ohm', () => {
//       const resistor = new Resistor();
//       resistor.fromNumericalParameters(543, undefined, '5-strip');
//       expect(resistor.stripes[0].color).to.be.equal(Colors.GREEN);
//       expect(resistor.stripes[1].color).to.be.equal(Colors.YELLOW);
//       expect(resistor.stripes[2].color).to.be.equal(Colors.ORANGE);
//       expect(resistor.stripes[3].color).to.be.equal(Colors.BLACK);
//       expect(resistor.stripes[4]).to.be.equal(undefined);
//     });

//     it('encodes 5-strip 543 KOhm', () => {
//       const resistor = new Resistor();
//       resistor.fromNumericalParameters(543, 'kilo', '5-strip');
//       expect(resistor.stripes[0].color).to.be.equal(Colors.GREEN);
//       expect(resistor.stripes[1].color).to.be.equal(Colors.YELLOW);
//       expect(resistor.stripes[2].color).to.be.equal(Colors.ORANGE);
//       expect(resistor.stripes[3].color).to.be.equal(Colors.ORANGE);
//       expect(resistor.stripes[4]).to.be.equal(undefined);
//     });

//     it('encodes 5-strip 5.43 MOhm', () => {
//       const resistor = new Resistor();
//       resistor.fromNumericalParameters(5.43, 'mega', '5-strip');
//       expect(resistor.stripes[0].color).to.be.equal(Colors.GREEN);
//       expect(resistor.stripes[1].color).to.be.equal(Colors.YELLOW);
//       expect(resistor.stripes[2].color).to.be.equal(Colors.ORANGE);
//       expect(resistor.stripes[3].color).to.be.equal(Colors.YELLOW);
//       expect(resistor.stripes[4]).to.be.equal(undefined);
//     });
//   });
// });
