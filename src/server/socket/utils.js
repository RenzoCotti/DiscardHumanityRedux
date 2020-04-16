const {
  LOBBY_LIST_UPDATE,
  USER_DISCONNECT,
  GAME_LOUNGE,
  GAME_READY
} = require("./messages");



exports.lobbies = [];
exports.shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

var debug = true;

/*SOME FUNCTIONS REQUIRED BY BOTH FILES c: */


exports.log = (message) => {
  if (debug) {
    console.log(message);
  }
}

//returns a lobby given a name
exports.getLobby = (name) => {
  for (let lobby of exports.lobbies) {
    if (lobby.name === name) return lobby;
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
}


//returns a user in the given lobby that matches username
exports.getUserByID = (lobby, id) => {
  for (let user of lobby.userList) {
    if (id === user.id) {
      return user;
    }
  }
  return false;
}

exports.disconnectFromLobby = (io, lobbyName, username) => {
  exports.log("disconnecting user " + username + " from " + lobbyName);

  let toRemove = -1;
  for (let i = 0; i < exports.lobbies.length; i++) {
    let lobby = exports.lobbies[i];
    if (lobby.name === lobbyName) {
      let user = exports.getUser(lobby, username);
      if (!user) return;

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
        stopGame(lobby)
      } else if (lobby.currentUsers === 1) {
        //tolobby
        // lobby.state = "deck-selection"
        stopGame(lobby)
        io.to(lobby.name).emit(GAME_LOUNGE);
      }
    }
  }

  if (toRemove !== -1) {
    exports.log("lobby empty now, removing.");
    exports.lobbies.splice(toRemove, 1);
    io.in("general").emit(LOBBY_LIST_UPDATE);
  }
}

function stopGame(lobby) {
  lobby.state = "deck-selection";
  if (lobby.gameState) {
    clearTimeout(lobby.gameState.turnTimeout);
    clearTimeout(lobby.gameState.tsarTimeout);
  }
}