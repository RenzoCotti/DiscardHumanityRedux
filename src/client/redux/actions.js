export const SET_USER_INFO = "SET_USER_INFO";
export const ADD_CHAT_MESSAGE = "ADD_CHAT_MESSAGE";
export const SET_LOGIN = "SET_LOGIN";
export const SET_HAND = "SET_HAND";
export const SET_BLACKCARD = "SET_BLACKCARD";
export const SET_SELECTED_CARDS = "SET_SELECTED_CARDS";
export const CLEANUP_STORE = "CLEANUP_STORE";
export const SET_TAB_SELECTED = "SET_TAB_SELECTED";
export const SET_SCORES = "SET_SCORES";
export const WIPE_CHAT_HISTORY = "WIPE_CHAT_HISTORY";
export const SET_LOBBY_TYPE = "SET_LOBBY_TYPE";

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

export const updateTabSelected = tab => ({
  type: SET_TAB_SELECTED,
  tabSelected: tab
});

export function getTabSelected(state) {
  return state.tabSelected;
}

export const updateScores = scores => ({
  type: SET_SCORES,
  scores: scores
});

export function getScores(state) {
  return state.scores;
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

export const wipeChatHistory = () => ({
  type: WIPE_CHAT_HISTORY,
});

export const addChatMessage = message => ({
  type: ADD_CHAT_MESSAGE,
  message: message
});

export const cleanupStore = message => ({
  type: CLEANUP_STORE,
  cleanupStore: message
});

export const updateLobbyType = type => ({
  type: SET_LOBBY_TYPE,
  lobbyType: type
});

export function getLobbyType(state) {
  return state.lobbyType;
}