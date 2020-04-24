import React, { Component } from "react";
import { Redirect } from "react-router";
import Chat from "../Game/Views/Chat";
import { connect } from "react-redux";
import { getLobbyName, getUsername, updateUserInfo } from "../../../redux/actions";
import PropTypes from "prop-types";

import {
  GAME_START,
  LOBBY_NOT_FOUND,
  DECKS_SELECTED,
  CHECK_START,
  USER_CONNECT,
  LOBBY_LEAVE,
  GAME_LOUNGE,
  USER_NOT_FOUND
} from "../../../../server/socket/messages";
import GamePage from "../Game/GamePage";
// import DeckSelection from "./DeckSelectionPage";

class LoungePage extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.setupSocket();

    // console.log("props user");
    // console.log(props);
  }
  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
      updateUserInfo: PropTypes.func
    };
  }

  //on page leave, leave lobby
  componentWillUnmount() {
    console.log("Lounge is unmounting");
    this.props.socket.emit(LOBBY_LEAVE, { lobbyName: this.props.lobbyName, username: this.props.username });
    // console.log("LEAVE");
    this.props.updateUserInfo({ lobbyName: null, username: null });
    this.props.socket.off(GAME_START);
    this.props.socket.off(USER_CONNECT);
    this.props.socket.off(DECKS_SELECTED);
    this.props.socket.off(LOBBY_NOT_FOUND);
    this.props.socket.off(USER_NOT_FOUND);
    this.props.socket.off(GAME_LOUNGE);
  }

  setupSocket() {
    this.props.socket.on(GAME_START, () => {
      this.setState({ start: true });
    });

    this.props.socket.on(USER_CONNECT, () => {
      // console.log("user joined");
      let info = { lobbyName: this.props.lobbyName, username: this.props.username };
      // console.log(info);
      this.props.socket.emit(CHECK_START, info);
    });

    this.props.socket.on(DECKS_SELECTED, () => {
      // console.log("deck set by admin");
      let info = { lobbyName: this.props.lobbyName, username: this.props.username };
      // console.log(info);
      this.props.socket.emit(CHECK_START, info);
    });

    this.props.socket.on(LOBBY_NOT_FOUND, () => {
      // console.log("lobby not found: " + msg);
      this.setState({ home: true });
    });

    this.props.socket.on(USER_NOT_FOUND, () => {
      // console.log("user not found: " + msg);
      this.setState({ home: true });
    });

    this.props.socket.on(GAME_LOUNGE, () => {
      // console.log("start false");
      this.setState({ start: false });
    });

    //every time we get here, we launch this and check if the game can start
    // this.props.socket.emit(CHECK_START, { lobbyName: this.props.lobbyName, username: this.props.username });
  }


  render() {

    let div = <div className="info-message">Waiting for players to join...</div>;
    if (this.state.home) {
      return <Redirect push to={"/kicked"} />;
    } else if (this.state.start) {
      div = <GamePage socket={this.props.socket} />;
    }
    // else {
    //   div = <DeckSelection socket={this.socket} />;
    // }

    return (
      <div className="lounge-container">
        {div}
        <Chat socket={this.props.socket} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state)
});

const mapDispatchToProps = (dispatch) => ({
  updateUserInfo: (value) => dispatch(updateUserInfo(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoungePage);
