"use strict";

const {
  log,
  getUser,
} = require("../internal");



//this function picks a new tsar in case it's necessary
//in case meritocracy, tsar is last winner
exports.pickNewTsar = (lobby) => {
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
    log("New tsar: " + lobby.userList[tsar.tsarIndex].username);
  }
};