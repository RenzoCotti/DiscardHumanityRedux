export const SET_USERNAME = "SET_USERNAME";
export const SET_LOBBYNAME = "SET_LOBBYNAME";
export const SET_SOCKET = "SET_SOCKET";
export const SET_CHAT_HISTORY = "SET_CHAT_HISTORY";
export const SET_LOGIN = "SET_LOGIN";

export const updateUsername = username => ({
  type: SET_USERNAME,
  username: username
});

export function getUsername(state) {
  return state.username;
}
export function getLogin(state) {
  return state.login;
}

export const updateLogin = login => ({
  type: SET_LOGIN,
  login: login
});

export function getLobbyName(state) {
  return state.lobbyName;
}

export const updateLobbyName = lobbyName => ({
  type: SET_LOBBYNAME,
  lobbyName: lobbyName
});

export function getSocket(state) {
  return state.socket;
}

export const updateSocket = socket => ({
  type: SET_SOCKET,
  socket: socket
});

export function getChatHistory(state) {
  return state.chatHistory;
}

export const updateChatHistory = history => ({
  type: SET_CHAT_HISTORY,
  chatHistory: history
});
