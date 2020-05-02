import React, { Component } from "react";
import { Redirect } from "react-router";
import Chat from "../Game/Views/Chat";
import { connect } from "react-redux";
import { getLobbyName, getUsername, updateUserInfo, getTabSelected, wipeChatHistory } from "../../../redux/actions";
import PropTypes from "prop-types";

import {
  GAME_START,
  LOBBY_NOT_FOUND,
  CHECK_START,
  USER_NOT_FOUND,
  LOBBY_LEAVE,
  DECK_SELECTION,
  GAME_LOUNGE,
  NOT_ENOUGH_PLAYERS
} from "../../../../server/socket/messages";
import GamePage from "../Game/GamePage";
import Topbar from "../Game/Views/Topbar";
import Leaderboard from "../Game/Views/Leaderboard";
import DeckSelection from "./DeckSelectionPage";
import Button from "../../modules/input/Button";

class LoungePage extends Component {

  constructor(props) {
    super(props);
    this.state = {error: ""};
    this.setupSocket();
    this.checkStartGame = this.checkStartGame.bind(this);

    // console.log("props user");
    // console.log(props);
  }
  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
      updateUserInfo: PropTypes.func,
      tabSelected: PropTypes.string,
      wipeChatHistory: PropTypes.func
    };
  }

  //on page leave, leave lobby
  componentWillUnmount() {
    // console.log("Lounge is unmounting");
    this.props.socket.emit(LOBBY_LEAVE, { lobbyName: this.props.lobbyName, username: this.props.username });
    this.props.wipeChatHistory();
    // console.log("LEAVE");
    this.props.updateUserInfo({ lobbyName: null, username: null });
    this.props.socket.off(GAME_START);
    this.props.socket.off(LOBBY_NOT_FOUND);
    this.props.socket.off(USER_NOT_FOUND);
    this.props.socket.off(DECK_SELECTION);
    this.props.socket.off(GAME_LOUNGE);
  }

  setupSocket() {
    this.props.socket.on(GAME_START, () => {
      this.setState({ start: true });
    });

    this.props.socket.on(LOBBY_NOT_FOUND, () => {
      // console.log("lobby not found: " + msg);
      this.setState({ kicked: true });
    });

    this.props.socket.on(USER_NOT_FOUND, () => {
      // console.log("user not found: " + msg);
      this.setState({ kicked: true });
    });

    this.props.socket.on(DECK_SELECTION, () => {
      // console.log("start false");
      this.setState({ deckSelection: true });
    });

    this.props.socket.on(GAME_LOUNGE, () => {
      this.setState({ waiting: true, deckSelection: false });
    });

    this.props.socket.on(NOT_ENOUGH_PLAYERS, () => {
      this.setState({ error: "Not enough players." });
    });

  }

  checkStartGame(){
    let info = { lobbyName: this.props.lobbyName, username: this.props.username };
    this.props.socket.emit(CHECK_START, info);
  }


  render() {

    let div = 
    (<div className="lounge-home">
      <div className="info-message">Waiting for players to join...</div>
      <br />
      <br />
      <Button value="Start game" fn={this.checkStartGame} />
      <div className="errormsg">{this.state.error}</div>
    </div>);


    if (this.state.kicked || !this.props.username && !this.props.lobbyName) {
      return <Redirect push to={"/kicked"} />;
    } else if (this.state.start) {
      div = <GamePage socket={this.props.socket} />;
    } else if (this.state.deckSelection){
      div = <DeckSelection socket={this.props.socket} />;
    }

    return (
      <React.Fragment>
        <Topbar socket={this.props.socket} />
        <div className="main-container">
          <div className="lounge-container">
            {div}

            <div className="side-bar">
              {this.props.tabSelected === "chat" ?
                <Chat socket={this.props.socket} /> :
                <Leaderboard />
              }
            </div>

          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state),
  tabSelected: getTabSelected(state)
});

const mapDispatchToProps = (dispatch) => ({
  updateUserInfo: (value) => dispatch(updateUserInfo(value)),
  wipeChatHistory: () => dispatch(wipeChatHistory())
});

export default connect(mapStateToProps, mapDispatchToProps)(LoungePage);
