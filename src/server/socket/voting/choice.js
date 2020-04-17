"use strict";

const {
  CHOICE_RECEIVED
} = require("../messages");

const {
  log
} = require("../utils");

const {
  sendCardsToVote
} = require("./sendCardsToVote");

const {
  setTimeoutAndPlayTurn
} = require("../game/turn");

const {
  getUser,
  getLobby
} = require("../lobby/lobbyUtils");



//this function handles reception of a choice from a player, and sends 
//the cards if needed to the tsar
exports.handleChoice = (io, socket, msg) => {
  let lobby = getLobby(msg.lobbyName);
  if (lobby) {
    let userInfo = getUser(lobby, msg.username).info;

    //the user hasn't already voted
    if (userInfo.cardsChosen.length === 0) {

      userInfo.inactivityCounter = 0;

      let hand = userInfo.hand;

      //we remove the cards chosen from the users hand
      for (let choice of msg.choice) {
        if (choice !== null) {
          let index = -1;

          //we have a card 
          for (let i = 0; i < hand.length; i++) {
            let currentCard = hand[i];
            //we found the card
            if (currentCard._id === choice._id) {
              index = i;
            }
          }
          //we remove the card from the hand
          if (index > -1) { hand.splice(index, 1); }
        }
      }

      userInfo.cardsChosen = msg.choice;
      lobby.gameState.userChosen++;

      log(lobby.gameState.userChosen + "/" + (lobby.userList.length - 1) + " users voted.");
      if (lobby.gameState.userChosen === lobby.userList.length - 1) {
        clearTimeout(lobby.gameState.turnTimeout);
        sendCardsToVote(io, lobby, setTimeoutAndPlayTurn);
      } else {
        log(msg.username + " sent his cards");
        socket.emit(CHOICE_RECEIVED);
      }
    } else {
      log("user already sent his cards.");
    }
  } else {
    log("handleChoice, lobby not found: " + msg.lobbyName);
  }
};