"use strict";
const {
  LOBBY_LIST_UPDATE,
  USER_DISCONNECT,
  USER_KICKED
} = require("../messages");

let {
  lobbies
} = require("../internal");

const {
  log,
  getUser,
  USER_INACTIVITY_MAX_TURNS,
} = require("../internal");


exports.disconnectFromLobby = (io, lobbyName, username) => {
  log("Disconnecting " + username + " from lobby " + lobbyName);

  let toRemove = -1;
  for (let i = 0; i < lobbies.length; i++) {
    let lobby = lobbies[i];
    if (lobby.name === lobbyName) {

      let user = getUser(lobby, username);

      if (user) {
        io.to(lobbyName).emit(USER_DISCONNECT, username);
        io.to(lobbyName).emit(USER_KICKED, username);
        //force user to leave lobby
        let socket = io.sockets.sockets[user.id];
        if (socket) {
          socket.leave(lobbyName);
        }

        let index = -1;

        //remove user from userlist
        for (let j = 0; j < lobby.userList.length; j++) {
          let user = lobby.userList[j];
          if (user.username === username) {
            index = j;
          }
        }

        if (index !== -1) {
          lobby.userList.splice(index, 1);
          lobby.currentUsers--;
        }


        //if user is an admin, pick a new one
        if (lobby.gameSettings.admin === user.id) {
          if (lobby.userList.length >= 1) {
            lobby.gameSettings.admin = lobby.userList[0].id;
          } else {
            lobby.gameSettings.admin = null;
          }
        }


        //remove user info if game started
        if (lobby.gameState) {
          //game has started

          if (user.info && user.info.hand) {
            //we discard his hand
            lobby.gameState.whiteCards.used = lobby.gameState.whiteCards.used.concat(
              user.info.hand
            );
          }
        }


        if (lobby.currentUsers === 0) {
          toRemove = i;
          stopGame(lobby);
        } else if (lobby.currentUsers === 1 && lobby.state !== "deck-selection") {
          log("just one player left, disconnect too");
          stopGame(lobby);
          exports.disconnectFromLobby(io, lobbyName, lobby.userList[0].username);
        }
      }

    }
  }

  if (toRemove !== -1) {
    log("Lobby empty now, removing.");
    lobbies.splice(toRemove, 1);
    io.in("general").emit(LOBBY_LIST_UPDATE);
  }
};

function stopGame(lobby) {
  lobby.state = "deck-selection";
  if (lobby.gameState) {
    clearTimeout(lobby.gameState.turnTimeout);
    clearTimeout(lobby.gameState.tsar.tsarTimeout);
  }
}

exports.checkIfKick = (io, lobby, user) => {
  if (user.info.inactivityCounter >= USER_INACTIVITY_MAX_TURNS) {
    log("Kicking " + user.username + " for inactivity.");
    exports.disconnectFromLobby(io, lobby.name, user.username);
  } else {
    log("User " + user.username + " is inactive: " + user.info.inactivityCounter);
  }
};