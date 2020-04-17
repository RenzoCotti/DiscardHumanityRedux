"use strict";

let {
  lobbies,
  log
} = require("../internal");

const {
  LOBBY_NOT_FOUND,
  GAME_LOUNGE,
  DECKS_SELECTED,
  CHAT_MESSAGE,
  NOT_ENOUGH_CARDS,
  USER_EXISTS
} = require("../messages");


//returns a lobby given a name
exports.getLobby = (name) => {
  for (let lobby of lobbies) {
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

//returns true if lobby exists
exports.lobbyExists = (lobbyName) => {
  return exports.getLobby(lobbyName) ? true : false;
};

//checks if the lobby has the user
exports.hasUser = (io, socket, info) => {
  let lobby = exports.getLobby(info.lobbyName);
  if (lobby) {
    let user = exports.getUser(lobby, info.username);
    if (user) {
      log("User " + info.username + " exists already.");
      socket.emit(USER_EXISTS);
    }
  } else {
    log("Hasuser, Lobby not found: " + info.lobbyName);
    socket.emit(LOBBY_NOT_FOUND, info.lobbyName);
  }
};



//returns a list of all lobbies, without pw obv
exports.getLobbyList = () => {
  log("Retrieved lobby list.");
  let temp = [];
  for (let lobby of lobbies) {
    let tempLobby = {
      name: lobby.name,
      maxUsers: lobby.maxUsers,
      currentUsers: lobby.currentUsers,
    };

    if (lobby.password !== null) {
      tempLobby.password = true;
    }
    temp.push(tempLobby);
  }
  return temp;
};


//this function sets the decks, if the cards are sufficient to support the maximum number of players
exports.setDecks = (io, socket, info) => {
  log("Setting decks in lobby " + info.name);

  let lobby = exports.getLobby(info.name);
  if (lobby) {
    if (lobby.maxUsers * 12 <= info.whiteCards.length) {
      lobby.blackCards = info.blackCards;
      lobby.whiteCards = info.whiteCards;
      log("Decks set.");

      socket.emit(GAME_LOUNGE, lobby.name);
      io.in(lobby.name).emit(DECKS_SELECTED);
    } else {
      //not enough cards
      log("Not enough cards chosen.");
      socket.emit(NOT_ENOUGH_CARDS);
    }
  }
};



exports.chatMessage = (io, message) => {
  log(message.username + " says \"" + message.message + "\"");
  io.in(message.lobbyName).emit(CHAT_MESSAGE, message);
};