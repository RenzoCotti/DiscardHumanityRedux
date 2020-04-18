"use strict";
const {
  DEMOCRACY_CHOICES,
  NOBODY_VOTED,
  TSAR_VOTING,
  TSAR_NO_VOTE,
  GAME_READY,
  GAME_WIN,
  ROUND_WIN
} = require("../messages");

const {
  log,
  getUser,
  getLobby,
  getUserByID,
  getAllScores,
  checkIfKick,
  setGameState,
  TSAR_VOTE_TIMEOUT,
  RESULT_TIMEOUT,
  USER_CHOICE_TIMEOUT,
  drawBlackCard,
  drawUpTo10,
  drawWhiteCardsAll,
  pickNewTsar,
} = require("../internal");


//the tsar has voted, send all clients the info for the result screen
exports.tsarVoted = (io, msg) => {
  log("Tsar has voted.");

  let lobby = getLobby(msg.lobbyName);

  if (lobby) {

    if (lobby.gameSettings.tsar) {

      clearTimeout(lobby.gameState.tsar.tsarTimeout);

      let tsarUser = getUserByID(lobby, lobby.gameState.tsar.id);

      if (tsarUser) {
        tsarUser.info.inactivityCounter = 0;
      }
    }


    roundWon(io, lobby, msg.username, msg.winningCard, false, exports.setTimeoutAndPlayTurn);

  } else {
    log("tsarvoted: Lobby not found.");
  }
};





//function that handles a democracy vote
exports.userDemocracyVote = (io, msg) => {

  let lobby = getLobby(msg.lobbyName);

  if (lobby) {
    log("User " + msg.username + " has voted for " + msg.votedUsername);

    let votedUserInfo = getUser(lobby, msg.votedUsername).info;
    let userInfo = getUser(lobby, msg.username).info;


    //if the user exists and it hasn't voted and the user voted is valid
    if (userInfo && !userInfo.voted && votedUserInfo) {
      votedUserInfo.votes++;
      lobby.gameState.userVoted++;
      userInfo.voted = true;
      userInfo.inactivityCounter = 0;

      log(lobby.gameState.userVoted + "/" + lobby.userList.length + " users voted.");
      //if over threshold, roundwon + check for ending

      if (lobby.gameState.userVoted === lobby.userList.length) {
        clearTimeout(lobby.gameState.tsar.tsarTimeout);
        democracyCalculateWinner(io, lobby, exports.setTimeoutAndPlayTurn);
      }

    } else {
      log("User already sent his vote.");
    }
  }
  else {
    log("lobby not found");
  }
};





//calculates who won in democracy
function democracyCalculateWinner(io, lobby, fn) {
  //everybody voted, pick winner
  lobby.gameState.userVoted = 0;
  let winners = [];
  let max = 0;
  for (let user of lobby.userList) {
    if (user.info) {
      if (!user.info.voted) {
        user.info.inactivityCounter++;
        checkIfKick(io, lobby, user);
      } else {
        if (user.info.votes > max) {
          winners = [user.username];
          max = user.info.votes;
        } else if (user.info.votes === max && user.info.votes > 0) {
          //tie
          winners.push(user.username);
        }

        user.info.voted = false;
      }
    }
  }

  let username;
  let winningCard;
  let multipleWinners = winners.length > 1;

  let user = null;
  if (winners.length === 1) {
    user = getUser(lobby, winners[0]);
    log(user.username + " was democratically voted and won.");
  } else if (winners.length > 1) {
    //more than one winner, pick one at random
    let random = Math.floor(Math.random() * winners.length);
    user = getUser(lobby, winners[random]);
    log("Tied. RNJesus decided " + user.username + " won.");
  } else {
    //nobody voted
    let scores = getAllScores(lobby);
    io.to(lobby.name).emit(NOBODY_VOTED, scores);
    fn(io, lobby);
  }

  if (user) {
    log(user.info);
    //an individual winner
    username = user.username;
    winningCard = user.info.cardsChosen;
    roundWon(io, lobby, username, winningCard, multipleWinners, fn);
  }

}


exports.sendCardsToVote = (io, lobby, fn) => {

  //creating the list to send to the tsar
  let cards = [];

  for (let user of lobby.userList) {

    if (user.info) {
      //adding if user voted
      if (user.info.cardsChosen.length > 0) {
        cards.push({
          choice: user.info.cardsChosen,
          username: user.username
        });
      } else if (user.info.cardsChosen.length === 0) {
        //otherwise tsar is included
        if (lobby.gameSettings.tsar && user.id === lobby.gameState.tsar.id) { continue; }
        //else user hasn't voted
        user.info.inactivityCounter++;
        checkIfKick(io, lobby, user);
      }
    }

  }


  if (cards.length === 0) {
    //nobody voted
    let scores = getAllScores(lobby);
    log("Nobody voted.");
    io.to(lobby.name).emit(NOBODY_VOTED, scores);

    //to solve for circular dependency
    fn(io, lobby);

    return;
  }

  if (lobby.gameSettings.tsar) {
    let tsar = lobby.gameState.tsar;

    log("Tsar is now voting...");

    setGameState(lobby, "voting");
    io.to(tsar.id).emit(TSAR_VOTING, cards);

    tsar.tsarTimeout = setTimeout(() => {
      log("Tsar hasn't voted.");

      //kicks tsar if necessary
      let tsarUser = getUserByID(lobby, tsar.id);

      if (tsarUser) {
        tsarUser.info.inactivityCounter++;
        checkIfKick(io, lobby, tsarUser);
      }


      let scores = getAllScores(lobby);
      io.to(lobby.name).emit(TSAR_NO_VOTE, scores);

      fn(io, lobby);

    }, TSAR_VOTE_TIMEOUT);

  } else {
    //democracy
    log("Democracy is now voting...");
    setGameState(lobby, "voting");

    io.to(lobby.name).emit(DEMOCRACY_CHOICES, cards);

    //reusing tsar timeout because
    //TODO maybe add a specific timer?
    lobby.gameState.tsar.tsarTimeout = setTimeout(() => {
      log("Somebody didn't vote...");

      democracyCalculateWinner(io, lobby, fn);

    }, TSAR_VOTE_TIMEOUT);
  }
};



exports.setTimeoutAndPlayTurn = (io, lobby) => {
  lobby.gameState.turnTimeout = setTimeout(() => {
    exports.playTurn(io, lobby);
  }, RESULT_TIMEOUT);
};


exports.playTurn = (io, lobby) => {
  lobby.gameState.numberOfTurns++;
  log("########## Turn " + lobby.gameState.numberOfTurns + " ##########");

  reinitialiseLobby(lobby);

  if (lobby.gameSettings.tsar) {
    pickNewTsar(lobby);
  }

  drawUpTo10(lobby);
  drawBlackCard(lobby);

  if (lobby.gameState.currentBlackCard.pick === 3) {
    //pick 3 want you to draw 2s beforehand
    drawWhiteCardsAll(lobby, 2);
  }

  setGameState(lobby, "selecting");

  //case users don't vote
  lobby.gameState.turnTimeout = setTimeout(() => {
    log("Not all users voted...");
    exports.sendCardsToVote(io, lobby, exports.setTimeoutAndPlayTurn);
  }, USER_CHOICE_TIMEOUT);

  io.to(lobby.name).emit(GAME_READY);
};


function reinitialiseLobby(lobby) {
  for (let user of lobby.userList) {
    user.info.cardsChosen = [];
  }
  lobby.gameState.userChosen = 0;
  //whitecards in userhand already in used, and so blackcards
}

function modifyScore(lobby, username, amount) {
  for (let user of lobby.userList) {
    if (user.username === username) {
      user.info.score += amount;
    }
  }
}



function roundWon(io, lobby, username, winningCard, multipleWinners, fn) {
  let user = getUser(lobby, username);

  if (user) {
    log(username + " won the round.");

    lobby.gameState.lastRoundWinner = username;

    //winner gets a point
    modifyScore(lobby, username, +1);


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
      log("Game over!");
      io.to(lobby.name).emit(GAME_WIN, scores);
    } else {
      io.to(lobby.name).emit(ROUND_WIN, {
        winningCard: winningCard,
        username: username,
        scores: scores,
        multipleWinners: multipleWinners
      });
      fn(io, lobby);
    }
  } else {
    log("roundwon User not found.");
  }
}
