"use strict";

const {
  log,
  pickNewTsar,
  setGameState,
  RESULT_TIMEOUT,
  USER_CHOICE_TIMEOUT
} = require("../utils");

const {
  GAME_READY
} = require("../messages");

const {
  drawBlackCard,
  drawUpTo10,
  drawWhiteCardsAll
} = require("../game/drawCards");


const {
  sendCardsToVote
} = require("./chooseCards");


exports.setTimeoutAndPlayTurn = (io, lobby) => {
  lobby.gameState.turnTimeout = setTimeout(() => {
    log("new turn");
    exports.playTurn(io, lobby);
    io.to(lobby.name).emit(GAME_READY);
  }, RESULT_TIMEOUT);
};


exports.playTurn = (io, lobby) => {
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
    log("not all users voted");
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
