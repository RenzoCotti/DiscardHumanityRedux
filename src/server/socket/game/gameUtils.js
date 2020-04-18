"use strict";

const {
  log,
  getLobby,
  getUser,
} = require('../internal');

const {
  NEW_HAND,
  NEW_BLACK_CARD,
  IS_TSAR,
} = require("../messages");



/*
  init (setting up game, drawing cards for everyone) X CANT JOIN, wait
  selecting (everyone is picking cards)
  voting (tsar or demo or whatevs)
  result
  finished (end screen)
*/
exports.setGameState = (lobby, status) => {
  lobby.state = status;
};




exports.getGameState = (socket, msg) => {
  let lobby = getLobby(msg.lobbyName);
  if (lobby) {
    let user = getUser(lobby, msg.username);
    if (user) {
      log("Getting game state for user: " + msg.username);

      if (user.info && user.info.hand) {
        socket.emit(NEW_HAND, user.info.hand);
      }
      socket.emit(NEW_BLACK_CARD, lobby.gameState.currentBlackCard);
      socket.emit(IS_TSAR, lobby.gameState.tsar.id === socket.id);
    } else {
      log("User " + msg.username + " not found.");
    }
    //else user isn't there


  } else {
    log("Gamestate, Lobby not found: " + msg.lobbyName);
  }
};