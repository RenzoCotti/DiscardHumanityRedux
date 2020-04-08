const {
  log
} = require('./utils');

const {
  getLobby
} = require('./lobby');

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

function drawWhiteCardsAll(io, lobby, x) {
  for (let user of lobby.userList) {
    let oldHand = lobby.gameState.userHands[user.username];
    let hand = drawXCards(lobby.gameState.whiteCards, x);

    let newHand = oldHand ? oldHand.concat(hand) : hand;

    lobby.gameState.userHands[user.username] = newHand;
    io.to(user.id).emit("new-hand", newHand);
  }
}

function drawBlackCard(io, lobby) {
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

exports.getGameState = (lobbyName, socket) => {
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

function initGame(io, lobby) {
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

  drawWhiteCardsAll(io, lobby, 10);
  playTurn(io, lobby);
}

function playTurn(io, lobby) {
  drawBlackCard(io, lobby);

  if (lobby.gameState.currentBlackCard.pick === 3) {
    //pick 3 want you to draw 2s
    drawWhiteCardsAll(io, lobby, 2);
  }

  setGameState(lobby, "selecting");
}

exports.checkStart = (io, socket, lobbyName) => {
  let lobby = getLobby(lobbyName);
  if (lobby) {
    if (
      lobby.currentUsers > 1 &&
      lobby.whiteCards &&
      lobby.whiteCards.length > 0) {
      io.in(lobby.name).emit("game-start");
      initGame(io, lobby);
    }

  } else {
    socket.emit("lobby-not-found");
  }
}