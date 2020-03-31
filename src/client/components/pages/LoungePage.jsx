import React, { Component } from "react";
import { Redirect } from "react-router";

class LoungePage extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.socket = this.props.socket;

    this.setupSocket();

    // this.selectDeck = this.selectDeck.bind(this);
    // this.toggleDeck = this.toggleDeck.bind(this);
    // this.startGame = this.startGame.bind(this);
  }

  setupSocket() {
    this.socket.on("start-game", () => {
      this.setState({ start: true });
    });

    this.socket.on("user-join", () => {
      console.log("user joined");
      this.socket.emit("check-start", this.props.name);
    });

    this.socket.on("deck-set", () => {
      console.log("deck set by admin");
      this.socket.emit("check-start", this.props.name);
    });
  }

  startGame() {}

  render() {
    if (this.state.start) {
      return <Redirect push to={"/game/" + this.props.name} />;
    }

    return <div>Waiting for players to join...</div>;
  }
}

export default LoungePage;
