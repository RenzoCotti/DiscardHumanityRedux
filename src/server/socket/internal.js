const {
  log,
  shuffle,
  RESULT_TIMEOUT,
  USER_CHOICE_TIMEOUT,
  USER_INACTIVITY_MAX_TURNS,
} = require("./utils");
exports.log = log;
exports.shuffle = shuffle;
exports.RESULT_TIMEOUT = RESULT_TIMEOUT;
exports.USER_CHOICE_TIMEOUT = USER_CHOICE_TIMEOUT;
exports.USER_INACTIVITY_MAX_TURNS = USER_INACTIVITY_MAX_TURNS;

let {
  lobbies
} = require("./utils");
exports.lobbies = lobbies;

const {
  drawWhiteCardsAll,
  drawXCards,
  drawBlackCard,
  drawUpTo10,
} = require("./game/drawCards");
exports.drawWhiteCardsAll = drawWhiteCardsAll;
exports.drawXCards = drawXCards;
exports.drawBlackCard = drawBlackCard;
exports.drawUpTo10 = drawUpTo10;


const {
  setDecks,
  getLobbyList,
  chatMessage,
  hasUser,
  getLobby,
  getUser,
  setGameState,
  lobbyExists,
  getAllScores
} = require("./lobby/lobbyUtils");
exports.setDecks = setDecks;
exports.getLobbyList = getLobbyList;
exports.chatMessage = chatMessage;
exports.hasUser = hasUser;
exports.getLobby = getLobby;
exports.getUser = getUser;
exports.setGameState = setGameState;
exports.lobbyExists = lobbyExists;
exports.getAllScores = getAllScores;


const {
  createLobby,
  loginLobby,
} = require("./lobby/joinLobby");
exports.createLobby = createLobby;
exports.loginLobby = loginLobby;

const {
  disconnectFromLobby,
  checkIfKick
} = require("./lobby/disconnectLobby");
exports.disconnectFromLobby = disconnectFromLobby;
exports.checkIfKick = checkIfKick;

const {
  democracyCalculateWinner
} = require("./voting/democracy");
exports.democracyCalculateWinner = democracyCalculateWinner;


const {
  sendCardsToVote
} = require("./voting/sendCardsToVote");
exports.sendCardsToVote = sendCardsToVote;


const {
  playTurn,
  setTimeoutAndPlayTurn
} = require("./game/turn");
exports.playTurn = playTurn;
exports.setTimeoutAndPlayTurn = setTimeoutAndPlayTurn;


const {
  handleChoice
} = require("./voting/handleChoice");
exports.handleChoice = handleChoice;






const {
  checkStart,
  getGameState
} = require("./game/initGame");
exports.checkStart = checkStart;
exports.getGameState = getGameState;

const {
  tsarVoted,
  userDemocracyVote
} = require("./voting/voteCards");
exports.tsarVoted = tsarVoted;
exports.userDemocracyVote = userDemocracyVote;





