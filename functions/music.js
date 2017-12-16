const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Simple function for transposing notes.
 *
 * @param {string} note - base note for transposition
 * @param {number} pitch - negative or positive number determining a target note.
 */
function transpose(note, pitch) {
  let index = scale.indexOf(normalizeNotes(note)) + (Math.round(pitch || 0) % 12);
  return scale[index < 0 ? scale.length + index : index];
}

/**
 * Normalizes notes to a predictable format.
 *
 * @param {string} notes - notes in various formats. E.g. normalizeNotes('g', 'f sharp', 'Bb')
 */
function normalizeNotes(...notes) {
  return notes.map(function(note) {
    note = ('' + note)
      .toUpperCase()
      .replace(/♭/g, 'b')
      .replace(/ FLAT/g, 'b')
      .replace(/ SHARP/g, '#')
      .replace(/IS/g, '#')
      .replace(/HES/g, 'B')
      .replace(/[A-G]ES/, match => match.substr(0, 1) + 'b')
      .replace(/ES/g, 'D#')
      .replace(/AS/g, 'G#')
      .replace(/b#/g, '')
      .replace(/#b/g, '')
      .replace(/[A-G]##/g, match => transpose(match.substr(0, 1), 2))
      .replace(/[A-G]bb/g, match => transpose(match.substr(0, 1), -2));

    let notesMap = {
      'Cb': 'B',
      'B#': 'C',
      'Db': 'C#',
      'Eb': 'D#',
      'Fb': 'E',
      'E#': 'F',
      'Gb': 'F#',
      'Ab': 'G#',
      'Bb': 'A#'
    };

    return notesMap[note] || note;
  }).join(' ');
}

function semitones(note1, note2) {
  let note1Index = scale.indexOf(normalizeNotes(note1));
  let note2Index = scale.indexOf(normalizeNotes(note2));

  return note2Index - note1Index;
}

function interval(note1, note2) {
  let semi = semitones(note1, note2);

  return semi;
}

module.exports = {
  scale,
  transpose,
  normalizeNotes,
  interval
};
