"use strict";

const {
  log,
  shuffle
} = require("../internal");

//this function returns an array of x cards taken from array. cycles if necessary
function drawXCards(array, x) {
  //if there are not enough cards, return empty
  if (array.fresh.length + array.used.length < x) {
    log("Tried drawing too many cards");
    return [];
  }

  //need to loop the cards?
  if (array.fresh.length < x) {
    log("Run out of cards. Looping...");
    array.fresh = shuffle(array.fresh.concat(array.used));
    array.used = [];
  }

  //always take the first card
  let temp = [];
  for (let i = 0; i < x; i++) {
    let card = array.fresh.splice(0, 1)[0];
    array.used.push(card);
    temp.push(card);
  }
  return temp;
}

//draws x white cards for everybody, merges to old hand
exports.drawWhiteCardsAll = (lobby, x) => {
  for (let user of lobby.userList) {
    if (user.info) {
      log("Drawing " + x + " for user: " + user.username);
      let oldHand = user.info.hand;
      let hand = drawXCards(lobby.gameState.whiteCards, x);
      let newHand = oldHand ? oldHand.concat(hand) : hand;
      user.info.hand = newHand;
    } else {
      log("Draw x for non-init user: " + user.username);
    }
  }
};

//checks how many cards are missing from 10 and draws them
exports.drawUpTo10 = (lobby) => {
  for (let user of lobby.userList) {
    if (user.info) {
      // log("Drawing 10 for: " + user.username);
      let oldHand = user.info.hand;
      let cardsToDraw = 10 - oldHand.length;
      let hand = drawXCards(lobby.gameState.whiteCards, cardsToDraw);
      let newHand = oldHand ? oldHand.concat(hand) : hand;
      user.info.hand = newHand;
    } else {
      log("Draw 10 for non-init user: " + user.username);
    }
  }
};

//draws a new black card for the lobby
exports.drawBlackCard = (lobby) => {
  log("Drawing new black card...");
  lobby.gameState.currentBlackCard = drawXCards(
    lobby.gameState.blackCards,
    1
  )[0];
};
