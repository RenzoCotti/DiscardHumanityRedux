import React, { Component } from "react";
import Button from "../../../modules/input/Button";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
  getLobbyName,
  getUsername,
} from "../../../../redux/actions";

import {
  GAME_BREAK,
  GAME_PAUSED,
  GAME_RESUME,
  GAME_END,
  GAME_UNPAUSED
} from "../../../../../server/socket/messages";

class AdminDashboard extends Component {

  constructor(props) {
    super(props);

    this.sendBreak = this.sendBreak.bind(this);
    this.endGame = this.endGame.bind(this);

    this.state = { paused: "Pause game" };

    this.props.socket.on(GAME_PAUSED, () => {
      this.setState({ paused: "Unpause game" });
    });

    this.props.socket.on(GAME_UNPAUSED, () => {
      this.setState({ paused: "Pause game" });
    });
  }

  componentWillUnmount() {
    this.props.socket.off(GAME_PAUSED);
    this.props.socket.off(GAME_UNPAUSED);
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
    };
  }

  sendBreak() {
    console.log("break");
    if (this.state.paused === "Pause game") {
      this.props.socket.emit(GAME_BREAK, this.props.lobbyName);
    } else if (this.state.paused === "Unpause game") {
      this.props.socket.emit(GAME_RESUME, this.props.lobbyName);
    }
  }

  endGame() {
    this.props.socket.emit(GAME_END, this.props.lobbyName);
  }

  render() {

    return (
      <div className="flex-row">
        <Button value={this.state.paused} fn={this.sendBreak} />
        <Button value="End Game" fn={this.endGame} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state),
});

// const mapDispatchToProps = (dispatch) => ({
// });

export default connect(mapStateToProps, null)(AdminDashboard);
