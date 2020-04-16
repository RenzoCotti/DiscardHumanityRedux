"use strict";

//this function returns an array of x cards taken from array. cycles if necessary
function drawXCards(array, x) {
  if (array.fresh.length + array.used.length < x) {
    return [];
  }

  if (array.fresh.length < x) {
    array.fresh = array.fresh.concat(array.used);
  }

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
    let oldHand = user.info.hand;
    let hand = drawXCards(lobby.gameState.whiteCards, x);
    let newHand = oldHand ? oldHand.concat(hand) : hand;
    user.info.hand = newHand;
  }
};

exports.drawUpTo10 = (lobby) => {
  for (let user of lobby.userList) {
    console.log("drawing " + user.username);
    let oldHand = user.info.hand;

    let cardsToDraw = 10 - oldHand.length;
    let hand = drawXCards(lobby.gameState.whiteCards, cardsToDraw);
    let newHand = oldHand ? oldHand.concat(hand) : hand;
    user.info.hand = newHand;
  }
};

//draws a new black card for the lobby
exports.drawBlackCard = (lobby) => {
  lobby.gameState.currentBlackCard = drawXCards(
    lobby.gameState.blackCards,
    1
  )[0];
};
