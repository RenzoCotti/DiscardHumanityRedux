"use strict";

const {
  log,
  RESULT_TIMEOUT,
  USER_CHOICE_TIMEOUT,
  drawBlackCard,
  drawUpTo10,
  drawWhiteCardsAll,
  setGameState,
  getUser,
  sendCardsToVote,
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
    exports.pickNewTsar(lobby);
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


//this function picks a new tsar in case it's necessary
//in case meritocracy, tsar is last winner
exports.pickNewTsar = (lobby) => {
  let tsar = lobby.gameState.tsar;
  //new tsar is last round winner
  if (lobby.gameSettings.meritocracy) {
    if (lobby.gameSettings.lastRoundWinner) {
      let user = getUser(lobby, lobby.gameSettings.lastRoundWinner);
      if (user) {
        //setting tsar to last winner
        tsar.id = user.id;
      } else {
        //no matching user found, setting to first one
        tsar.id = lobby.userList[0].id;
      }
    } else {
      //no user beforehand, setting to 0
      tsar.id = lobby.userList[0].id;
    }
  } else {
    //we simply go over the users in order
    //everybody tsar'd once at least, we loop
    //we reset the counter if we can't find the user either
    if (tsar.tsarIndex + 1 === lobby.userList.length || !lobby.userList[tsar.tsarIndex]) {
      tsar.tsarIndex = 0;
    } else {
      tsar.tsarIndex++;
    }

    //set the tsar id
    tsar.id = lobby.userList[tsar.tsarIndex].id;
    log("New tsar: " + lobby.userList[tsar.tsarIndex].username);
  }
};