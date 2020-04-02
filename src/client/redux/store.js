import { createStore } from "redux";
import {
  SET_LOBBYNAME,
  SET_USERNAME,
  SET_LOGIN,
  SET_CHAT_HISTORY,
  SET_SOCKET
} from "./actions";

const INITIAL_STATE = {
  username: null,
  lobbyName: null,
  chatHistory: [],
  socket: null
};

//reducers must not modify the original state
function reducer(state = INITIAL_STATE, action) {
  let newState = { ...state };

  switch (action.type) {
    case SET_USERNAME:
      newState.username = action.username;
      return newState;

    case SET_LOBBYNAME:
      newState.lobbyName = action.lobbyName;
      return newState;

    case SET_SOCKET:
      newState.socket = action.socket;
      return newState;

    case SET_LOGIN:
      newState.login = action.login;
      return newState;

    case SET_CHAT_HISTORY:
      newState.chatHistory = action.chatHistory;
      return newState;

    default:
      return state;
  }
}

const store = createStore(reducer);

export default store;
