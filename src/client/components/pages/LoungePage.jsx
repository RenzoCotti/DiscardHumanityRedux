import React, { Component } from "react";
import { Redirect } from "react-router";
import Chat from "../modules/Chat";
import { connect } from "react-redux";
import { getLobbyName } from "../../redux/actions";

class LoungePage extends Component {
  state = {};

  constructor(props) {
    super(props);

    this.setupSocket();

    // this.selectDeck = this.selectDeck.bind(this);
    // this.toggleDeck = this.toggleDeck.bind(this);
    // this.startGame = this.startGame.bind(this);
  }

  setupSocket() {
    this.props.socket.on("start-game", () => {
      this.setState({ start: true });
    });

    this.props.socket.on("user-connect", () => {
      console.log("user joined");
      this.props.socket.emit("check-start", this.props.lobbyName);
    });

    this.props.socket.on("deck-set", () => {
      console.log("deck set by admin");
      this.props.socket.emit("check-start", this.props.lobbyName);
    });

    this.props.socket.on("lobby-not-found", () => {
      this.setState({ home: true });
    });

    this.props.socket.emit("check-lobby", this.props.lobbyName);
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

const mapStateToProps = state => ({
  lobbyName: getLobbyName(state)
});

export default connect(mapStateToProps, null)(LoungePage);
