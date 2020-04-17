"use strict";

const {
  ROUND_WIN,
  GAME_WIN
} = require("../messages");

const {
  log
} = require("../utils");

const {
  setTimeoutAndPlayTurn
} = require("../game/turn");

const {
  getUser,
  getLobby,
  getUserByID,
  getAllScores
} = require("../lobby/lobbyUtils");



function modifyScore(lobby, username, amount) {
  for (let user of lobby.userList) {
    if (user.username === username) {
      user.info.score += amount;
    }
  }
}



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


    roundWon(io, lobby, msg.username, msg.winningCard);

  } else {
    log("tsarvoted: Lobby not found.");
  }
};

// exports.userDemocracyVote = (io, socket, msg) => {
//   log("tsar has voted.");

//   let lobby = getLobby(msg.lobbyName);

//   if (lobby) {

//     let userInfo = getUser(lobby, msg.username).info;

//     //the user hasn't already voted
//     if (userInfo.cardsChosen.length === 0) {

//       userInfo.inactivityCounter = 0;

//       let hand = userInfo.hand;

//       //we remove the cards chosen from the users hand
//       for (let choice of msg.choice) {
//         if (choice !== null) {
//           let index = -1;

//           //we have a card 
//           for (let i = 0; i < hand.length; i++) {
//             let currentCard = hand[i];
//             //we found the card
//             if (currentCard._id === choice._id) {
//               index = i;
//             }
//           }
//           //we remove the card from the hand
//           if (index > -1) { hand.splice(index, 1); }
//         }
//       }

//       userInfo.cardsChosen = msg.choice;
//       lobby.gameState.userChosen++;

//       log("userChosen: " + lobby.gameState.userChosen + " vs users: " + lobby.userList.length);
//       if (lobby.gameState.userChosen === lobby.userList.length - 1) {
//         clearTimeout(lobby.gameState.turnTimeout);
//         sendCardsToVote(io, lobby);
//       } else {
//         log(socket.username + " sent his cards");
//         socket.emit(CHOICE_RECEIVED);
//       }
//     } else {
//       log("user already sent his cards.");
//     }

//     // if (lobby.gameSettings.tsar) {

//     //   clearTimeout(lobby.gameState.tsar.tsarTimeout);

//     //   let tsarUser = getUserByID(lobby, lobby.gameState.tsar.id);

//     //   if (tsarUser) {
//     //     tsarUser.info.inactivityCounter = 0;
//     //   }
//     // }


//     // roundWon(io, lobby, msg.username, msg.winningCard);

//   } else {
//     log("lobby not found");
//   }
// };





function roundWon(io, lobby, username, winningCard) {
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
        scores: scores
      });
      setTimeoutAndPlayTurn(io, lobby);
    }
  } else {
    log("roundwon User not found.");
  }
}



