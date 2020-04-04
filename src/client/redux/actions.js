// export const SET_USERNAME = "SET_USERNAME";
// export const SET_LOBBYNAME = "SET_LOBBYNAME";
export const SET_USER_INFO = "SET_USER_INFO";

export const ADD_CHAT_MESSAGE = "ADD_CHAT_MESSAGE";
export const SET_LOGIN = "SET_LOGIN";
export const SET_HAND = "SET_HAND";
export const SET_BLACKCARD = "SET_BLACKCARD";
export const SET_SELECTED_CARDS = "SET_SELECTED_CARDS";
export const CLEANUP_STORE = "CLEANUP_STORE";

export const updateHand = hand => ({
  type: SET_HAND,
  hand: hand
});

export function getHand(state) {
  return state.hand;
}

export const updateBlackCard = blackCard => ({
  type: SET_BLACKCARD,
  blackCard: blackCard
});

export function getBlackCard(state) {
  return state.blackCard;
}

export const updateSelectedCards = (index, value) => ({
  type: SET_SELECTED_CARDS,
  index: index,
  value: value
});

export function getSelectedCards(state) {
  return state.selectedCards;
}

export const updateUserInfo = info => ({
  type: SET_USER_INFO,
  username: info.username,
  lobbyName: info.lobbyName
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

export function getChatHistory(state) {
  return state.chatHistory;
}

export const addChatMessage = message => ({
  type: ADD_CHAT_MESSAGE,
  message: message
});

export const cleanupStore = message => ({
  type: CLEANUP_STORE,
  cleanupStore: message
});
