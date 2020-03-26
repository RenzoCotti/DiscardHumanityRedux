import React, { Component } from "react";
import Button from "../modules/input/Button";
import Card from "../modules/Card";

class GamePage extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.socket = this.props.socket;

    // this.setupSocket();

    // this.selectDeck = this.selectDeck.bind(this);
    // this.toggleDeck = this.toggleDeck.bind(this);
    // this.startGame = this.startGame.bind(this);
  }

  setupSocket() {
    // this.socket.on("game-start", () => {});
    // this.socket.on("game-lounge", () => {
    //   this.setState({ waiting: true });
    // });
    // this.socket.on("user-join", () => {});
  }

  startGame() {}

  render() {
    return <div>Waiting for players to join...</div>;
  }
}

export default GamePage;
