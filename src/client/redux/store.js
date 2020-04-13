import {
  createStore
} from "redux";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import {
  SET_LOGIN,
  ADD_CHAT_MESSAGE,
  SET_BLACKCARD,
  SET_HAND,
  SET_SELECTED_CARDS,
  CLEANUP_STORE,
  SET_USER_INFO
} from "./actions";

const INITIAL_STATE = {
  username: null,
  lobbyName: null,
  chatHistory: [],
  blackCard: null,
  hand: [],
  selectedCards: [null, null, null]
};

function pushItem(array, item) {
  return [...array.slice(0, array.length), item];
}

//reducers must not modify the original state
function reducer(state = INITIAL_STATE, action) {
  let newState = {
    ...state
  };

  switch (action.type) {
  case CLEANUP_STORE:
    return INITIAL_STATE;

  case SET_USER_INFO:
    newState.username = action.username;
    newState.lobbyName = action.lobbyName;
    return newState;

  case SET_LOGIN:
    newState.login = action.login;
    return newState;

  case ADD_CHAT_MESSAGE:
    newState.chatHistory = pushItem(state.chatHistory, action.message);
    return newState;

  case SET_BLACKCARD:
    newState.blackCard = action.blackCard;
    return newState;

  case SET_HAND:
    newState.hand = action.hand;
    return newState;

  case SET_SELECTED_CARDS:
    // eslint-disable-next-line no-case-declarations
    let newSelectedCards = [];
    newSelectedCards[0] = state.selectedCards[0];
    newSelectedCards[1] = state.selectedCards[1];
    newSelectedCards[2] = state.selectedCards[2];
    newSelectedCards[action.index] = action.value;

    newState.selectedCards = newSelectedCards;
    return newState;

  default:
    return state;
  }
}
// const persistConfig = {
//   key: "root",
//   storage
// };
// const persistedReducer = persistReducer(persistConfig, reducer);

// export default () => {
//   let store = createStore(persistedReducer);
//   let persistor = persistStore(store);
//   return { store, persistor };
// };

const store = createStore(reducer);

export default store;