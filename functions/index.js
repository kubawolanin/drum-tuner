'use strict';

process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');
const { Toms, Drum } = require('./drum');
const { sprintf } = require('sprintf-js');

const DEFAULT_LOCALE = 'en-US';
const localizedStrings = {
  'en-US': require('./strings_en-US.js')
};

const DEBUG_LOGS = true;

/** Dialogflow Actions {@link https://dialogflow.com/docs/actions-and-parameters#actions} */
const Actions = {
  UNRECOGNIZED_DEEP_LINK: 'deeplink.unknown',
  TUNE_DRUM: 'tune.drum',
  TELL_TIPS: 'tell.tips',
  REPEAT: 'repeat'
};
/** Dialogflow Parameters {@link https://dialogflow.com/docs/actions-and-parameters#parameters} */
const Parameters = {
  DRUM_TYPE: 'drum-type',
  CATEGORY: 'category'
};
/** Dialogflow Contexts {@link https://dialogflow.com/docs/contexts} */
const Contexts = {
  TUNING: 'choose_tuning-followup',
  TIPS: 'choose_tips-followup'
};
/** Dialogflow Context Lifespans {@link https://dialogflow.com/docs/contexts#lifespan} */
const Lifespans = {
  DEFAULT: 5,
  END: 0
};

/**
 * @template T
 * @param {Array<T>} array The array to get a random value from
 */
const getRandomValue = array => array[Math.floor(Math.random() * array.length)];
/** @param {Array<string>} tips The array of tips to choose a tip from */
const getRandomTip = tips => {
  if (!tips.length) {
    return null;
  }
  const tip = getRandomValue(tips);
  // Delete the tip from the local data since we now already used it
  tips.splice(tips.indexOf(tip), 1);
  return tip;
};

/** @param {Array<string>} messages The messages to concat */
const concat = messages => messages.map(message => message.trim()).join(' ');

// Polyfill Object.values to get the values of the keys of an object
if (!Object.values) {
  Object.values = o => Object.keys(o).map(k => o[k]);
}

/**
 * Greet the user and direct them to next turn
 * @param {DialogflowApp} app DialogflowApp instance
 * @return {void}
 */
const unhandledDeepLinks = app => {
  const strings = localizedStrings[app.getUserLocale()] || localizedStrings[DEFAULT_LOCALE];
  const rawInput = app.getRawInput();
  const response = sprintf(strings.general.unhandled, rawInput);
  const screenOutput = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
  if (!screenOutput) {
    return ask(app, response, strings.general.noInputs);
  }
  const suggestions = strings.categories.map(category => category.suggestion);
  const richResponse = app
    .buildRichResponse()
    .addSimpleResponse(response)
    .addSuggestions(suggestions);

  ask(app, richResponse, strings.general.noInputs);
};

/**
 * Set up app.data for use in the action
 * @param {DialogflowApp} app DialogflowApp instance
 */
const initData = app => {
  const data = app.data;
  if (!data.tips) {
    data.tips = {
      content: {},
      cats: null
    };
  }

  if (!data.tuning) {
    data.tuning = {
      content: {}
    };
  }
  return data;
};

/**
 * Say they've heard it all about this category
 * @param {DialogflowApp} app DialogflowApp instance
 * @param {string} currentCategory The current category
 * @param {string} redirectCategory The category to redirect to since there are no tips left
 */
const noTipsLeft = (app, currentCategory, redirectCategory) => {
  const strings = localizedStrings[app.getUserLocale()] || localizedStrings[DEFAULT_LOCALE];
  const data = initData(app);
  // Replace the outgoing tips context with different parameters
  app.setContext(Contexts.TIPS, Lifespans.DEFAULT, {
    [Parameters.CATEGORY]: redirectCategory
  });
  const response = [sprintf(strings.transitions.content.heardItAll, currentCategory, redirectCategory)];
  const tuningTips = data.tips.tuning;
  if (!tuningTips || tuningTips.length) {
    response.push(strings.transitions.content.alsoCats);
  }
  response.push(strings.general.wantWhat);
  return concat(response);
};

const tuneDrum = app => {
  const strings = localizedStrings[app.getUserLocale()] || localizedStrings[DEFAULT_LOCALE];
  const data = initData(app);
  // const tuning = data.tuning.content;

  const drumType = app.getArgument('drum-type');
  const drumSizes = app.getArgument('drum-sizes');
  const drumCount = app.getArgument('drum-count');
  // const resonance = app.getArgument('resonance');
  // const tuningStyle = app.getArgument('tuning-style');
  const fundamental = app.getArgument('note');

  if (DEBUG_LOGS) {
    console.log('Received data', data);
    console.log('drumCount', drumCount);
    console.log('Received parameters', drumType, fundamental);
  }

  if (drumSizes.length > 0 && drumType === 'tom') {
    let toms = new Toms(drumSizes.map(s => s.amount));

    app.tell(
      app
      .buildRichResponse()
      .addSimpleResponse(sprintf(strings.tuning.toms, toms.getNotes().join(', ')))
      .addBasicCard(
        app.buildBasicCard()
        .setImage(toms.getImageUrl(), `${toms.getNotes().join(', ')}`)
      )
    );
  } else {
    if (fundamental) {
      let drum = new Drum();
      drum.fromFundamental(drumType, fundamental);

      let verbalResponse = sprintf(
        strings.tuning.drum,
        drumType,
        drum.getBatterLugFreq(),
        drum.getResonantLugFreq(),
        drum.getFundamental()
      );

      app.tell(
        app.buildRichResponse()
        .addSimpleResponse(verbalResponse)
        .addBasicCard(
          app.buildBasicCard(
            sprintf(strings.tuning.lugs,
              drumType,
              drum.getBatterLugFreq(),
              drum.getResonantLugFreq()
            )
          )
          .setImage(drum.getImageUrl(), `${drum.getFundamental()}`)
        )
      );
    } else {
      ask(app, sprintf(strings.tuning.note, drumType));
    }
  }
};

/**
 * Say a tip
 * @param {DialogflowApp} app DialogflowApp instance
 * @return {void}
 */
const tellTip = app => {
  const strings = localizedStrings[app.getUserLocale()] || localizedStrings[DEFAULT_LOCALE];
  const data = initData(app);
  const tips = data.tips.content;
  for (const category of strings.categories) {
    // Initialize categories with all the tips if they haven't been read
    if (!tips[category.category]) {
      tips[category.category] = category.tips.slice();
    }
  }
  if (Object.values(tips).every(category => !category.length)) {
    // If every tip category tips stored in app.data is empty
    return app.tell(strings.general.heardItAll);
  }
  const parameter = Parameters.CATEGORY;
  const tipCategory = app.getArgument(parameter);
  const screenOutput = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
  const category = strings.categories.find(c => c.category === tipCategory);
  if (!category) {
    const action = app.getIntent();
    console.error(`${parameter} parameter is unrecognized or ` +
      `not provided by Dialogflow ${action} action`);
    return;
  }
  const tip = getRandomTip(tips[category.category]);
  if (!tip) {
    const otherCategory = strings.categories.find(other => other !== category);
    if (!otherCategory) {
      return console.error(`No other category besides ${category.category} exists`);
    }
    if (!screenOutput) {
      return ask(app, noTipsLeft(app, tipCategory, otherCategory.category), strings.general.noInputs);
    }
    const suggestions = [otherCategory.suggestion];
    const tuningTips = data.tips.tuning;
    if (!tuningTips || tuningTips.length) {
      // If cat tips not loaded or there still are cat tips left
      suggestions.push(strings.cats.suggestion);
    }
    const richResponse = app
      .buildRichResponse()
      .addSimpleResponse(noTipsLeft(app, tipCategory, otherCategory.category))
      .addSuggestions(suggestions);

    return ask(app, richResponse, strings.general.noInputs);
  }
  const tipPrefix = category.tipPrefix;
  if (!screenOutput) {
    return ask(app, concat([tipPrefix, tip, strings.general.nexttip]), strings.general.noInputs);
  }
  const image = getRandomValue(strings.content.images);
  const [url, name] = image;
  const card = app
    .buildBasicCard(tip)
    .addButton(strings.general.linkOut, strings.content.link)
    .setImage(url, name);

  const richResponse = app
    .buildRichResponse()
    .addSimpleResponse(tipPrefix)
    .addBasicCard(card)
    .addSimpleResponse(strings.general.nexttip)
    .addSuggestions(strings.general.suggestions.confirmation);

  ask(app, richResponse, strings.general.noInputs);
};

/**
 * Say a cat tip
 * @param {DialogflowApp} app DialogflowApp instance
 * @return {void}
 */
const tellTuningTip = app => {
  const strings = localizedStrings[app.getUserLocale()] || localizedStrings[DEFAULT_LOCALE];
  const data = initData(app);
  if (!data.tips.tuning) {
    data.tips.tuning = strings.cats.tips.slice();
  }
  const tuningTips = data.tips.tuning;
  const tip = getRandomTip(tuningTips);
  const screenOutput = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
  if (!tip) {
    // Add tips context to outgoing context list
    app.setContext(Contexts.TIPS, Lifespans.DEFAULT, {});
    // Replace outgoing cat-tips context with lifespan = 0 to end it
    app.setContext(Contexts.CATS, Lifespans.END, {});
    if (!screenOutput) {
      return ask(app, strings.transitions.cats.heardItAll, strings.general.noInputs);
    }
    const richResponse = app
      .buildRichResponse()
      .addSimpleResponse(strings.transitions.cats.heardItAll, strings.general.noInputs)
      .addSuggestions(strings.general.suggestions.confirmation);

    return ask(app, richResponse);
  }
  const tipPrefix = sprintf(strings.cats.tipPrefix, getRandomValue(strings.cats.sounds));
  if (!screenOutput) {
    // <speak></speak> is needed here since tipPrefix is a SSML string and contains audio
    return ask(app, `<speak>${concat([tipPrefix, tip, strings.general.nexttip])}</speak>`, strings.general.noInputs);
  }
  const image = getRandomValue(strings.cats.images);
  const [url, name] = image;
  const card = app
    .buildBasicCard(tip)
    .setImage(url, name)
    .addButton(strings.general.linkOut, strings.cats.link);

  const richResponse = app
    .buildRichResponse()
    .addSimpleResponse(`<speak>${tipPrefix}</speak>`)
    .addBasicCard(card)
    .addSimpleResponse(strings.general.nexttip)
    .addSuggestions(strings.general.suggestions.confirmation);

  ask(app, richResponse, strings.general.noInputs);
};

const ask = (app, inputPrompt, noInputPrompts) => {
  app.data.lastPrompt = inputPrompt;
  app.data.lastNoInputPrompts = noInputPrompts;
  app.ask(inputPrompt, noInputPrompts);
};

const repeat = app => {
  if (!app.data.lastPrompt) {
    ask(app, `Sorry, I didn't understand. Which type of tip would you like to hear?`); // TODO: strings.
  }
  // Move SSML start tags for simple response over
  if (typeof app.data.lastPrompt === 'string') {
    let repeatPrefix = `Sure, here's that again.`;
    const ssmlPrefix = `<speak>`;
    if (app.data.lastPrompt.startsWith(ssmlPrefix)) {
      app.data.lastPrompt = app.data.lastPrompt.slice(ssmlPrefix.length);
      repeatPrefix = ssmlPrefix + repeatPrefix;
    }
    ask(app, repeatPrefix + app.data.lastPrompt, app.data.lastNoInputPrompts);
  } else {
    ask(app, app.data.lastPrompt, app.data.lastNoInputPrompts);
  }
};

const actionMap = new Map();
actionMap.set(Actions.UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
actionMap.set(Actions.TUNE_DRUM, tuneDrum);
actionMap.set(Actions.TELL_TIPS, tellTip);
actionMap.set(Actions.TELL_CAT_tip, tellTuningTip); // TODO: Fix
actionMap.set(Actions.REPEAT, repeat);

/**
 * The entry point to handle a http request
 * @param {Request} request An Express like Request object of the HTTP request
 * @param {Response} response An Express like Response object to send back data
 */
const drumTuner = functions.https.onRequest((request, response) => {
  const app = new DialogflowApp({ request, response });
  console.log(`Request headers: ${JSON.stringify(request.headers)}`);
  console.log(`Request body: ${JSON.stringify(request.body)}`);
  app.handleRequest(actionMap);
});

const drumsImage = functions.https.onRequest((request, response) => {
  const drumsString = request.query.drums;
  const battersString = request.query.batters;
  const resosString = request.query.resos;
  const notesString = request.query.notes;
  // TODO: Refactor
  if (drumsString === undefined || drumsString.length === 0 ||
    battersString === undefined || battersString.length === 0 ||
    resosString === undefined || resosString.length === 0 ||
    notesString === undefined || notesString.length === 0) {
    // Invalid parameter
    response.status(400).send('Bad Request - Requires `drums`, `batters`, `resos` and `notes` GET parameters');
    return;
  }

  const drums = drumsString.split(',').map(d => parseInt(d, 10));
  const batters = battersString.split(',').map(b => parseInt(b, 10));
  const resos = resosString.split(',').map(r => parseInt(r, 10));
  const notes = notesString.split(',');

  if (drums.length < 1 || drums.length > 5) {
    // Validate number of drums
    response.status(400).send('Bad Request - `drums` list must have between 1 and 5 drums inclusive');
    return;
  }

  // Generate a canvas
  const Canvas = require('canvas-prebuilt');
  const { addDrum } = require('./draw');
  const cWidth = 800;
  const cHeight = 396;
  const canvas = new Canvas(cWidth, cHeight);
  const ctx = canvas.getContext('2d');
  const largestSize = Math.max(...drums);

  // place the drums evenly next to each other
  const position = {
    1: [2],
    2: [3, 1.5],
    3: [5, 2, 1.2],
    4: [9, 3.1, 1.8, 1.2],
    5: [12, 4.2, 2.4, 1.6, 1.15]
  };

  if (request.query.background) {
    ctx.beginPath();
    ctx.fillStyle = '#efefef';
    ctx.rect(0, 0, cWidth, cHeight);
    ctx.fill();
  }

  drums.map((drumSize, i) => {
    addDrum(
      ctx, {
        size: drumSize || '',
        largestSize: largestSize,
        batter: batters[i] || '',
        reso: resos[i] || '',
        note: notes[i] || '',
        leftPosition: cWidth / position[drums.length][i],
        topPosition: cHeight / 2
      }
    );
  });

  response.set('Cache-Control', 'public, max-age=60, s-maxage=31536000');
  response.writeHead(200, { 'Content-Type': 'image/png' });
  canvas.pngStream().pipe(response);
});

const privacy = functions.https.onRequest((request, response) => {
  response.send(`
    <h1>About Drum Tuner</h1>
    <p>
    Drum Tuner gives users a way to tune their drums in best frequencies possible.
    Each request is sent anonymously and queries are not shared with any third-parties.
    </p>
  `);
});

module.exports = {
  drumTuner,
  drumsImage,
  privacy
};
