"use strict";

const {
  log,
  drawWhiteCardsAll,
  drawXCards,
  playTurn,
  getLobby,
  getUser,
  shuffle,
  setGameState
} = require('../internal');

const {
  LOBBY_NOT_FOUND,
  GAME_START,
  USER_NOT_FOUND,
} = require("../messages");




// function setScore(lobby, username, value) {
//   for (let user of lobby.gameState.userState.info) {
//     if (user.username === username) {
//       user.score = value;
//     }
//   }
// }


//this funciton initialises a new user if needed
function initNewUser(lobby, username) {
  let user = getUser(lobby, username);
  if (user && user.info) {
    //user already in
  } else {
    log("Init new user: " + username);
    let hand = drawXCards(lobby.gameState.whiteCards, 10);
    user.info = {
      hand: hand,
      cardsChosen: [],
      score: 0
    };
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

  // console.log(lobby.gameSettings);


  // lobby.gameSettings = {
  //   //tsar or demo
  //   tsar: false,
  //   //extra card TODO decide to keep or not
  //   gambling: false,
  //   //happy, score, turns, russianroulette
  //   ending: {
  //     type: "score",
  //     max: 20
  //   },
  //   //he who gets voted becomes tsar
  //   meritocracy: false,
  //   //tsar can try gaining points by playing russian roulette. on survive, +1 pt. on dead, loses all points (or banned?), 1/6, 2/6 etc.
  //   russianRoulette: false,
  //   //discard cards for points
  //   refreshHand: false,
  //   //rando c;
  //   randoCardissian: false,
  //   //jolly cards, allows a user to write in sth
  //   jollyCards: {
  //     active: false,
  //     number: 0
  //   }
  // };

  drawWhiteCardsAll(lobby, 10);
  log("Game initialised.");
  playTurn(io, lobby);
}




//check if the user need to be initialised or not
function checkState(state) {
  // selecting (everyone is picking cards)
  // voting (tsar or demo or whatevs)
  // result
  // finished (end screen)
  // init
  if (state === "selecting" || state === "voting" || state === "result" || state === "end" || state === "init") { return true; }
  //deck-selection 
  return false;
}

exports.checkStart = (io, socket, msg) => {

  let lobby = getLobby(msg.lobbyName);
  if (lobby) {

    let user = getUser(lobby, msg.username);

    if (user) {
      if (checkState(lobby.state)) {
        //game already started
        log("Game already started.");

        if (lobby.gameState) {
          let info = user.info;
          if (!info) {
            initNewUser(lobby, msg.username);
            socket.emit(GAME_START);
            // socket.emit(GAME_READY);
          }
        }

      } else if (
        lobby.currentUsers > 1 &&
        lobby.whiteCards) {

        log("Starting game...");

        //all users to game view
        io.in(lobby.name).emit(GAME_START);

        initGame(io, lobby);
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


