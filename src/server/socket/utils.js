"use strict";

exports.TSAR_VOTE_TIMEOUT = 60;
exports.USER_CHOICE_TIMEOUT = 45;
exports.RESULT_TIMEOUT = 7;
exports.USER_INACTIVITY_MAX_TURNS = 3;
exports.BREAK_TIMEOUT = 10 * 60 * 1000;
exports.POINTS_FOR_REDRAW = 3;
exports.RANDO_USERNAME = "Rando Cardassian";
exports.lobbies = [];



exports.shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const debug = true;

/*SOME FUNCTIONS REQUIRED BY BOTH FILES c: */


exports.log = (message) => {
  if (debug) {
    console.log(message);
  }
};


