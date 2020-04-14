import React, { Component } from "react";
import { Redirect } from "react-router";
import Chat from "../../modules/Chat";
import { connect } from "react-redux";
import { getLobbyName, getUsername } from "../../../redux/actions";
import PropTypes from "prop-types";

import {
  GAME_START,
  LOBBY_NOT_FOUND,
  DECKS_SELECTED,
  CHECK_START,
  USER_CONNECT,
  LOBBY_LEAVE,
  GAME_LOUNGE
} from "../../../../server/socket/messages";
import GamePage from "../Game/GamePage";

class LoungePage extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.setupSocket();
  }
  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string
    };
  }

  //on page leave, leave lobby
  componentWillUnmount() {
    this.props.socket.emit(LOBBY_LEAVE, { lobbyName: this.props.lobbyName, username: this.props.username });
  }

  setupSocket() {
    this.props.socket.on(GAME_START, () => {
      this.setState({ start: true });
    });

    this.props.socket.on(USER_CONNECT, () => {
      console.log("user joined");
      this.props.socket.emit(CHECK_START, { lobbyName: this.props.lobbyName, username: this.props.username });
    });

    this.props.socket.on(DECKS_SELECTED, () => {
      console.log("deck set by admin");
      this.props.socket.emit(CHECK_START, { lobbyName: this.props.lobbyName, username: this.props.username });
    });

    this.props.socket.on(LOBBY_NOT_FOUND, (msg) => {
      console.log("to home: " + msg);
      this.setState({ home: true });
    });

    this.props.socket.on(GAME_LOUNGE, () => {
      this.setState({ start: false });
    });

    //every time we get here, we launch this and check if the game can start
    this.props.socket.emit(CHECK_START, { lobbyName: this.props.lobbyName, username: this.props.username });
  }

  render() {

    let div = <div>Waiting for players to join...</div>;
    if (this.state.home) {
      return <Redirect push to={"/"} />;
    }
    if (this.state.start) {
      div = <GamePage socket={this.props.socket} />;
    }

    return (
      <div className="flex-row">
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

export default connect(mapStateToProps, null)(LoungePage);
