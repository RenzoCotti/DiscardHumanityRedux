"use strict";

let {
  lobbies,
  log,
  RANDO_USERNAME
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


exports.getAllScores = (lobby) => {
  let scores = [];
  for (let user of lobby.userList) {
    scores.push({
      username: user.username,
      score: user.info.score
    });
  }

  if (lobby.gameSettings.rando.active) {
    scores.push({ username: RANDO_USERNAME, score: lobby.gameSettings.rando.score });
  }

  return scores.sort(compare);
};

function compare(a, b) {
  if (a.score < b.score) {
    return 1;
  }
  if (a.score > b.score) {
    return -1;
  }
  return 0;
}

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
      mode: lobby.gameSettings.tsar ? "Tsar" : "Democracy"
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


      if (lobby.gameSettings.jollyCards.active) {
        let number = lobby.gameSettings.jollyCards.number;
        for (let i = 0; i < number; i++) {
          let id = "jolly-card-" + i;
          lobby.whiteCards.push({
            content: [{ tag: "_", text: "", _id: "jolly-card-" + i + "-content" }],
            _id: id,
            jolly: true
          });
        }
      }

      log(info.name + ": decks set.");

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