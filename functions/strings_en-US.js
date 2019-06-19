/* eslint quote-props: ["error", "always"] */
/* eslint quotes: ["error", "double"] */

// eslint-disable-next-line quotes
const deepFreeze = require('deep-freeze');

const tuning = {
  "toms": "Your toms will be tuned as %s",
  "drum": "Tune the batter lugs of your %s to %s Hz and resonant lugs to %s Hz. The fundamental note should be %s.",
  "lugs": "Here's the tuning set up for the %s. Batter lug: %s Hz, Resonant lug: %s Hz",
  "note": "What's the desired note for your %s?"
};

const transitions = {
  "content": {
    "heardItAll": "Looks like you've heard all there is to know about the %s of Google. I could tell you about its %s instead.",
    "alsoCats": "By the way, I can tell you about cats too."
  },
  "cats": {
    "heardItAll": "Looks like you've heard all there is to know about cats. Would you like to hear about Google?"
  }
};

const general = {
  "heardItAll": "Actually it looks like you heard it all. Thanks for listening!",
  /** Used to give responses for no inputs */
  "noInputs": [
    "I didn't hear that.",
    "If you're still there, say that again.",
    "We can stop here. See you soon."
  ],
  "suggestions": {
    /** Google Assistant will respond to more confirmation variants than just these suggestions */
    "confirmation": [
      "Sure",
      "No thanks"
    ]
  },
  "acknowledgers": [
    "OK",
    "Sure",
    "Alright",
    "You got it",
    "There you go",
    "Got it"
  ],
  "nexttip": "Would you like to hear another tip?",
  "linkOut": "Learn more",
  "wantWhat": "So what would you like to hear about?",
  "unhandled": "Welcome to Drum Tuner! I'd rather not talk about %s. Wouldn't you rather talk about drumming? I can tell you about Google's history or its headquarters. Which do you want to hear about?"
};

// Use deepFreeze to make the constant objects immutable so they are not unintentionally modified
module.exports = deepFreeze({
  tuning,
  transitions,
  general
});
