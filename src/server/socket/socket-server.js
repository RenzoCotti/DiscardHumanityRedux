"use strict";

module.exports = function (server) {
  const io = require("socket.io").listen(server);

  const {
    createLobby,
    loginLobby,
    setDecks,
    getLobbyList,
    chatMessage,
  } = require("./lobby/lobby");

  const {
    checkStart,
    getGameState
  } = require("./game/initGame");

  const {
    tsarVoted
  } = require("./voting/voteCards");


  const {
    handleChoice
  } = require("./voting/choice");

  const {
    log,
    hasUser,
  } = require("./utils");

  const {
    disconnectFromLobby
  } = require("./lobby/disconnect");

  const {
    LOBBY_NEW,
    LOBBY_LOGIN,
    SET_DECKS,
    LOBBY_LEAVE,
    LOBBY_GET_LIST,
    LOBBY_LIST,
    LOBBY_HAS_USER,
    SEND_CHAT_MESSAGE,
    CHECK_START,
    GAME_STATE,
    CHOICE,
    TSAR_VOTE
  } = require("./messages");

  io.on("connect", function (socket) {
    socket.join("general");

    log("user connected " + socket.id);

    /*LOBBY */

    //allows creation of a lobby
    socket.on(LOBBY_NEW, (info) => createLobby(io, socket, info));

    //joins a lobby
    socket.on(LOBBY_LOGIN, (info) => loginLobby(io, socket, info));

    //sets decks in a lobby
    socket.on(SET_DECKS, (info) => setDecks(io, socket, info));

    socket.on(LOBBY_LEAVE, (msg) =>
      disconnectFromLobby(io, msg.lobbyName, msg.username)
    );

    socket.on(LOBBY_GET_LIST, () =>
      socket.emit(LOBBY_LIST, getLobbyList())
    );

    socket.on(LOBBY_HAS_USER, (info) => hasUser(io, socket, info));

    /*CHAT */

    socket.on(SEND_CHAT_MESSAGE, (message) => chatMessage(io, message));


    /*GAME */

    //checks if you can start the game
    socket.on(CHECK_START, (msg) => checkStart(io, socket, msg));

    socket.on(GAME_STATE, (msg) => getGameState(socket, msg));

    socket.on(CHOICE, (msg) => handleChoice(io, socket, msg));

    socket.on(TSAR_VOTE, (msg) => tsarVoted(io, msg));


    socket.on("disconnect", () => {
      log("user disconnected " + socket.id);

      if (socket.lobby) {
        disconnectFromLobby(io, socket.lobby, socket.username);
      }
    });
  });
};