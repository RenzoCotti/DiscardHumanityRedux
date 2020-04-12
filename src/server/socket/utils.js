exports.lobbies = [];
exports.shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

var debug = true;

/*SOME FUNCTIONS REQUIRED BY BOTH FILES c: */


exports.log = (message) => {
  if (debug) {
    console.log(message);
  }
}

//returns a lobby given a name
exports.getLobby = (name) => {
  for (let lobby of exports.lobbies) {
    if (lobby.name === name) return lobby;
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
}

exports.getUserInfo = (lobby, username) => {
  for (let user of lobby.gameState.userState.info) {
    if (user.username === username) {
      return user;
    }
  }
}