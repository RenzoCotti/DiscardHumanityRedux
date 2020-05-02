"use strict";

const {
  log,
  drawWhiteCardsAll,
  drawXCards,
  playTurn,
  getLobby,
  getUser,
  shuffle,
  setGameState,
  MIN_USERS,
  getAllScores
} = require('../internal');

const {
  LOBBY_NOT_FOUND,
  GAME_START,
  USER_NOT_FOUND,
  GAME_READY,
  NOT_ENOUGH_PLAYERS,
  GAME_WIN
} = require("../messages");




// function setScore(lobby, username, value) {
//   for (let user of lobby.gameState.userState.info) {
//     if (user.username === username) {
//       user.score = value;
//     }
//   }
// }


//this funciton initialises a new user if needed
function initNewUser(socket, lobby, username) {
  let user = getUser(lobby, username);
  if (user && user.info) {
    //user already in
  } else {
    log("Init new user: " + username);
    resetDataUser(user);

    let hand = drawXCards(lobby.gameState.whiteCards, 10);
    user.info.hand = hand;
    socket.emit(GAME_READY);
  }
}



function initGame(io, lobby) {
  setGameState(lobby, "init");

  log("Initialising game...");

  lobby.gameState = {
    blackCards: {
      fresh: shuffle(lobby.blackCards),
      used: []
    },
    whiteCards: {
      fresh: shuffle(lobby.whiteCards),
      used: []
    },
    //how many users chose a card
    userChosen: 0,
    //has the user voted already? DEMO ONLY
    userVoted: 0,
    //id of tsar
    tsar: {
      //user id of the current tsar
      id: undefined,
      //at which index are we at in the tsar loop? NO MERITOCRACY
      tsarIndex: 0,
      //timeout to delete if the tsar votes
      tsarTimeout: undefined
    },
    //username of last winner
    lastRoundWinner: undefined,
    //n of turns elapsed so far
    numberOfTurns: 0,
    //timeout that allows game looping
    turnTimeout: undefined,
    paused: false,
    isGameEnding: false,

  };

  //setting all scores to 0
  for (let user of lobby.userList) {
    resetDataUser(user);
  }

  drawWhiteCardsAll(lobby, 10);
  log("Game initialised.");
  playTurn(io, lobby);
}

function resetDataUser(user) {
  user.info = {
    //cards in the hand of the user
    hand: [],
    //card combo that the user chose
    cardsChosen: [],
    //score of the user
    score: 0,
    //how many turns the user idled
    inactivityCounter: 0,
    //votes the user got DEMO ONLY
    votes: 0,
    voted: false
  };
}



//check if the user need to be initialised or not
function checkState(state) {
  // selecting (everyone is picking cards)
  // voting (tsar or demo or whatevs)
  // result
  // finished (end screen)
  // init
  // game-end
  if (state === "deck-selection" || state === "game-end") {
    return false;
  }
  //deck-selection 
  return true;
}

exports.checkStart = (io, socket, msg) => {

  let lobby = getLobby(msg.lobbyName);
  if (lobby) {

    let user = getUser(lobby, msg.username);

    if (user) {
      if (checkState(lobby.state)) {
        //game already started
        log("Game already started.");
        socket.emit(GAME_START);


        if (lobby.gameState) {
          let info = user.info;
          if (!info) {
            initNewUser(socket, lobby, msg.username);
            // socket.emit(GAME_START);
            // socket.emit(GAME_READY);
          }
        }

      } else if (lobby.state === "game-end") {

        let scores = getAllScores(lobby);

        socket.emit(GAME_WIN, {
          scores: scores
        });

      } else if (
        lobby.currentUsers >= MIN_USERS &&
        lobby.whiteCards) {

        log("Starting game...");

        //all users to game view
        io.in(lobby.name).emit(GAME_START);

        initGame(io, lobby);
      } else {
        io.in(lobby.name).emit(NOT_ENOUGH_PLAYERS);
      }
    } else {
      socket.emit(USER_NOT_FOUND);
    }


  } else {
    log("lobby 404:" + msg.lobbyName);
    log(msg.username);
    socket.emit(LOBBY_NOT_FOUND, msg.lobbyName);
  }
};