"use strict";

const {
  ROUND_WIN,
  GAME_WIN,
} = require("../messages");

const {
  log,
  getUser,
  getAllScores,
} = require("../internal");



function modifyScore(lobby, username, amount) {
  for (let user of lobby.userList) {
    if (user.username === username) {
      user.info.score += amount;
    }
  }
}




exports.roundWon = (io, lobby, username, winningCard, multipleWinners, fn) => {
  let user = getUser(lobby, username);

  if (user) {
    log(username + " won the round.");

    lobby.gameState.lastRoundWinner = username;

    //winner gets a point
    modifyScore(lobby, username, +1);


    //check win conditions of the game
    let end = false;

    if (lobby.gameSettings.ending === "score") {
      for (let user of lobby.gameState.userState.info) {
        if (user.score === lobby.gameSettings.ending.max) {
          end = true;
        }
      }

    } else if (lobby.gameSettings.ending === "turns") {
      if (lobby.gameState.numberOfTurns === lobby.gameSettings.max) {
        end = true;
      }
    }

    //creating the score
    let scores = getAllScores(lobby);

    if (end) {
      log("Game over!");
      io.to(lobby.name).emit(GAME_WIN, scores);
    } else {
      io.to(lobby.name).emit(ROUND_WIN, {
        winningCard: winningCard,
        username: username,
        scores: scores,
        multipleWinners: multipleWinners
      });
      fn(io, lobby);
    }
  } else {
    log("roundwon User not found.");
  }
};
