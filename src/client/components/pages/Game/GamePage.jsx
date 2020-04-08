import React, { Component } from "react";
import Card from "../../modules/Card";
import Chat from "../../modules/Chat";
import Hand from "./Views/Hand";
import { Redirect } from "react-router";

import { connect } from "react-redux";
import {
  getLobbyName,
  getHand,
  getUsername,
  getSelectedCards,
  updateHand,
  updateBlackCard,
  getBlackCard,
} from "../../../redux/actions";
import CardSelected from "./Views/CardSelected";
import SelectionPhase from "./Phases/SelectionPhase";

class GamePage extends Component {
  state = {};
  constructor(props) {
    super(props);

    this.props.socket.on("new-black-card", (card) => {
      this.props.updateBlackCard(card);
    });

    this.props.socket.on("new-hand", (hand) => {
      this.props.updateHand(hand);
    });

    this.props.socket.on("lobby-not-found", () => {
      this.setState({ home: true });
    });

    this.props.socket.emit("check-game-start", this.props.lobbyName);
  }

  //on page leave, leave lobby
  componentWillUnmount() {
    this.props.socket.emit("lobby-leave", this.props.username);
  }

  //all we have to do, is verify if user is in lobby.
  //if so, we log him in automatically
  //broken rn due to no persist

  render() {
    if (this.state.home) {
      return <Redirect push to={"/"} />;
    }

    if (!this.props.hand || !this.props.blackCard) {
      return <div>Initialising...</div>;
    }

    return (
      <React.Fragment>
        <SelectionPhase />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state),
  hand: getHand(state),
  selectedCards: getSelectedCards(state),
  blackCard: getBlackCard(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateHand: (value) => dispatch(updateHand(value)),
  updateBlackCard: (value) => dispatch(updateBlackCard(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);
