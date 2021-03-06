"use strict";

let {
  lobbies,
  log,
  getLobby,
  getUser,
  lobbyExists
} = require("../internal");

const {
  LOBBY_NOT_FOUND,
  LOBBY_FULL,
  USER_CONNECT,
  LOBBY_LIST_UPDATE,
  LOBBY_JOINED,
  LOBBY_INCORRECT_CREDENTIALS,
  LOBBY_EXISTS_ALREADY,
  LOBBY_CREATED,
  DECK_SELECTION
} = require("../messages");

//logins to a new lobby
exports.loginLobby = (io, socket, info) => {
  log(info.username + " trying to login in lobby " + info.lobbyName);

  let lobby = getLobby(info.lobbyName);

  if (lobby) {
    let userJoin = false;
    if (lobby.password !== null) {
      if (info.password === lobby.password) {
        let user = getUser(lobby, info.username);

        if (user) {
          log("User " + info.username + " already joined.");
        } else {
          //user hasn't joined yet
          if (lobby.currentUsers + 1 <= lobby.maxUsers) {
            userJoin = true;
          } else {
            socket.emit(LOBBY_FULL);
            log("Lobby is full.");
          }
        }
      } else {
        socket.emit(LOBBY_INCORRECT_CREDENTIALS);
        log("Incorrect credentials.");
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
      io.in("general").emit(LOBBY_LIST_UPDATE);
      io.in(info.lobbyName).emit(USER_CONNECT, info.username);
      log("Lobby " + info.lobbyName + " joined.");
    }
  } else {
    log("Lobby not found.");
    socket.emit(LOBBY_NOT_FOUND, info.lobbyName);
  }
};


//adds name of lobby to socket for disconnect
function socketJoinLobby(socket, lobbyName, username) {
  socket.lobby = lobbyName;
  socket.username = username;
  socket.join(lobbyName);
}

//this function creates a lobby from the given info
exports.createLobby = (io, socket, info) => {
  if (lobbyExists(info.lobbyName)) {
    log("Lobby esists.");
    socket.emit(LOBBY_EXISTS_ALREADY);
  } else {
    socketJoinLobby(socket, info.lobbyName, info.username);
    let lobby = {
      name: info.lobbyName,
      password: info.password ? info.password : null,
      maxUsers: Number(info.maxUsers),
      currentUsers: 1,
      userList: [{
        username: info.username,
        id: socket.id,
      }, ],
      state: "deck-selection",
    };

    let gameSettings = {
      admin: socket.id,
      //tsar or demo
      tsar: (info.voting === "tsar" ? true : false),
      //happy, score, turns, russianroulette
      ending: {
        type: info.ending,
        max: (info.ending === "score" || info.ending === "turns" ? Number(info.points) : 0)
      },
      //he who gets voted becomes tsar
      meritocracy: (info.meritocracy === "no" ? false : true),
      //redraw hand for x points
      refreshHand: (info.redraw === "no" ? false : true),
      rando: {
        active: (info.rando === "no" ? false : true),
        score: 0,
        voted: 0,
        cardsChosen: []
      },
      //tsar can try gaining points by playing russian roulette. on survive, +1 pt. on dead, loses all points (or banned?), 1/6, 2/6 etc.
      // russianRoulette: false,
      //jolly cards, allows a user to write in sth
      jollyCards: {
        active: (info.jolly === "no" ? false : true),
        number: (info.jolly === "no" ? 0 : Number(info.jollyNumber))
      }
    };

    lobby.gameSettings = gameSettings;

    lobbies.push(lobby);
    log("Lobby " + info.lobbyName + " created.");
    io.to(lobby.gameSettings.admin).emit(LOBBY_CREATED, lobby.name);
    socket.emit(DECK_SELECTION);
    io.in("general").emit(LOBBY_LIST_UPDATE);
    // log(lobbies);
  }
};