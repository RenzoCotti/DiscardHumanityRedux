"use strict";

const {
  USER_EXISTS,
  LOBBY_NOT_FOUND
} = require("./messages");


exports.TSAR_VOTE_TIMEOUT = 20000;
exports.USER_CHOICE_TIMEOUT = 20000;
exports.RESULT_TIMEOUT = 5000;
exports.USER_INACTIVITY_MAX_TURNS = 3;

exports.lobbies = [];
exports.shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const debug = true;

/*SOME FUNCTIONS REQUIRED BY BOTH FILES c: */


exports.log = (message) => {
  if (debug) {
    console.log(message);
  }
};

//returns a lobby given a name
exports.getLobby = (name) => {
  for (let lobby of exports.lobbies) {
    if (lobby.name === name) {
      return lobby;
    }
  }
  return false;
};

//returns a user in the given lobby that matches username
exports.getUser = (lobby, username) => {
  for (let user of lobby.userList) {
    if (username === user.username) {
      return user;
    }
  }
  return false;
};


//returns a user in the given lobby that matches username
exports.getUserByID = (lobby, id) => {
  for (let user of lobby.userList) {
    if (id === user.id) {
      return user;
    }
  }
  return false;
};


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




//this function picks a new tsar in case it's necessary
//in case meritocracy, tsar is last winner
exports.pickNewTsar = (lobby) => {
  let tsar = lobby.gameState.tsar;
  //new tsar is last round winner
  if (lobby.gameSettings.meritocracy) {
    if (lobby.gameSettings.lastRoundWinner) {
      let user = exports.getUser(lobby, lobby.gameSettings.lastRoundWinner);
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
    exports.log("new tsar " + lobby.userList[tsar.tsarIndex].username);
  }
  //else democracy mode
};




exports.getAllScores = (lobby) => {
  let scores = [];
  for (let user of lobby.userList) {
    scores.push({
      username: user.username,
      score: user.info.score
    });
  }

  return scores;
};

exports.hasUser = (io, socket, info) => {
  let lobby = exports.getLobby(info.lobbyName);
  if (lobby) {
    let user = exports.getUser(lobby, info.username);
    if (user) {
      exports.log("user exists");
      socket.emit(USER_EXISTS);
    }
  } else {
    exports.log("lobby not found");
    socket.emit(LOBBY_NOT_FOUND, info.lobbyName);
  }
};