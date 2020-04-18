"use strict";

const {
  NOBODY_VOTED
} = require("../messages");

const {
  log,
  getUser,
  getAllScores,
  checkIfKick,
  roundWon
} = require("../internal");



//calculates who won in democracy
exports.democracyCalculateWinner = (io, lobby, fn) => {
  //everybody voted, pick winner
  lobby.gameState.userVoted = 0;
  let winners = [];
  let max = 0;
  for (let user of lobby.userList) {
    if (user.info) {
      if (!user.info.voted) {
        user.info.inactivityCounter++;
        checkIfKick(io, lobby, user);
      } else {
        if (user.info.votes > max) {
          winners = [user.username];
          max = user.info.votes;
        } else if (user.info.votes === max && user.info.votes > 0) {
          //tie
          winners.push(user.username);
        }

        user.info.voted = false;
      }
    }
  }

  let username;
  let winningCard;
  let multipleWinners = winners.length > 1;

  let user = null;
  if (winners.length === 1) {
    user = getUser(lobby, winners[0]);
    log(user.username + " was democratically voted and won.");
  } else if (winners.length > 1) {
    //more than one winner, pick one at random
    let random = Math.floor(Math.random() * winners.length);
    user = getUser(lobby, winners[random]);
    log("Tied. RNJesus decided " + user.username + " won.");
  } else {
    //nobody voted
    let scores = getAllScores(lobby);
    io.to(lobby.name).emit(NOBODY_VOTED, scores);
    fn(io, lobby);
  }

  if (user) {
    //an individual winner
    username = user.username;
    winningCard = user.info.userChoice;
    roundWon(io, lobby, username, winningCard, multipleWinners, fn);
  }

};




