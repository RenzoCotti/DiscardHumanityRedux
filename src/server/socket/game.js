const {
  log
} = require('./utils');

const {
  getLobby
} = require('./lobby');

const {
  NEW_HAND,
  NEW_BLACK_CARD,
  NEW_TSAR,
  TSAR_VOTING,
  LOBBY_NOT_FOUND,
  GAME_START,
  CHOICE_RECEIVED
} = require("./messages");

if (!(NEW_HAND &&
    NEW_BLACK_CARD &&
    NEW_TSAR &&
    TSAR_VOTING &&
    TSAR_VOTING &&
    LOBBY_NOT_FOUND &&
    GAME_START &&
    CHOICE_RECEIVED)) {
  throw "Ayyyy los mesagios est undefined"
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

function drawWhiteCardsAll(io, lobby, x) {
  for (let user of lobby.userList) {
    let oldHand = lobby.gameState.userState.userHands[user.username];
    let hand = drawXCards(lobby.gameState.whiteCards, x);

    let newHand = oldHand ? oldHand.concat(hand) : hand;

    lobby.gameState.userState.userHands[user.username] = newHand;
    io.to(user.id).emit(NEW_HAND, newHand);
  }
}

function drawBlackCard(io, lobby) {
  let blackCard = drawXCards(
    lobby.gameState.blackCards,
    1
  )[0];

  lobby.gameState.currentBlackCard = blackCard;

  while (lobby.gameState.currentBlackCard.pick < 3) {
    blackCard = drawXCards(
      lobby.gameState.blackCards,
      1
    )[0];



    lobby.gameState.currentBlackCard = blackCard;
  }

  io.in(lobby.name).emit(NEW_BLACK_CARD, lobby.gameState.currentBlackCard);
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
  let lobby = getLobby(lobbyName);
  if (lobby) {
    log("getting game state...");

    socket.emit(NEW_HAND, lobby.gameState.userState.userHands[socket.username]);
    socket.emit(NEW_BLACK_CARD, lobby.gameState.currentBlackCard);
  } else {
    log("lobby not found");
  }
}

function initGame(io, lobby) {
  setGameState(lobby, "init");

  lobby.gameState = {
    blackCards: {
      fresh: shuffle(lobby.blackCards),
      used: []
    },
    whiteCards: {
      fresh: shuffle(lobby.whiteCards),
      used: []
    },
    userState: {
      userHands: {},
      userChoices: [],
      chosen: 0
    },
    //id of tsar
    tsar: undefined,
    tsarIndex: 0,
    //id of last winner
    lastRoundWinner: undefined,

  };


  lobby.gameSettings = {
    //tsar or demo
    tsar: true,
    gambling: false,
    //happy ending, score, n. hands, russian roulette
    ending: "score",
    //he who gets voted becomes tsar
    meritocracy: false,
    //tsar can try gaining points by playing russian roulette. on survive, +1 pt. on dead, loses all points (or banned?), 1/6, 2/6 etc.
    russianRoulette: false,
    //discard cards for points
    refreshHand: false,
    //rando c;
    randoCardissian: false
  }

  drawWhiteCardsAll(io, lobby, 10);
  playTurn(io, lobby);
}

function pickNewTsar(io, lobby) {

  if (lobby.gameSettings.tsar) {
    let tsar = lobby.gameState.tsar;
    if (lobby.gameSettings.meritocracy) {
      //new tsar is last round winner
      tsar = lobby.gameState.lastRoundWinner;
    } else {
      let tsarIndex = lobby.gameState.tsarIndex;
      //everybody tsar'd once at least, we loop
      if (lobby.gameState.tsarIndex + 1 === lobby.userList.length) {
        lobby.gameState.tsarIndex = 0;
      } else {
        lobby.gameState.tsarIndex++;
      }

      //set the tsar id
      tsar = lobby.userList[tsarIndex].id;
    }

    io.to(tsar).emit(NEW_TSAR);
  }
  //else democracy mode
}

function playTurn(io, lobby) {
  pickNewTsar(io, lobby);

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
    if (lobby.state === "init" || lobby.state === "selecting") {
      //game already started
    } else if (
      lobby.currentUsers > 1 &&
      lobby.whiteCards &&
      lobby.whiteCards.length > 0) {

      console.log("game starting...")
      io.in(lobby.name).emit(GAME_START);
      initGame(io, lobby);
    }

  } else {
    socket.emit(LOBBY_NOT_FOUND);
  }
}

exports.handleChoice = (io, socket, msg) => {
  log("received choice")
  let lobby = getLobby(msg.lobbyName);
  if (lobby) {
    let userChoices = lobby.gameState.userState.userChoices;

    let found = false;
    for (let choice of userChoices) {
      if (choice.id === socket.id) found = true;
    }

    if (!found) {
      //hasnt already voted
      userChoices.push({
        id: socket.id,
        choice: msg.choice
      });


      //a literal, not a ref
      lobby.gameState.userState.chosen++;

      if (lobby.gameState.userState.chosen === lobby.userList.length - 1) {
        //everybody chose, except tsar
        if (lobby.gameSettings.tsar) {
          log("tsar is now voting");

          setGameState(lobby, "tsar voting")
          io.in(msg.lobbyName).emit(TSAR_VOTING, userChoices);
        } else {
          log("democracy is now voting");
          //democracy
        }
      } else {
        log(socket.username + " sent his cards")
        socket.emit(CHOICE_RECEIVED);
      }
    } else {
      log("user already sent his cards.")
    }
  } else {
    log("lobby not found: " + msg.lobbyName)
  }
}

exports.tsarVoted = (io, socket, msg) => {
  //card voted
  //need to send everybody at the win screen momentarily
  //winner of the round, username & 
}