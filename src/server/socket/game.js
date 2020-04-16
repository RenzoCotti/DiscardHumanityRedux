const {
  log,
  getLobby,
  getUser,
  disconnectFromLobby,
  getUserByID
} = require('./utils');

const {
  NEW_HAND,
  NEW_BLACK_CARD,
  TSAR_VOTING,
  LOBBY_NOT_FOUND,
  GAME_START,
  CHOICE_RECEIVED,
  ROUND_WIN,
  GAME_WIN,
  IS_TSAR,
  GAME_READY,
  TSAR_NO_VOTE,
  NOBODY_VOTED,
  USER_NOT_FOUND
} = require("./messages");


const TSAR_VOTE_TIMEOUT = 20000;
const USER_CHOICE_TIMEOUT = 20000;
const RESULT_TIMEOUT = 5000;
const USER_INACTIVITY_MAX_TURNS = 3;


//used to randomly shuffle an array
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

//this function returns an array of x cards taken from array. cycles if necessary
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

function modifyScore(lobby, username, amount) {
  for (let user of lobby.userList) {
    if (user.username === username) {
      user.info.score += amount;
    }
  }
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
    }
  }
}

//draws x white cards for everybody, merges to old hand
function drawWhiteCardsAll(lobby, x) {
  for (let user of lobby.userList) {
    let oldHand = user.info.hand;
    let hand = drawXCards(lobby.gameState.whiteCards, x);
    let newHand = oldHand ? oldHand.concat(hand) : hand;
    user.info.hand = newHand;
  }
}

function drawUpTo10(lobby) {
  for (let user of lobby.userList) {
    log("drawing " + user.username);
    let oldHand = user.info.hand;

    let cardsToDraw = 10 - oldHand.length;
    let hand = drawXCards(lobby.gameState.whiteCards, cardsToDraw);
    let newHand = oldHand ? oldHand.concat(hand) : hand;
    user.info.hand = newHand;
  }
}

//draws a new black card for the lobby
function drawBlackCard(lobby) {
  lobby.gameState.currentBlackCard = drawXCards(
    lobby.gameState.blackCards,
    1
  )[0];
}

function setGameState(lobby, status) {
  /*
    init (setting up game, drawing cards for everyone) X CANT JOIN, wait
    selecting (everyone is picking cards)
    voting (tsar or demo or whatevs)
    result
    finished (end screen)
  */

  lobby.state = status;
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
      log("user " + msg.username + " not found.")
    }
    //else user isn't there


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
      inactivityCounter: 0
    }
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

function reinitialiseLobby(lobby) {
  for (let user of lobby.userList) {
    user.info.cardsChosen = [];
  }
  lobby.gameState.userChosen = 0;
  //whitecards in userhand already in used, and so blackcards
}

function playTurn(io, lobby) {
  reinitialiseLobby(lobby);
  pickNewTsar(lobby);
  drawUpTo10(lobby);
  drawBlackCard(lobby);

  if (lobby.gameState.currentBlackCard.pick === 3) {
    //pick 3 want you to draw 2s beforehand
    drawWhiteCardsAll(lobby, 2);
  }

  setGameState(lobby, "selecting");

  //case users don't vote
  lobby.gameState.turnTimeout = setTimeout(() => {
    // let scores = getAllScores(lobby);
    log("not all users voted");
    sendCardsToVote(io, lobby);
    // io.to(lobby.name).emit(NOBODY_VOTED, scores);
    // lobby.gameState.turnTimeout = setTimeout(() => {
    //   playTurn(io, lobby);
    // }, RESULT_TIMEOUT);
  }, USER_CHOICE_TIMEOUT);

  io.to(lobby.name).emit(GAME_READY);
}



function checkState(state) {
  // selecting (everyone is picking cards)
  // voting (tsar or demo or whatevs)
  // result
  // finished (end screen)
  // init
  if (state === "selecting" || state === "voting" || state === "result" || state === "end" || state === "init") return true;
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
    log(socket.username)
    socket.emit(LOBBY_NOT_FOUND, msg.lobbyName);
  }
}

//this function picks a new tsar in case it's necessary
//in case meritocracy, tsar is last winner
function pickNewTsar(lobby) {
  if (lobby.gameSettings.tsar) {
    let tsar = lobby.gameState.tsar;
    //new tsar is last round winner
    if (lobby.gameSettings.meritocracy) {
      if (lobby.gameSettings.lastRoundWinner) {
        let user = getUser(lobby, lobby.gameSettings.lastRoundWinner);
        if (user) {
          //setting tsar to last winner
          tsar.id = user.id;
        } else {
          //no matching user found, setting to first one
          tsar.id = lobby.userList[0].id;
        }
      } else {
        //no user beforehand, setting to 0
        tsar.id = lobby.userList[0].id;
      }
    } else {
      //we simply go over the users in order
      //everybody tsar'd once at least, we loop
      //we reset the counter if we can't find the user either
      if (tsar.tsarIndex + 1 === lobby.userList.length || !lobby.userList[tsar.tsarIndex]) {
        tsar.tsarIndex = 0;
      } else {
        tsar.tsarIndex++;
      }

      //set the tsar id
      tsar.id = lobby.userList[tsar.tsarIndex].id;
      log("new tsar " + lobby.userList[tsar.tsarIndex].username);
    }
  }
  //else democracy mode
}

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
          if (index > -1) hand.splice(index, 1);
        }
      }

      userInfo.cardsChosen = msg.choice;
      lobby.gameState.userChosen++;

      log("userChosen: " + lobby.gameState.userChosen + " vs users: " + lobby.userList.length)
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
}

function checkIfKick(io, lobby, user) {
  if (user.info.inactivityCounter >= USER_INACTIVITY_MAX_TURNS) {
    log("kicking " + user.username + " for inactivity");
    disconnectFromLobby(io, lobby.name, user.username);
  } else {
    log("user " + user.username + " is inactive: " + user.info.inactivityCounter);
  }
}

function sendCardsToVote(io, lobby) {
  //creating the list to send to the tsar
  let cards = [];

  // console.log(lobby.userList)

  for (let user of lobby.userList) {
    //otherwise tsar is included

    if (user.info) {
      if (user.info.cardsChosen.length > 0) {
        cards.push({
          choice: user.info.cardsChosen,
          username: user.username
        });
      } else if (user.info.cardsChosen.length === 0) {
        if (lobby.gameSettings.tsar && user.id === lobby.gameState.tsar.id) continue;
        //user hasn't voted
        user.info.inactivityCounter++;
        checkIfKick(io, lobby, user);
      }
    }

  }


  if (cards.length === 0) {
    //nobody voted
    let scores = getAllScores(lobby);

    io.to(lobby.name).emit(NOBODY_VOTED, scores);

    lobby.gameState.turnTimeout = setTimeout(() => {
      log("new turn");
      playTurn(io, lobby);
      io.to(lobby.name).emit(GAME_READY);
    }, RESULT_TIMEOUT);
    return;
  }

  log(cards);

  //everybody chose, except tsar
  if (lobby.gameSettings.tsar) {
    let tsar = lobby.gameState.tsar;

    log("tsar is now voting");

    setGameState(lobby, "voting");
    io.to(tsar.id).emit(TSAR_VOTING, cards);

    tsar.tsarTimeout = setTimeout(() => {
      log("tsar hasn't voted");

      let tsarUser = getUserByID(lobby, tsar.id);

      if (tsarUser) {
        tsarUser.info.inactivityCounter++;
        checkIfKick(io, lobby, tsarUser);
      }



      let scores = getAllScores(lobby);
      io.to(lobby.name).emit(TSAR_NO_VOTE, scores);

      lobby.gameState.turnTimeout = setTimeout(() => {
        log("new turn");
        playTurn(io, lobby);
        io.to(lobby.name).emit(GAME_READY);
      }, RESULT_TIMEOUT);

    }, TSAR_VOTE_TIMEOUT);
  } else {
    log("democracy is now voting");
    //democracy
  }
}


//the tsar has voted, send all clients the info for the result screen
exports.tsarVoted = (io, msg) => {
  log("tsar has voted.")

  let lobby = getLobby(msg.lobbyName);

  if (lobby) {

    if (lobby.gameSettings.tsar) {

      clearTimeout(lobby.gameState.tsar.tsarTimeout);

      let tsarUser = getUserByID(lobby, lobby.gameState.tsar.id);

      if (tsarUser) {
        tsarUser.info.inactivityCounter = 0;
      }
    }

    let user = getUser(lobby, msg.username);

    if (user) {

      lobby.gameState.lastRoundWinner = msg.username;
      lobby.gameState.numberOfTurns++;

      //winner gets a point
      modifyScore(lobby, user.username, +1);


      //check win conditions of the game
      let end = false;

      if (lobby.gameSettings.ending === "score") {
        for (let user of lobby.gameState.userState.info) {
          if (user.score === lobby.gameSettings.ending.max) {
            end = true;
          }
        }

      } else if (lobby.gameSettings.ending === "turns") {
        if (lobby.gameState.numberOfTurns === lobby.gameSettings.max) {
          end = true;
        }
      }

      //creating the score
      let scores = getAllScores(lobby);

      if (end) {
        io.to(msg.lobbyName).emit(GAME_WIN, scores);
      } else {
        io.to(msg.lobbyName).emit(ROUND_WIN, {
          winningCard: msg.winningCard,
          username: user.username,
          scores: scores
        });


        lobby.gameState.turnTimeout = setTimeout(() => {
          log("new turn");
          playTurn(io, lobby);
          io.to(lobby.name).emit(GAME_READY);
        }, RESULT_TIMEOUT);
      }



    } else {
      log("user not found");
    }

  } else {
    log("lobby not found");
  }
}


function getAllScores(lobby) {
  let scores = [];
  for (let user of lobby.userList) {
    scores.push({
      username: user.username,
      score: user.info.score
    });
  }

  return scores;
}