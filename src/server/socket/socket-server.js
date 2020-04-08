module.exports = function (server) {
  const io = require("socket.io").listen(server);

  const {
    createLobby,
    loginLobby,
    setDecks,
    disconnectFromLobby,
    getLobbyList,
    hasUser,
    chatMessage,
  } = require("./lobby");

  const { checkStart, getGameState } = require("./game");

  const { log } = require("./utils");

  io.on("connect", function (socket) {
    socket.join("general");

    log("user connected " + socket.id);

    //allows creation of a lobby
    socket.on("lobby-new", (info) => createLobby(io, socket, info));

    //joins a lobby
    socket.on("lobby-login", (info) => loginLobby(io, socket, info));

    //sets decks in a lobby
    socket.on("lobby-set-decks", (info) => setDecks(io, socket, info));

    socket.on("lobby-leave", (lobbyName) =>
      disconnectFromLobby(io, lobbyName, socket.username)
    );

    socket.on("lobby-get-list", () =>
      socket.emit("lobby-list", getLobbyList())
    );

    socket.on("game-check-start", (lobbyName) => checkStart(io, lobbyName));

    socket.on("lobby-has-user", (info) => hasUser(io, socket, info));

    socket.on("get-game-state", (lobbyName) => getGameState(lobbyName, socket));

    socket.on("chat-message", (message) => chatMessage(io, message));

    socket.on("disconnect", function () {
      log("user disconnected " + socket.id);

      if (socket.lobby) {
        disconnectFromLobby(socket.lobby, socket.username);
      }
    });
  });
};
