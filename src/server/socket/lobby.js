"use strict";

let {
  lobbies,
  log,
  getLobby,
  getUser
} = require("./utils");

const {
  LOBBY_NOT_FOUND,
  LOBBY_FULL,
  USER_CONNECT,
  LOBBY_LIST_UPDATE,
  LOBBY_JOINED,
  LOBBY_INCORRECT_CREDENTIALS,
  LOBBY_EXISTS_ALREADY,
  LOBBY_CREATED,
  GAME_LOUNGE,
  DECKS_SELECTED,
  USER_EXISTS,
  CHAT_MESSAGE,
  NOT_ENOUGH_CARDS
} = require("./messages");

//returns true if lobby exists
exports.lobbyExists = (lobbyName) => {
  return getLobby(lobbyName) ? true : false;
};


//logins to a new lobby
exports.loginLobby = (io, socket, info) => {
  log("trying to access lobby " + info.lobbyName);

  let lobby = getLobby(info.lobbyName);

  if (lobby) {
    let userJoin = false;
    if (lobby.password !== null) {
      if (info.password === lobby.password) {
        let user = getUser(lobby, info.username);

        if (user) {
          log("user already joined.");
        } else {
          //user hasn't joined yet
          if (lobby.currentUsers + 1 <= lobby.maxUsers) {
            userJoin = true;
          } else {
            socket.emit(LOBBY_FULL);
            log("lobby is full.");
          }
        }
      } else {
        socket.emit(LOBBY_INCORRECT_CREDENTIALS);
        log("incorrect credentials.");
      }
    } else {
      //free join
      userJoin = true;
    }

    if (userJoin) {
      socketJoinLobby(socket, info.lobbyName, info.username);
      lobby.currentUsers++;
      lobby.userList.push({
        username: info.username,
        id: socket.id,
      });

      socket.emit(LOBBY_JOINED, info.lobbyName);
      io.in(info.lobbyName).emit(USER_CONNECT, info.username);
      log("lobby joined, " + info.lobbyName);
    }
  } else {
    log("lobby not found.");
    socket.emit(LOBBY_NOT_FOUND, info.lobbyName);
  }
};

//adds name of lobby to socket for disconnect
function socketJoinLobby(socket, lobbyName, username) {
  socket.lobby = lobbyName;
  socket.username = username;
  socket.join(lobbyName);
}

//returns a list of all lobbies, without pw obv
exports.getLobbyList = () => {
  log("got all lobbies");
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

//this function creates a lobby from the given info
exports.createLobby = (io, socket, info) => {
  if (
    exports.lobbyExists(info.lobbyName)) {
    log("lobby esists.");
    socket.emit(LOBBY_EXISTS_ALREADY);
  } else {
    socketJoinLobby(socket, info.lobbyName, info.username);
    let lobby = {
      name: info.lobbyName,
      password: info.password ? info.password : null,
      maxUsers: info.maxUsers,
      currentUsers: 1,
      userList: [{
        username: info.username,
        id: socket.id,
      },],
      state: "deck-selection",
    };

    lobbies.push(lobby);
    log("lobby created: " + info.lobbyName);
    socket.emit(LOBBY_CREATED, lobby.name);
    io.in("general").emit(LOBBY_LIST_UPDATE);
  }
};

//this function sets the decks, if the cards are sufficient to support the maximum number of players
exports.setDecks = (io, socket, info) => {
  log("setting decks...");

  let lobby = getLobby(info.name);
  if (lobby) {
    if (lobby.maxUsers * 12 <= info.whiteCards.length) {
      lobby.blackCards = info.blackCards;
      lobby.whiteCards = info.whiteCards;
      log("decks set.");

      socket.emit(GAME_LOUNGE, lobby.name);
      io.in(lobby.name).emit(DECKS_SELECTED);
    } else {
      //not enough cards
      socket.emit(NOT_ENOUGH_CARDS);
    }
  }
};

exports.hasUser = (io, socket, info) => {
  let lobby = getLobby(info.lobbyName);
  if (lobby) {
    let user = getUser(lobby, info.username);
    if (user) {
      log("user exists");
      socket.emit(USER_EXISTS);
    }
  } else {
    log("lobby not found");
    socket.emit(LOBBY_NOT_FOUND, info.lobbyName);
  }
};

exports.chatMessage = (io, message) => {
  log(message.username + " says \"" + message.message + "\"");
  io.in(message.lobbyName).emit(CHAT_MESSAGE, message);
};