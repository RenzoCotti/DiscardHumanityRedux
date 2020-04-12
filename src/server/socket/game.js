const {
  log,
  getLobby,
  getUser,
  getUserInfo
} = require('./utils');

const {

} = require('./lobby');


const {
  NEW_HAND,
  NEW_BLACK_CARD,
  NEW_TSAR,
  TSAR_VOTING,
  LOBBY_NOT_FOUND,
  GAME_START,
  CHOICE_RECEIVED,
  ROUND_WIN,
  GAME_WIN,
  IS_TSAR,
  GAME_READY
} = require("./messages");

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

function getAllUserInfos(lobby) {
  return lobby.gameState.userState.info;
}

function modifyScore(lobby, username, amount) {
  for (let user of lobby.gameState.userState.info) {
    if (user.username === username) {
      user.score += amount;
    }
  }
}

function setScore(lobby, username, value) {
  for (let user of lobby.gameState.userState.info) {
    if (user.username === username) {
      user.score = value;
    }
  }
}



//draws x white cards for everybody, merges to old hand
function drawWhiteCardsAll(lobby, x) {
  for (let user of lobby.userList) {
    let userInfo = getUserInfo(lobby, user.username);
    let oldHand = userInfo.hand;
    let hand = drawXCards(lobby.gameState.whiteCards, x);
    let newHand = oldHand ? oldHand.concat(hand) : hand;
    userInfo.hand = newHand;
  }
}

function drawUpTo10(lobby) {
  for (let user of lobby.userList) {
    let userInfo = getUserInfo(lobby, user.username);
    let oldHand = userInfo.hand;

    let cardsToDraw = 10 - oldHand.length;
    let hand = drawXCards(lobby.gameState.whiteCards, cardsToDraw);
    let newHand = oldHand ? oldHand.concat(hand) : hand;
    userInfo.hand = newHand;
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
  if (lobby) {
    log("getting game state...");

    socket.emit(NEW_HAND, getUserInfo(lobby, msg.username).hand);
    socket.emit(NEW_BLACK_CARD, lobby.gameState.currentBlackCard);
    socket.emit(IS_TSAR, lobby.gameState.tsar === socket.id);

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
      info: [],
      chosen: 0
    },
    //id of tsar
    tsar: undefined,
    tsarIndex: 0,
    //username of last winner
    lastRoundWinner: undefined,
    numberOfTurns: 0

  };

  //setting all scores to 0
  for (let user of lobby.userList) {
    lobby.gameState.userState.info.push({
      username: user.username,
      hand: [],
      cardsChosen: [],
      score: 0
    });
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
  }

  drawWhiteCardsAll(lobby, 10);
  playTurn(io, lobby);
}

function reinitialiseLobby(lobby) {
  for (let info of lobby.gameState.userState.info) {
    info.cardsChosen = [];
  }
  lobby.gameState.userState.chosen = 0;
  //whitecards in userhand already in used, and so blackcards
}

function playTurn(io, lobby) {
  reinitialiseLobby(lobby)
  pickNewTsar(lobby);
  drawUpTo10(lobby);
  drawBlackCard(lobby);

  if (lobby.gameState.currentBlackCard.pick === 3) {
    //pick 3 want you to draw 2s beforehand
    drawWhiteCardsAll(lobby, 2);
  }

  setGameState(lobby, "selecting");
  io.to(lobby.name).emit(GAME_READY);
}

function checkState(state) {
  // selecting (everyone is picking cards)
  // voting (tsar or demo or whatevs)
  // result
  // finished (end screen)
  if (state === "selecting" || state === "voting" || state === "result" || state === "end") return true;
  //deck-selection, init
  return false;
}

exports.checkStart = (io, socket, lobbyName) => {

  let lobby = getLobby(lobbyName);
  if (lobby) {
    if (checkState(lobby.state)) {
      //game already started
      log("game already started")
    } else if (
      lobby.currentUsers > 1 &&
      lobby.whiteCards &&
      lobby.whiteCards.length > 0) {

      log("game starting...")

      io.in(lobby.name).emit(GAME_START);

      initGame(io, lobby);

    }

  } else {
    socket.emit(LOBBY_NOT_FOUND);
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
          tsar = user.id;
        } else {
          //no matching user found, setting to first one
          tsar = lobby.userList[0].id;
        }
      } else {
        //no user beforehand, setting to 0
        tsar = lobby.userList[0].id;
      }
    } else {
      //we simply go over the users in order
      let tsarIndex = lobby.gameState.tsarIndex;
      //everybody tsar'd once at least, we loop
      if (lobby.gameState.tsarIndex + 1 === lobby.userList.length) {
        lobby.gameState.tsarIndex = 0;
      } else {
        lobby.gameState.tsarIndex++;
      }

      //set the tsar id
      tsar = lobby.userList[tsarIndex].id;
      lobby.gameState.tsar = tsar;
      log("new tsar " + tsar)
    }
  }
  //else democracy mode
}

//this function handles reception of a choice from a player, and sends 
//the cards if needed to the tsar
exports.handleChoice = (io, socket, msg) => {
  let lobby = getLobby(msg.lobbyName);
  if (lobby) {
    let userInfo = getUserInfo(lobby, msg.username);

    //the user hasn't already voted
    if (userInfo.cardsChosen.length === 0) {

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
      lobby.gameState.userState.chosen++;

      if (lobby.gameState.userState.chosen === lobby.userList.length - 1) {


        //creating the list to send to the tsar
        let cards = [];

        for (let user of lobby.gameState.userState.info) {
          //otherwise tsar is included
          if (user.cardsChosen.length > 0) {
            cards.push({
              choice: user.cardsChosen,
              username: user.username
            })
          }
        }


        //everybody chose, except tsar
        if (lobby.gameSettings.tsar) {
          log("tsar is now voting");

          setGameState(lobby, "tsar voting")
          io.to(lobby.gameState.tsar).emit(TSAR_VOTING, cards);
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


//the tsar has voted, send all clients the info for the result screen
exports.tsarVoted = (io, msg) => {

  let lobby = getLobby(msg.lobbyName);

  if (lobby) {
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
      let infos = getAllUserInfos(lobby);

      let scores = [];
      for (let info of infos) {
        scores.push({
          username: info.username,
          score: info.score
        });
      }

      if (end) {
        io.to(msg.lobbyName).emit(GAME_WIN, scores);
      } else {
        io.to(msg.lobbyName).emit(ROUND_WIN, {
          winningCard: msg.winningCard,
          username: user.username,
          scores: scores
        });


        setTimeout(() => {
          log("new turn")
          playTurn(io, lobby);
          io.to(lobby.name).emit(GAME_READY)
        }, 5000);
      }



    } else {
      log("user not found");
    }

  } else {
    log("lobby not found");
  }
}