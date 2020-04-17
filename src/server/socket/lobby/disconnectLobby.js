"use strict";
const {
  LOBBY_LIST_UPDATE,
  USER_DISCONNECT,
  GAME_LOUNGE,
  GAME_READY,
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
      if (!user) { return; }

      io.to(lobbyName).emit(USER_DISCONNECT, username);

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
      }

      lobby.currentUsers--;

      //remove user info if game started

      if (lobby.state) {
        //game has started

        if (user.info && user.info.hand) {
          //we discard his hand
          lobby.gameState.whiteCards.used = lobby.gameState.whiteCards.used.concat(
            user.info.hand
          );
        }
        //sync clients
        io.to(lobby.name).emit(GAME_READY);
      }


      if (lobby.currentUsers === 0) {
        toRemove = i;
        stopGame(lobby);
      } else if (lobby.currentUsers === 1) {
        //tolobby
        // lobby.state = "deck-selection"
        stopGame(lobby);
        io.to(lobby.name).emit(GAME_LOUNGE);
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