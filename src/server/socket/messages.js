exports.GAME_START = "game-start";
exports.GAME_LOUNGE = "game-lounge";
exports.CHECK_START = "game-check-start";
exports.GAME_STATE = "game-get-state";
exports.GAME_READY = "game-state-ready";
exports.ROUND_WIN = "game-round-win";
exports.GAME_WIN = "game-win";
exports.GAME_BREAK = "game-break";
exports.GAME_PAUSED = "game-paused";
exports.GAME_RESUME = "game-resume";
exports.GAME_UNPAUSED = "game-unpaused";
exports.GAME_END = "game-end";

exports.NEW_HAND = "game-new-hand";
exports.NEW_BLACK_CARD = "game-new-black-card";

exports.NEW_TSAR = "game-tsar-new";
exports.TSAR_VOTING = "game-tsar-voting";
exports.TSAR_VOTE = "game-tsar-vote";
exports.IS_TSAR = "game-is-tsar";
exports.TSAR_NO_VOTE = "game-tsar-no-vote";
exports.NOBODY_VOTED = "game-nobody-voted";
exports.DEMOCRACY_VOTE = "game-democracy-vote";
exports.DEMOCRACY_CHOICES = "game-democracy-choices";
exports.TSAR_REDRAW = "game-tsar-redraw-hand";
exports.NOT_ENOUGH_POINTS = "game-not-enough-points";
exports.HAND_REDRAWN = "game-hand-redrawn";
exports.NEW_SCORES = "game-new-scores";
exports.TSAR_CURRENTLY_VOTING = "game-tsar-is-voting";

exports.CHOICE_RECEIVED = "game-choice-received";
exports.CHOICE = "game-choice";


/*USERS MESSAGES */
exports.USER_EXISTS = "user-exists";
exports.USER_CONNECT = "user-connect";
exports.USER_DISCONNECT = "user-disconnect";
exports.USER_NO_VOTE = "user-no-vote";
exports.USER_NOT_FOUND = "user-not-found";
exports.USER_KICKED = "user-kicked";

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
exports.IS_ADMIN = "lobby-is-admin";

/**DECKS MESSAGES */
exports.SET_DECKS = "lobby-set-decks";
exports.DECKS_SELECTED = "lobby-decks-selected";
exports.NOT_ENOUGH_CARDS = "lobby-not-enough-cards";
exports.DECK_SELECTION = "lobby-deck-selection";

/**CHAT MESSAGES */
exports.CHAT_MESSAGE = "chat-message-new";
exports.SEND_CHAT_MESSAGE = "chat-message-send";

/*LOBBY ERRORS */
exports.LOBBY_FULL = "lobby-full";
exports.LOBBY_EXISTS_ALREADY = "lobby-exists-already";
exports.LOBBY_INCORRECT_CREDENTIALS = "lobby-incorrect-credentials";
exports.LOBBY_NOT_FOUND = "lobby-not-found";
exports.NOT_ENOUGH_PLAYERS = "lobby-not-enough-players";