"use strict";

const {
  log,
  RESULT_TIMEOUT,
  USER_CHOICE_TIMEOUT,
  drawBlackCard,
  drawUpTo10,
  drawWhiteCardsAll,
  setGameState,
  sendCardsToVote,
  pickNewTsar,
} = require("../internal");

const {
  GAME_READY
} = require("../messages");


exports.setTimeoutAndPlayTurn = (io, lobby) => {
  lobby.gameState.turnTimeout = setTimeout(() => {
    exports.playTurn(io, lobby);
  }, RESULT_TIMEOUT);
};


exports.playTurn = (io, lobby) => {
  lobby.gameState.numberOfTurns++;
  log("########## Turn " + lobby.gameState.numberOfTurns + " ##########");

  reinitialiseLobby(lobby);

  if (lobby.gameSettings.tsar) {
    pickNewTsar(lobby);
  }

  drawUpTo10(lobby);
  drawBlackCard(lobby);

  if (lobby.gameState.currentBlackCard.pick === 3) {
    //pick 3 want you to draw 2s beforehand
    drawWhiteCardsAll(lobby, 2);
  }

  setGameState(lobby, "selecting");

  //case users don't vote
  lobby.gameState.turnTimeout = setTimeout(() => {
    log("Not all users voted...");
    sendCardsToVote(io, lobby, exports.setTimeoutAndPlayTurn);
  }, USER_CHOICE_TIMEOUT);

  io.to(lobby.name).emit(GAME_READY);
};


function reinitialiseLobby(lobby) {
  for (let user of lobby.userList) {
    user.info.cardsChosen = [];
  }
  lobby.gameState.userChosen = 0;
  //whitecards in userhand already in used, and so blackcards
}

