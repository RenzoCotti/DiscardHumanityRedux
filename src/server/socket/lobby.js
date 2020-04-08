var {
  lobbies,
  log
} = require("./utils");

exports.getLobby = (name) => {
  for (let lobby of lobbies) {
    if (lobby.name === name) return lobby;
  }
  return false;
};

function getUser(lobby, username) {
  for (let user of lobby.userList) {
    if (username === user.username) {
      return user;
    }
  }
  return false;
}

exports.lobbyExists = (lobbyName) => {
  return exports.getLobby(lobbyName) ? true : false;
};

exports.disconnectFromLobby = (io, lobbyName, username) => {
  log("disconnecting from " + lobbyName);

  let toRemove = -1;
  for (let i = 0; i < lobbies.length; i++) {
    let lobby = lobbies[i];
    if (lobby.name === lobbyName) {
      io.to(lobbyName).emit("user-disconnect", username);
      lobby.currentUsers--;
      let index;

      //remove user from userlist
      for (let j = 0; j < lobby.userList.length; j++) {
        let user = lobby.userList[j];
        if (user === username) {
          index = j;
        }
      }
      lobby.userList.splice(index, 1);

      if (lobby.currentUsers === 0) {
        toRemove = i;
      }
    }
  }

  if (toRemove !== -1) {
    log("lobby empty now, removing.");
    lobbies.splice(toRemove, 1);
  }
};

//logins to a new lobby
exports.loginLobby = (io, socket, info) => {
  log("trying to access lobby " + info.lobbyName);

  let lobby = exports.getLobby(info.lobbyName);

  if (lobby) {
    if (info.password === lobby.password) {
      let alreadyJoined = false;
      // log(lobby.userList);
      let user = getUser(lobby, info.username);

      if (user) {
        log("user already joined.");
      } else {
        if (lobby.currentUsers + 1 <= lobby.maxUsers) {
          socketJoinLobby(socket, info.lobbyName, info.username);
          lobby.currentUsers++;
          lobby.userList.push({
            username: info.username,
            id: socket.id,
          });

          socket.emit("lobby-joined", info.lobbyName);
          io.in(info.lobbyName).emit("user-connect", info.username);
          log("lobby joined, " + info.lobbyName);
        } else {
          socket.emit("lobby-full");
          log("lobby is full.");
        }
      }
    } else {
      socket.emit("lobby-incorrect-credentials");
      log("incorrect credentials.");
    }
  } else {
    log("lobby not found.");
    socket.emit("lobby-not-found");
  }
};

//adds name of lobby to socket for disconnect
function socketJoinLobby(socket, lobbyName, username) {
  socket.lobby = lobbyName;
  socket.username = username;
  socket.join(lobbyName);
}

exports.getLobbyList = () => {
  log("got all lobbies");
  let temp = [];
  for (let lobby of lobbies) {
    let tempLobby = {
      name: lobby.name,
      maxUsers: lobby.maxUsers,
      currentUsers: lobby.currentUsers,
    };

    if (lobby.password) {
      tempLobby.password = true;
    }
    temp.push(tempLobby);
  }
  return temp;
};

exports.createLobby = (io, socket, info) => {
  if (exports.lobbyExists(info.lobbyName)) {
    log("lobby esists.");
    socket.emit("lobby-exists-already");
  } else {
    socketJoinLobby(socket, info.lobbyName, info.username);
    let lobby = {
      name: info.lobbyName,
      password: info.password,
      maxUsers: info.maxUsers,
      currentUsers: 1,
      userList: [{
        username: info.username,
        id: socket.id,
      }, ],
      state: "deck-selection",
    };

    lobbies.push(lobby);
    log("lobby created: " + info.lobbyName);
    socket.emit("lobby-created", lobby.name);
    io.in("general").emit("lobby-update");
  }
};

exports.setDecks = (io, socket, info) => {
  log("setting decks...");

  let lobby = exports.getLobby(info.name);
  if (lobby) {
    lobby.blackCards = info.blackCards;
    lobby.whiteCards = info.whiteCards;
    log("decks set.");

    socket.emit("game-lounge", lobby.name);
    io.in(lobby.name).emit("lobby-decks-selected");
  }
};

exports.hasUser = (io, socket, info) => {
  let lobby = exports.getLobby(info.lobbyName);
  if (lobby) {
    let user = getUser(lobby, info.username);
    if (user) {
      socket.emit("user-exists");
    }
  }
};

exports.chatMessage = (io, message) => {
  log(message.username + ' says "' + message.message + '"')
  io.in(message.lobbyName).emit("chat-message-new", message);
};