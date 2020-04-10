exports.GAME_START = "game-start";
exports.GAME_LOUNGE = "game-lounge";
exports.CHECK_START = "game-check-start";
exports.GAME_STATE = "game-get-state";



exports.NEW_HAND = "game-new-hand";
exports.NEW_BLACK_CARD = "game-new-black-card";

exports.NEW_TSAR = "game-tsar-new";
exports.TSAR_VOTING = "game-tsar-voting";
exports.TSAR_VOTE = "game-tsar-vote";


exports.CHOICE_RECEIVED = "game-choice-received";
exports.CHOICE = "game-choice";


/*USERS MESSAGES */
exports.USER_EXISTS = "user-exists";
exports.USER_CONNECT = "user-connect";
exports.USER_DISCONNECT = "user-disconnect";

/**LOBBY MESSAGES */
exports.LOBBY_LOGIN = "lobby-login";
exports.LOBBY_NEW = "lobby-new";
exports.LOBBY_LIST_UPDATE = "lobby-list-update";
exports.LOBBY_JOINED = "lobby-joined";
exports.LOBBY_CREATED = "lobby-created";
exports.LOBBY_LEAVE = "lobby-leave";
exports.LOBBY_GET_LIST = "lobby-get-list";
exports.LOBBY_LIST = "lobby-list";
exports.LOBBY_HAS_USER = "lobby-has-user";


/**DECKS MESSAGES */
exports.SET_DECKS = "lobby-set-decks";
exports.DECKS_SELECTED = "lobby-decks-selected";

/**CHAT MESSAGES */
exports.CHAT_MESSAGE = "chat-message-new";
exports.SEND_CHAT_MESSAGE = "chat-message-send";

/*LOBBY ERRORS */
exports.LOBBY_FULL = "lobby-full";
exports.LOBBY_EXISTS_ALREADY = "lobby-exists-already";
exports.LOBBY_INCORRECT_CREDENTIALS = "lobby-incorrect-credentials";
exports.LOBBY_NOT_FOUND = "lobby-not-found";