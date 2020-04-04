module.exports = function(server) {
  const io = require("socket.io").listen(server);

  var lobbies = [];
  var debug = true;

  function getLobby(name) {
    for (let lobby of lobbies) {
      if (lobby.name === name) return lobby;
    }
    return false;
  }

  function lobbyExists(lobbyName) {
    return getLobby(lobbyName) ? true : false;
  }

  function log(message) {
    if (debug) {
      console.log(message);
    }
  }

  function disconnectFromLobby(lobbyName, username) {
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
  }

  //logins to a new lobby
  function loginLobby(socket, info) {
    log("trying to access lobby " + info.lobbyName);

    let lobby = getLobby(info.lobbyName);

    if (lobby) {
      if (info.password === lobby.password) {
        let alreadyJoined = false;
        // log(lobby.userList);
        for (let user of lobby.userList) {
          if (user === info.username) {
            //user has already joined, assume reconnect
            alreadyJoined = true;
          }
        }

        if (alreadyJoined) {
          log("user already joined.");
        } else {
          if (lobby.currentUsers + 1 <= lobby.maxUsers) {
            socketJoinLobby(socket, info.lobbyName, info.username);
            lobby.currentUsers++;
            lobby.userList.push({ username: info.username, id: socket.id });

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
  }

  //adds name of lobby to socket for disconnect
  function socketJoinLobby(socket, lobbyName, username) {
    socket.lobby = lobbyName;
    socket.username = username;
    socket.join(lobbyName);
  }

  function getLobbyList() {
    log("got all lobbies");
    let temp = [];
    for (let lobby of lobbies) {
      let tempLobby = {
        name: lobby.name,
        maxUsers: lobby.maxUsers,
        currentUsers: lobby.currentUsers
      };

      if (lobby.password) {
        tempLobby.password = true;
      }
      temp.push(tempLobby);
    }
    return temp;
  }

  function createLobby(socket, info) {
    if (lobbyExists(info.lobbyName)) {
      log("lobby esists.");
      socket.emit("lobby-exists-already");
    } else {
      socketJoinLobby(socket, info.lobbyName, info.username);
      let lobby = {
        name: info.lobbyName,
        password: info.password,
        maxUsers: info.maxUsers,
        currentUsers: 1,
        userList: [{ username: info.username, id: socket.id }],
        state: "deck-selection"
      };

      lobbies.push(lobby);
      log("lobby created: " + info.lobbyName);
      socket.emit("lobby-created", lobby.name);
      io.in("general").emit("lobby-update");
    }
  }

  function setDecks(socket, info) {
    log("setting decks...");

    let lobby = getLobby(info.name);
    if (lobby) {
      lobby.blackCards = info.blackCards;
      lobby.whiteCards = info.whiteCards;
      log("decks set.");

      socket.emit("game-lounge", lobby.name);
      io.in(lobby.name).emit("deck-set");
    }
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function drawXCards(array, x) {
    if (array.fresh.length + array.used.length < x) {
      return [];
    }

    if (array.fresh.length < x) {
      array.fresh = array.fresh.concat(array.used);
    }

    let temp = [];
    for (let i = 0; i < x; i++) {
      let card = array.fresh.splice(0, 1)[0];
      array.used.push(card);
      temp.push(card);
    }
    return temp;
  }

  function drawWhiteCardsAll(lobby, x) {
    for (let user of lobby.userList) {
      let oldHand = lobby.gameState.userHands[user.username];
      let hand = drawXCards(lobby.gameState.whiteCards, x);

      let newHand = oldHand ? oldHand.concat(hand) : hand;

      lobby.gameState.userHands[user.username] = newHand;
      io.to(user.id).emit("new-hand", newHand);
    }
  }

  function drawBlackCard(lobby) {
    lobby.gameState.currentBlackCard = drawXCards(
      lobby.gameState.blackCards,
      1
    )[0];
    while (lobby.gameState.currentBlackCard.pick < 3) {
      lobby.gameState.currentBlackCard = drawXCards(
        lobby.gameState.blackCards,
        1
      )[0];
    }

    io.in(lobby.name).emit("new-black-card", lobby.gameState.currentBlackCard);
  }

  function setGameState(lobby, status) {
    /*
      deck-selection
      init (setting up game, drawing cards for everyone)
      selecting (everyone is picking cards)
      voting (tsar or demo or whatevs)
      finished (end screen)
    */

    lobby.state = status;
  }

  function getGameState(lobbyName, socket) {
    log("getting game state...");
    let lobby = getLobby(lobbyName);
    if (lobby) {
      log("getting game state...");

      socket.emit("new-hand", lobby.gameState.userHands[socket.username]);
      socket.emit("new-black-card", lobby.gameState.currentBlackCard);
    } else {
      log("lobby not found");
    }
  }

  function initGame(lobby) {
    setGameState(lobby, "init");

    let gameState = {
      blackCards: {
        fresh: shuffle(lobby.blackCards),
        used: []
      },
      whiteCards: {
        fresh: shuffle(lobby.whiteCards),
        used: []
      },
      userHands: {}
    };
    lobby.gameState = gameState;

    drawWhiteCardsAll(lobby, 10);
    playTurn(lobby);
  }

  function playTurn(lobby) {
    drawBlackCard(lobby);

    if (lobby.gameState.currentBlackCard.pick === 3) {
      //pick 3 want you to draw 2s
      drawWhiteCardsAll(lobby, 2);
    }

    setGameState(lobby, "selecting");
  }

  function checkStart(lobbyName) {
    let lobby = getLobby(lobbyName);
    if (
      lobby &&
      lobby.currentUsers > 1 &&
      lobby.whiteCards &&
      lobby.whiteCards.length > 0
    ) {
      io.in(lobby.name).emit("start-game");
      initGame(lobby);
    }
  }

  io.on("connect", function(socket) {
    socket.join("general");

    log("user connected " + socket.id);
    // socket.emit("ping");

    //allows creation of a lobby
    socket.on("lobby-new", info => createLobby(socket, info));

    //joins a lobby
    socket.on("lobby-login", info => loginLobby(socket, info));

    //sets decks in a lobby
    socket.on("set-decks", info => setDecks(socket, info));

    socket.on("lobby-leave", info =>
      disconnectFromLobby(info.lobbyName, socket.username)
    );

    socket.on("lobby-get-list", () =>
      socket.emit("lobby-list", getLobbyList())
    );

    socket.on("check-start", lobbyName => checkStart(lobbyName));
    socket.on("check-lobby", lobbyName => {
      let lobby = getLobby(lobbyName);
      if (!lobby) {
        socket.emit("lobby-not-found");
      }
    });

    socket.on("get-game-state", lobbyName => getGameState(lobbyName, socket));

    socket.on("chat-message", function(message) {
      log(message.username + " says '" + message.message + "'");
      io.in(message.lobbyName).emit("chat-message-new", message);
    });

    socket.on("disconnect", function() {
      log("user disconnected " + socket.id);

      if (socket.lobby) {
        disconnectFromLobby(socket.lobby, socket.username);
      }
    });
  });
};
