import React, { Component } from "react";
import Button from "../modules/input/Button";
import Card from "../modules/Card";

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
  }

  startGame() {}

  render() {
    return this.state.start ? (
      <div>Started! :D </div>
    ) : (
      <div>Waiting for players to join...</div>
    );
  }
}

export default LoungePage;
