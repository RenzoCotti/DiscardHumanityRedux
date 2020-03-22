module.exports = function(httpServer) {
  const io = require("socket.io").listen(httpServer);

  var lobbies = [
    {
      name: "Test1",
      password: "asd",
      blackCards: [],
      whiteCards: [],
      maxUsers: 5,
      currentUsers: 0,
      userList: []
    },
    {
      name: "Linda puzza1",
      password: "asd",
      blackCards: [],
      whiteCards: [],
      maxUsers: 20,
      currentUsers: 0,
      userList: []
    },
    {
      name: "Linda puzza2",
      password: "asd",
      blackCards: [],
      whiteCards: [],
      maxUsers: 20,
      currentUsers: 0,
      userList: []
    },
    {
      name: "Linda puzza3",
      password: "asd",
      blackCards: [],
      whiteCards: [],
      maxUsers: 20,
      currentUsers: 0,
      userList: []
    },
    {
      name: "Linda puzza4",
      password: "asd",
      blackCards: [],
      whiteCards: [],
      maxUsers: 20,
      currentUsers: 0,
      userList: []
    }
  ];

  function lobbyExists(lobbyName) {
    for (let lobby of lobbies) {
      if (lobby.name === lobbyName) {
        return true;
      }
    }
    return false;
  }

  function disconnectFromLobby(lobbyName, username) {
    let toRemove;
    for (let i = 0; i < lobbies.length; i++) {
      let lobby = lobbies[i];
      if (lobby.name === lobbyName) {
        lobby.currentUsers--;
        let index;

        //remove user from userlist
        for (let j = 0; j < lobby.userList.length; j++) {
          let user = lobby.userList[j];
          if (user === username) {
            index = j;
          }
        }
        lobby.userList.splice(index, 1);
        // console.log(lobby.userList);

        // console.log(lobby);
        // console.log(lobby.currentUsers);
        if (lobby.currentUsers === 0) {
          toRemove = i;
        }
      }
    }

    console.log(lobbies);
    if (toRemove === 0) {
      console.log("lobby empty now, removing " + toRemove);
      lobbies.splice(toRemove, 1);
    }
    // console.log(lobbies);
  }

  //logins to a new lobby
  function loginLobby(socket, lobbyName, password, username) {
    console.log("trying to access lobby " + lobbyName);
    if (lobbyExists(lobbyName)) {
      for (let lobby of lobbies) {
        if (lobbyName === lobby.name) {
          if (password === lobby.password) {
            let alreadyJoined = false;
            console.log(lobby.userList);
            for (let user of lobby.userList) {
              if (user === username) {
                //user has already joined, assume reconnect
                alreadyJoined = true;
              }
            }

            if (alreadyJoined) {
              console.log("user already joined.");
            } else {
              if (lobby.currentUsers + 1 <= lobby.maxUsers) {
                socketJoinLobby(socket, lobbyName);
                lobby.currentUsers++;
                lobby.userList.push(username);
                socket.emit("lobby-joined");
                console.log("lobby joined.");
              } else {
                socket.emit("lobby-full");
                console.log("lobby is full.");
              }
            }
          } else {
            socket.emit("lobby-incorrect-credentials");
            console.log("incorrect credentials.");
          }
        }
      }
    } else {
      console.log("lobby not found.");
      socket.emit("lobby-not-found");
    }
  }

  //adds name of lobby to socket for disconnect
  function socketJoinLobby(socket, lobbyName) {
    socket.lobby = lobbyName;
  }

  function getLobbyList() {
    console.log("got all lobbies");
    let temp = [];
    for (let lobby of lobbies) {
      let tempLobby = {
        name: lobby.name,
        maxUsers: lobby.maxUsers,
        currentUsers: lobby.currentUsers
      };
      temp.push(tempLobby);
    }
    return temp;
  }

  io.on("connect", function(socket) {
    socket.join("general");

    console.log("user connected " + socket.id);
    // socket.emit("ping");

    //allows creation of a lobby
    socket.on("lobby-new", function(info) {
      if (roomExists(info.lobbyName)) {
        socket.emit("lobby-exists-already");
      } else {
        socketJoinLobby(socket, info.lobbyName);
        let lobby = {
          name: info.lobbyName,
          password: info.password,
          blackCards: info.blackCards,
          whiteCards: info.whiteCards,
          maxUsers: info.maxUsers,
          currentUsers: 1,
          userList: [info.userName]
        };

        lobbies.push(lobby);
        socket.emit("lobby-created", info.lobbyName);
      }
    });

    //joins a lobby
    socket.on("lobby-login", function(info) {
      loginLobby(socket, info.lobbyName, info.password, info.userName);
    });

    socket.on("lobby-leave", function(info) {
      disconnectFromLobby(info.lobbyName, socket.userName);
    });

    socket.on("lobby-get-list", () => {
      socket.emit("lobby-list", getLobbyList());
    });

    socket.on("disconnect", function() {
      console.log("user disconnected " + socket.id);

      if (socket.lobby) {
        console.log("disconnecting from " + socket.lobby);
        disconnectFromLobby(socket.lobby, socket.userName);
      }
    });
  });
};
