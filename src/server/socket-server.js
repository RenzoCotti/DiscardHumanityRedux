module.exports = function(httpServer) {
  const io = require("socket.io").listen(httpServer);

  var lobbies = [];
  var debug = true;

  function lobbyExists(lobbyName) {
    for (let lobby of lobbies) {
      if (lobby.name === lobbyName) {
        return true;
      }
    }
    return false;
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
    if (lobbyExists(info.lobbyName)) {
      for (let lobby of lobbies) {
        if (info.lobbyName === lobby.name) {
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
        }
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
      socket.emit("lobby-created", info.lobbyName);
      io.in("general").emit("lobby-update");
    }
  }

  function setDecks(socket, info) {
    log("setting decks...");
    for (let lobby of lobbies) {
      if (lobby.name === info.name) {
        lobby.blackCards = info.blackCards;
        lobby.whiteCards = info.whiteCards;
        log("decks set.");

        socket.emit("game-lounge", lobby.name);
        io.in(lobby.name).emit("deck-set");
        break;
      }
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
      let hand = drawXCards(lobby.gameState.whiteCards, x);
      lobby.gameState.userHands.push({
        [user.id]: hand
      });
      io.to(user.id).emit("new-hand", hand);
    }
  }

  function drawBlackCard(lobby) {
    lobby.gameState.currentBlackCard = drawXCards(
      lobby.gameState.blackCards,
      1
    )[0];
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
      userHands: []
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
    for (let lobby of lobbies) {
      if (lobbyName === lobby.name) {
        if (
          lobby.currentUsers > 1 &&
          lobby.whiteCards &&
          lobby.whiteCards.length > 0
        ) {
          io.in(lobby.name).emit("start-game");
          initGame(lobby);
        }
      }
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

    socket.on("lobby-leave", function(info) {
      disconnectFromLobby(info.lobbyName, socket.username);
    });

    socket.on("lobby-get-list", () => {
      socket.emit("lobby-list", getLobbyList());
    });

    socket.on("check-start", lobbyName => {
      checkStart(lobbyName);
    });

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
