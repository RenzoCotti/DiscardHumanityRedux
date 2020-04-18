"use strict";

const {
  log,
  setTimeoutAndPlayTurn,
  getUser,
  getLobby,
  getUserByID,
  democracyCalculateWinner,
  roundWon
} = require("../internal");


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


    roundWon(io, lobby, msg.username, msg.winningCard, false, setTimeoutAndPlayTurn);

  } else {
    log("tsarvoted: Lobby not found.");
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