"use strict";

const {
  log,
  getLobby,
  getUser,
  setGameState,
  playTurn,
  sendCardsToVote
} = require('./utils');

const {
  NEW_HAND,
  NEW_BLACK_CARD,
  LOBBY_NOT_FOUND,
  GAME_START,
  CHOICE_RECEIVED,
  IS_TSAR,
  GAME_READY,
  USER_NOT_FOUND,
} = require("./messages");


const {
  drawWhiteCardsAll,
  drawXCards
} = require("./drawing");




//used to randomly shuffle an array
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}





// function setScore(lobby, username, value) {
//   for (let user of lobby.gameState.userState.info) {
//     if (user.username === username) {
//       user.score = value;
//     }
//   }
// }


function initNewUser(lobby, username) {
  let user = getUser(lobby, username);
  if (user && user.info) {
    //user already in
  } else {
    let hand = drawXCards(lobby.gameState.whiteCards, 10);
    user.info = {
      hand: hand,
      cardsChosen: [],
      score: 0
    };
  }
}




exports.getGameState = (socket, msg) => {
  let lobby = getLobby(msg.lobbyName);
  // log(msg)
  if (lobby) {
    let user = getUser(lobby, msg.username);
    if (user) {
      log("getting game state for user " + msg.username);

      if (user.info && user.info.hand) {
        socket.emit(NEW_HAND, user.info.hand);
      }
      socket.emit(NEW_BLACK_CARD, lobby.gameState.currentBlackCard);
      socket.emit(IS_TSAR, lobby.gameState.tsar.id === socket.id);
    } else {
      log("user " + msg.username + " not found.");
    }
    //else user isn't there


  } else {
    log("lobby not found");
  }
};


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
    userChosen: 0,
    //id of tsar
    tsar: {
      id: undefined,
      tsarIndex: 0,
      tsarTimeout: undefined
    },
    //username of last winner
    lastRoundWinner: undefined,
    numberOfTurns: 0,
    turnTimeout: undefined

  };

  //setting all scores to 0
  for (let user of lobby.userList) {
    user.info = {
      hand: [],
      cardsChosen: [],
      score: 0,
      inactivityCounter: 0,
      votes: 0,
      voted: false
    };
  }


  lobby.gameSettings = {
    //tsar or demo
    tsar: true,
    gambling: false,
    //happy, score, turns, russianroulette
    ending: {
      type: "score",
      max: 20
    },
    //he who gets voted becomes tsar
    meritocracy: false,
    //tsar can try gaining points by playing russian roulette. on survive, +1 pt. on dead, loses all points (or banned?), 1/6, 2/6 etc.
    russianRoulette: false,
    //discard cards for points
    refreshHand: false,
    //rando c;
    randoCardissian: false,
    jollyCards: {
      active: false,
      number: 0
    }
  };

  drawWhiteCardsAll(lobby, 10);
  playTurn(io, lobby);
}





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
        log("game already started");

        if (lobby.gameState) {
          let info = user.info;
          if (!info) {
            initNewUser(lobby, msg.username);
            socket.emit(GAME_START);
            socket.emit(GAME_READY);
          }
        }

      } else if (
        lobby.currentUsers > 1 &&
        lobby.whiteCards &&
        lobby.whiteCards.length > 0) {

        log("game starting...");

        io.in(lobby.name).emit(GAME_START);

        initGame(io, lobby);

      }
    } else {
      socket.emit(USER_NOT_FOUND);
    }


  } else {
    log("lobby 404:" + msg.lobbyName);
    log(socket.username);
    socket.emit(LOBBY_NOT_FOUND, msg.lobbyName);
  }
};



//this function handles reception of a choice from a player, and sends 
//the cards if needed to the tsar
exports.handleChoice = (io, socket, msg) => {
  let lobby = getLobby(msg.lobbyName);
  if (lobby) {
    let userInfo = getUser(lobby, msg.username).info;

    //the user hasn't already voted
    if (userInfo.cardsChosen.length === 0) {

      userInfo.inactivityCounter = 0;

      let hand = userInfo.hand;

      //we remove the cards chosen from the users hand
      for (let choice of msg.choice) {
        if (choice !== null) {
          let index = -1;

          //we have a card 
          for (let i = 0; i < hand.length; i++) {
            let currentCard = hand[i];
            //we found the card
            if (currentCard._id === choice._id) {
              index = i;
            }
          }
          //we remove the card from the hand
          if (index > -1) { hand.splice(index, 1); }
        }
      }

      userInfo.cardsChosen = msg.choice;
      lobby.gameState.userChosen++;

      log(lobby.gameState.userChosen + "/" + (lobby.userList.length - 1) + " users voted.");
      if (lobby.gameState.userChosen === lobby.userList.length - 1) {
        clearTimeout(lobby.gameState.turnTimeout);
        sendCardsToVote(io, lobby);
      } else {
        log(socket.username + " sent his cards");
        socket.emit(CHOICE_RECEIVED);
      }
    } else {
      log("user already sent his cards.");
    }
  } else {
    log("lobby not found: " + msg.lobbyName);
  }
};
