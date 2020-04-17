"use strict";


const {
  DEMOCRACY_VOTE,
  NOBODY_VOTED,
  TSAR_VOTING,
  TSAR_NO_VOTE,
} = require("../messages");



const {
  log,
  TSAR_VOTE_TIMEOUT,

} = require("../utils");

const {
  getAllScores,
  setGameState,
  getUserByID,
} = require("../lobby/lobbyUtils");

const {
  checkIfKick
} = require("../lobby/disconnectLobby");




exports.sendCardsToVote = (io, lobby, fn) => {

  //creating the list to send to the tsar
  let cards = [];

  for (let user of lobby.userList) {

    if (user.info) {
      //adding if user voted
      if (user.info.cardsChosen.length > 0) {
        cards.push({
          choice: user.info.cardsChosen,
          username: user.username
        });
      } else if (user.info.cardsChosen.length === 0) {
        //otherwise tsar is included
        if (lobby.gameSettings.tsar && user.id === lobby.gameState.tsar.id) { continue; }
        //else user hasn't voted
        user.info.inactivityCounter++;
        checkIfKick(io, lobby, user);
      }
    }

  }


  if (cards.length === 0) {
    //nobody voted
    let scores = getAllScores(lobby);
    log("Nobody voted.");
    io.to(lobby.name).emit(NOBODY_VOTED, scores);

    //to solve for circular dependency
    fn(io, lobby);

    return;
  }

  if (lobby.gameSettings.tsar) {
    let tsar = lobby.gameState.tsar;

    log("Tsar is now voting...");

    setGameState(lobby, "voting");
    io.to(tsar.id).emit(TSAR_VOTING, cards);

    tsar.tsarTimeout = setTimeout(() => {
      log("Tsar hasn't voted.");

      //kicks tsar if necessary
      let tsarUser = getUserByID(lobby, tsar.id);

      if (tsarUser) {
        tsarUser.info.inactivityCounter++;
        checkIfKick(io, lobby, tsarUser);
      }


      let scores = getAllScores(lobby);
      io.to(lobby.name).emit(TSAR_NO_VOTE, scores);

      fn(io, lobby);

    }, TSAR_VOTE_TIMEOUT);

  } else {
    //democracy
    log("Democracy is now voting...");
    setGameState(lobby, "voting");

    io.to(lobby.name).emit(DEMOCRACY_VOTE, cards);

    //reusing tsar timeout because
    //TODO maybe add a specific timer?
    lobby.gameState.tsar.tsarTimeout = setTimeout(() => {
      log("somebody didn't vote");

      let scores = getAllScores(lobby);
      io.to(lobby.name).emit(TSAR_NO_VOTE, scores);

      fn(io, lobby);


    }, TSAR_VOTE_TIMEOUT);
  }
};



