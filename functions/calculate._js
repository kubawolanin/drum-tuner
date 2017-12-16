var tomSelect = [0, 0, 0, 0, 0, 0, 0, 0];

var resonance = 1; // 0 is low 3 is max
var pitchTranspose = 3; // 3 is default or medium
var headHigher = 1; // temp - 0 means top head is higher

var nToms;
var loTom;
var hiTom;
var loTomFound;
var tomGap;

var tomSizes = [18, 16, 15, 14, 13, 12, 10, 8];
var letters = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
var scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
var sharps = [' ', '#', ' ', '#', ' ', ' ', '#', ' ', '#', ' ', '#', ' '];
var tom = [];
var fo = []; // where is fo initialized in orginal c???
var freq;
var fdrum = [];
var ftop = [];
var fbot = [];
var octave;
var noteLetter;
var Q;
var A;
var noteFreqs = [];

Q = 1.0;
A = 1 / 1.72;
nToms = 0;
var result;

function hiHeadFreq (fo, Q, A) {
  var f;
  f = (fo / (2 * Q)) * (Math.sqrt(1.0 + Math.pow(2 * Q / A, 2)) + 1);
  return f;
}

function loHeadFreq (fo, Q, A) {
  var f;
  f = (fo / (2 * Q)) * (Math.sqrt(1.0 + Math.pow(2 * Q / A, 2)) - 1);
  return f;
}

function myFunction (tomSize) {
  switch (tomSize) {
    case 18:
      var eighteen = document.getElementById('eighteen');
      if (eighteen.checked) {
        tomSelect[0] = 1;
      } else {
        tomSelect[0] = 0;
      }
      break;
    case 16:
      var sixteen = document.getElementById('sixteen');
      if (sixteen.checked) {
        tomSelect[1] = 1;
      } else {
        tomSelect[1] = 0;
      }
      break;
    case 15:
      var fifteen = document.getElementById('fifteen');
      if (fifteen.checked) {
        tomSelect[2] = 1;
      } else {
        tomSelect[2] = 0;
      }
      break;
    case 14:
      var fourteen = document.getElementById('fourteen');
      if (fourteen.checked) {
        tomSelect[3] = 1;
      } else {
        tomSelect[3] = 0;
      }
      break;
    case 13:
      var thirteen = document.getElementById('thirteen');
      if (thirteen.checked) {
        tomSelect[4] = 1;
      } else {
        tomSelect[4] = 0;
      }
      break;
    case 12:
      var twelve = document.getElementById('twelve');
      if (twelve.checked) {
        tomSelect[5] = 1;
      } else {
        tomSelect[5] = 0;
      }
      break;
    case 10:
      var ten = document.getElementById('ten');
      if (ten.checked) {
        tomSelect[6] = 1;
      } else {
        tomSelect[6] = 0;
      }
      break;
    case 8:
      var eight = document.getElementById('eight');
      if (eight.checked) {
        tomSelect[7] = 1;
      } else {
        tomSelect[7] = 0;
      }
      break;
            /// end tom entry -begin resonance entry
    case 'low':
      resonance = 0;
      break;
    case 'medium':
      resonance = 1;
      break;
    case 'high':
      resonance = 2;
      break;
    case 'max':
      resonance = 3;
      break;
            /// end resonance entry start pitch transpose entry
    case 'neg-three':
      pitchTranspose = 0;
      break;
    case 'neg-two':
      pitchTranspose = 1;
      break;
    case 'neg-one':
      pitchTranspose = 2;
      break;
    case 'zero':
      pitchTranspose = 3;
      break;
    case 'one':
      pitchTranspose = 4;
      break;
    case 'two':
      pitchTranspose = 5;
      break;
    case 'three':
      pitchTranspose = 6;
      break;
            // end resonance entry and begin top or bottom head higher
    case 'batter-higher':
      headHigher = 0;
      break;
    case 'reso-higher':
      headHigher = 1;
      break;
            /// end head higher and begin calculate

    case 0:
      if (nToms > 8) {
        dump('Number of Toms must be 8 or less');
      } else {
        result = '<tr><th>Tom Size</th><th>Octave</th><th>Note</th><th>Fundamental</th><th>Batter Pitch</th><th>Reso Pitch</th></tr>';
        for (i = 0; i < nToms; i++) {
          octave = (fo[i] / 12) + 1;
          note = fo[i] % 12;
          noteLetter = letters[note];
          result += '<tr><td>' + tom[i] + '</td><td>' +
                    Math.floor(octave) +
                    '</td><td>' +
                    scale[noteLetter] +
                    sharps[note] + '</td><td>' +
                    fdrum[i].toFixed(0) +
                    '</td><td>' +
                    ftop[i].toFixed(0) +
                    '</td><td>' +
                    fbot[i].toFixed(0) +
                    '</td></tr>';

                    // dump(  tom[i] + octave + scale[noteLetter] + sharps[note] + fdrum[i]+ ftop[i]+ fbot[i])
                    // dump('octave: ' + octave)
                    // dump( "Note: "   + scale[noteLetter] + sharps[note] )
                    // dump('fundamental: ' + fdrum[i])
                    // dump('batter pitch: ' + ftop[i])
                    // dump('reso pitch: ' + fbot[i])
        }
        dump(result);
      } // endelse
      break;
  } // end case.

  if (headHigher == 1) {
    switch (resonance) {
      case 0:
        Q = 1.1181; // ft/f0 = 1.33
        break;
      case 1:
        Q = 2.1174; // ft/f0 = 1.5
        break;
      case 2:
        Q = 9.2274; // ft/f0 = 1.67
        break;
      case 3:
        Q = 10000;
        break;
    }
  } else {
    switch (resonance) {
      case 0:
        Q = 3.351; // ft/fb = 3 semi-tones
        break;
      case 1:
        Q = 5.03; // ft/fb = 2 semi-tones
        break;
      case 2:
        Q = 10.064; // ft/fb = 1 semi-tone
        break;
      case 3:
        Q = 10000;
        break;
    }
  }

  var semiToneRatio = 1.0594631;
  var c1note = 32.7032;
  for (i = 0; i < 60; i++) {
    noteFreqs[i] = c1note;
    c1note *= semiToneRatio;
  }

  nToms = 0;
  loTom = 0;
  hiTom = 0;
  loTomFound = 0;
  for (i = 0; i < 8; i++) {
    if (tomSelect[i] === 1) {
      if (loTomFound === 0) {
        loTom = i;
      }
      loTomFound = 1;
      hiTom = i;
      tom[nToms] = tomSizes[i];
      nToms++;
    }
  }

  tomGap = hiTom - loTom - nToms + 1;

  switch (loTom) {
    case 0: // 18"
      root = 11;
      break;
    case 1: // 16"
      root = 14;
      break;
    case 2: // 15"
      root = 16;
      break;
    case 3: // 14"
      root = 17;
      break;
    case 4: // 13"
      root = 19;
      break;
    case 5: // 12"
      root = 22;
      break;
    case 6: // 10"
      root = 26;
      break;
    case 7: // 8"  Need to fix for adding 15"
      root = 31;
      break;
    default:
      root = 17;
  }

  switch (pitchTranspose) {
    case 0:
      root -= 3;
      break;
    case 1:
      root -= 2;
      break;
    case 2:
      root -= 1;
      break;
    case 3:
      break;
    case 4:
      root += 1;
      break;
    case 5:
      root += 2;
      break;
    case 6:
      root += 3;
      break;
  }
    // working up to this point

  switch (nToms) {
    case 1:
      fo[0] = root;
      break;
    case 2:
      if (tomGap < 3) {
        fo[0] = root; // Perfect Fifth
        fo[1] = root + 7;
      } else {
        fo[0] = root; // Octave
        fo[1] = root + 12;
      }
      break;
    case 3:
      if (tomGap < 2) { // Major Chord
        fo[0] = root;
        fo[1] = root + 4;
        fo[2] = root + 7;
      } else if (tomGap === 2) { // Major Thirds
        fo[0] = root;
        fo[1] = root + 4;
        fo[2] = root + 8;
      } else {
        fo[0] = root; // Perfect Fourths
        fo[1] = root + 5;
        fo[2] = root + 10;
      }
      break;
    case 4:
      if (tomGap < 2) { // Call to the Post
        fo[0] = root;
        fo[1] = root + 5;
        fo[2] = root + 9;
        fo[3] = root + 12;
      } else if (tomGap === 2) { // Major Thirds
        fo[0] = root;
        fo[1] = root + 4;
        fo[2] = root + 8;
        fo[3] = root + 12;
      } else {
        fo[0] = root; // Perfect Fourths
        fo[1] = root + 5;
        fo[2] = root + 10;
        fo[3] = root + 15;
      }
      break;
    case 5:
      if (tomGap < 2) { // Major Thirds
        fo[0] = root;
        fo[1] = root + 4;
        fo[2] = root + 8;
        fo[3] = root + 12;
        fo[4] = root + 16;
      } else {
        fo[0] = root; // Perfect Fourths
        fo[1] = root + 5;
        fo[2] = root + 10;
        fo[3] = root + 15;
        fo[4] = root + 20;
      }
      break;
    case 6:
      if (loTom == 0) { // Major Thirds
        fo[0] = root;
        fo[1] = root + 4;
        fo[2] = root + 8;
        fo[3] = root + 12;
        fo[4] = root + 16;
        fo[5] = root + 20;
      } else if (loTom == 1) {
        fo[0] = root; // Minor Thirds
        fo[1] = root + 3;
        fo[2] = root + 6;
        fo[3] = root + 9;
        fo[4] = root + 12;
        fo[5] = root + 15;
      } else if (loTom == 2) {
        fo[0] = root; // Hybrid
        fo[1] = root + 3;
        fo[2] = root + 6;
        fo[3] = root + 9;
        fo[4] = root + 12;
        fo[5] = root + 14;
      }
      break;
    case 7:
      if (loTom == 0) { // Minor Thirds
        fo[0] = root;
        fo[1] = root + 3;
        fo[2] = root + 6;
        fo[3] = root + 9;
        fo[4] = root + 12;
        fo[5] = root + 15;
        fo[6] = root + 18;
      } else if (loTom == 1) {
        fo[0] = root; // Hybrid
        fo[1] = root + 2;
        fo[2] = root + 4;
        fo[3] = root + 7;
        fo[4] = root + 10;
        fo[5] = root + 13;
        fo[6] = root + 16;
      }
      break;
    case 8:
      fo[0] = root; // Hybrid
      fo[1] = root + 2;
      fo[2] = root + 4;
      fo[3] = root + 7;
      fo[4] = root + 10;
      fo[5] = root + 13;
      fo[6] = root + 16;
      fo[7] = root + 19;
      break;
    default:
      break;
  }

  for (i = 0; i < nToms; i++) {
    freq = noteFreqs[fo[i]];
    fdrum[i] = freq;
    switch (headHigher) {
      case 0: // top head higher
        ftop[i] = hiHeadFreq(freq, Q, A);
        fbot[i] = loHeadFreq(freq, Q, A);
        break;
      case 1: // bottom head higher
        fbot[i] = hiHeadFreq(freq, Q, A);
        ftop[i] = loHeadFreq(freq, Q, A);
        break;
    }
  }
}

function dump (text) {
  document.getElementById('out')
        .innerHTML = text;
}
