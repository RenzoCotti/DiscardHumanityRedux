"use strict";

const {
  drawBlackCard,
  drawUpTo10,
  drawWhiteCardsAll
} = require("./drawing");

const {
  LOBBY_LIST_UPDATE,
  USER_DISCONNECT,
  GAME_LOUNGE,
  GAME_READY,
  NOBODY_VOTED,
  TSAR_VOTING,
  TSAR_NO_VOTE,
  DEMOCRACY_VOTE,
} = require("./messages");


exports.TSAR_VOTE_TIMEOUT = 20000;
exports.USER_CHOICE_TIMEOUT = 20000;
exports.RESULT_TIMEOUT = 5000;
exports.USER_INACTIVITY_MAX_TURNS = 3;

exports.lobbies = [];
exports.shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const debug = true;

/*SOME FUNCTIONS REQUIRED BY BOTH FILES c: */


exports.log = (message) => {
  if (debug) {
    console.log(message);
  }
};

//returns a lobby given a name
exports.getLobby = (name) => {
  for (let lobby of exports.lobbies) {
    if (lobby.name === name) {
      return lobby;
    }
  }
  return false;
};

//returns a user in the given lobby that matches username
exports.getUser = (lobby, username) => {
  for (let user of lobby.userList) {
    if (username === user.username) {
      return user;
    }
  }
  return false;
};


//returns a user in the given lobby that matches username
exports.getUserByID = (lobby, id) => {
  for (let user of lobby.userList) {
    if (id === user.id) {
      return user;
    }
  }
  return false;
};

exports.disconnectFromLobby = (io, lobbyName, username) => {
  exports.log("disconnecting user " + username + " from " + lobbyName);

  let toRemove = -1;
  for (let i = 0; i < exports.lobbies.length; i++) {
    let lobby = exports.lobbies[i];
    if (lobby.name === lobbyName) {
      let user = exports.getUser(lobby, username);
      if (!user) { return; }

      io.to(lobbyName).emit(USER_DISCONNECT, username);

      let index = -1;

      //remove user from userlist
      for (let j = 0; j < lobby.userList.length; j++) {
        let user = lobby.userList[j];
        if (user.username === username) {
          index = j;
        }
      }

      if (index !== -1) {
        lobby.userList.splice(index, 1);
      }

      lobby.currentUsers--;

      //remove user info if game started

      if (lobby.state) {
        //game has started

        if (user.info && user.info.hand) {
          //we discard his hand
          lobby.gameState.whiteCards.used = lobby.gameState.whiteCards.used.concat(
            user.info.hand
          );
        }
        //sync clients
        io.to(lobby.name).emit(GAME_READY);
      }


      if (lobby.currentUsers === 0) {
        toRemove = i;
        stopGame(lobby);
      } else if (lobby.currentUsers === 1) {
        //tolobby
        // lobby.state = "deck-selection"
        stopGame(lobby);
        io.to(lobby.name).emit(GAME_LOUNGE);
      }
    }
  }

  if (toRemove !== -1) {
    exports.log("lobby empty now, removing.");
    exports.lobbies.splice(toRemove, 1);
    io.in("general").emit(LOBBY_LIST_UPDATE);
  }
};

function stopGame(lobby) {
  lobby.state = "deck-selection";
  if (lobby.gameState) {
    clearTimeout(lobby.gameState.turnTimeout);
    clearTimeout(lobby.gameState.tsarTimeout);
  }
}

exports.setGameState = (lobby, status) => {
  /*
    init (setting up game, drawing cards for everyone) X CANT JOIN, wait
    selecting (everyone is picking cards)
    voting (tsar or demo or whatevs)
    result
    finished (end screen)
  */

  lobby.state = status;
};

function reinitialiseLobby(lobby) {
  for (let user of lobby.userList) {
    user.info.cardsChosen = [];
  }
  lobby.gameState.userChosen = 0;
  //whitecards in userhand already in used, and so blackcards
}

exports.playTurn = (io, lobby) => {
  reinitialiseLobby(lobby);

  if (lobby.gameSettings.tsar) {
    exports.pickNewTsar(lobby);
  }

  drawUpTo10(lobby);
  drawBlackCard(lobby);

  if (lobby.gameState.currentBlackCard.pick === 3) {
    //pick 3 want you to draw 2s beforehand
    drawWhiteCardsAll(lobby, 2);
  }

  exports.setGameState(lobby, "selecting");

  //case users don't vote
  lobby.gameState.turnTimeout = setTimeout(() => {
    exports.log("not all users voted");
    exports.sendCardsToVote(io, lobby);
  }, exports.USER_CHOICE_TIMEOUT);

  io.to(lobby.name).emit(GAME_READY);
};

//this function picks a new tsar in case it's necessary
//in case meritocracy, tsar is last winner
exports.pickNewTsar = (lobby) => {
  let tsar = lobby.gameState.tsar;
  //new tsar is last round winner
  if (lobby.gameSettings.meritocracy) {
    if (lobby.gameSettings.lastRoundWinner) {
      let user = exports.getUser(lobby, lobby.gameSettings.lastRoundWinner);
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
    exports.log("new tsar " + lobby.userList[tsar.tsarIndex].username);
  }
  //else democracy mode
};


exports.sendCardsToVote = (io, lobby) => {
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
        if (lobby.gameSettings.tsar && user.id === lobby.gameState.tsar.id) { continue; }
        //user hasn't voted
        user.info.inactivityCounter++;
        checkIfKick(io, lobby, user);
      }
    }

  }


  if (cards.length === 0) {
    //nobody voted
    let scores = exports.getAllScores(lobby);

    io.to(lobby.name).emit(NOBODY_VOTED, scores);

    lobby.gameState.turnTimeout = setTimeout(() => {
      exports.log("new turn");
      exports.playTurn(io, lobby);
      io.to(lobby.name).emit(GAME_READY);
    }, exports.RESULT_TIMEOUT);
    return;
  }

  // log(cards);

  //everybody chose, except tsar
  if (lobby.gameSettings.tsar) {
    let tsar = lobby.gameState.tsar;

    exports.log("tsar is now voting");

    exports.setGameState(lobby, "voting");
    io.to(tsar.id).emit(TSAR_VOTING, cards);

    tsar.tsarTimeout = setTimeout(() => {
      exports.log("tsar hasn't voted");

      let tsarUser = exports.getUserByID(lobby, tsar.id);

      if (tsarUser) {
        tsarUser.info.inactivityCounter++;
        checkIfKick(io, lobby, tsarUser);
      }



      let scores = exports.getAllScores(lobby);
      io.to(lobby.name).emit(TSAR_NO_VOTE, scores);

      lobby.gameState.turnTimeout = setTimeout(() => {
        exports.log("new turn");
        exports.playTurn(io, lobby);
        io.to(lobby.name).emit(GAME_READY);
      }, exports.RESULT_TIMEOUT);

    }, exports.TSAR_VOTE_TIMEOUT);
  } else {
    exports.log("democracy is now voting");
    exports.setGameState(lobby, "voting");

    io.to(lobby.name).emit(DEMOCRACY_VOTE, cards);

    //reusing tsar timeout because
    //TODO maybe add a specific timer?
    lobby.gameState.tsar.tsarTimeout = setTimeout(() => {
      exports.log("somebody didn't vote");

      let scores = exports.getAllScores(lobby);
      io.to(lobby.name).emit(TSAR_NO_VOTE, scores);

      lobby.gameState.turnTimeout = setTimeout(() => {
        exports.log("new turn");
        exports.playTurn(io, lobby);
        io.to(lobby.name).emit(GAME_READY);
      }, exports.RESULT_TIMEOUT);

    }, exports.TSAR_VOTE_TIMEOUT);
    //democracy
  }
};

function checkIfKick(io, lobby, user) {
  if (user.info.inactivityCounter >= exports.USER_INACTIVITY_MAX_TURNS) {
    exports.log("kicking " + user.username + " for inactivity");
    exports.disconnectFromLobby(io, lobby.name, user.username);
  } else {
    exports.log("user " + user.username + " is inactive: " + user.info.inactivityCounter);
  }
}

exports.getAllScores = (lobby) => {
  let scores = [];
  for (let user of lobby.userList) {
    scores.push({
      username: user.username,
      score: user.info.score
    });
  }

  return scores;
};