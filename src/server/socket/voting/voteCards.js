"use strict";

const {
  ROUND_WIN,
  GAME_WIN,
} = require("../messages");

const {
  log,
  setTimeoutAndPlayTurn,
  getUser,
  getLobby,
  getUserByID,
  getAllScores,
  democracyCalculateWinner
} = require("../internal");



function modifyScore(lobby, username, amount) {
  for (let user of lobby.userList) {
    if (user.username === username) {
      user.info.score += amount;
    }
  }
}

//the tsar has voted, send all clients the info for the result screen
exports.tsarVoted = (io, msg) => {
  log("Tsar has voted.");

  let lobby = getLobby(msg.lobbyName);

  if (lobby) {

    if (lobby.gameSettings.tsar) {

      clearTimeout(lobby.gameState.tsar.tsarTimeout);

      let tsarUser = getUserByID(lobby, lobby.gameState.tsar.id);

      if (tsarUser) {
        tsarUser.info.inactivityCounter = 0;
      }
    }


    exports.roundWon(io, lobby, msg.username, msg.winningCard, false);

  } else {
    log("tsarvoted: Lobby not found.");
  }
};





exports.roundWon = (io, lobby, username, winningCard, multipleWinners) => {
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
      setTimeoutAndPlayTurn(io, lobby);
    }
  } else {
    log("roundwon User not found.");
  }
};


//function that handles a democracy vote
exports.userDemocracyVote = (io, msg) => {

  let lobby = getLobby(msg.lobbyName);

  if (lobby) {
    log("User " + msg.username + " has voted for " + msg.votedUsername);

    let votedUserInfo = getUser(lobby, msg.votedUsername).info;
    let userInfo = getUser(lobby, msg.username).info;


    //if the user exists and it hasn't voted and the user voted is valid
    if (userInfo && !userInfo.voted && votedUserInfo) {
      votedUserInfo.votes++;
      lobby.gameState.userVoted++;
      userInfo.voted = true;
      userInfo.inactivityCounter = 0;

      log(lobby.gameState.userVoted + "/" + lobby.userList.length + " users voted.");
      //if over threshold, roundwon + check for ending

      if (lobby.gameState.userVoted === lobby.userList.length) {
        democracyCalculateWinner(io, lobby, setTimeoutAndPlayTurn);
      }

    } else {
      log("User already sent his vote.");
    }
  }
  else {
    log("lobby not found");
  }
};