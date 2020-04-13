import React, { Component } from "react";
import { Redirect } from "react-router";
import Chat from "../../modules/Chat";
import { connect } from "react-redux";
import { getLobbyName } from "../../../redux/actions";
import PropTypes from "prop-types";

import {
  GAME_START,
  LOBBY_NOT_FOUND,
  DECKS_SELECTED,
  CHECK_START,
  USER_CONNECT,
} from "../../../../server/socket/messages";

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
    };
  }

  setupSocket() {
    this.props.socket.on(GAME_START, () => {
      this.setState({ start: true });
    });

    this.props.socket.on(USER_CONNECT, () => {
      console.log("user joined");
      this.props.socket.emit(CHECK_START, this.props.lobbyName);
    });

    this.props.socket.on(DECKS_SELECTED, () => {
      console.log("deck set by admin");
      this.props.socket.emit(CHECK_START, this.props.lobbyName);
    });

    this.props.socket.on(LOBBY_NOT_FOUND, () => {
      this.setState({ home: true });
    });

    //every time we get here, we launch this and check if the game can start
    this.props.socket.emit(CHECK_START, this.props.lobbyName);
  }

  render() {
    if (this.state.home) {
      return <Redirect push to={"/"} />;
    }
    if (this.state.start) {
      return <Redirect push to={"/game"} />;
    }

    return (
      <div className="flex-row">
        <div>Waiting for players to join...</div>
        <Chat socket={this.props.socket} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
});

export default connect(mapStateToProps, null)(LoungePage);
