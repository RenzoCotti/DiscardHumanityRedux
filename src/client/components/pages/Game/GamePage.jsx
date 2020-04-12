import React, { Component } from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import SelectionPhase from "./Phases/SelectionPhase";
import TsarPhase from "./Phases/TsarPhase";

import {
  getLobbyName,
  getHand,
  getUsername,
  getSelectedCards,
  updateHand,
  updateBlackCard,
  getBlackCard,
} from "../../../redux/actions";

import {
  NEW_BLACK_CARD,
  NEW_HAND,
  LOBBY_NOT_FOUND,
  LOBBY_LEAVE,
  GAME_STATE,
  ROUND_WIN,
  GAME_WIN,
  GAME_READY,
  IS_TSAR,
} from "../../../../server/socket/messages";
import WinRound from "./Phases/WinRound";
import WinGame from "./Phases/WinGame";

class GamePage extends Component {
  state = {};
  constructor(props) {
    super(props);

    this.props.socket.on(NEW_BLACK_CARD, (card) => {
      // console.log("new card of colour");

      this.props.updateBlackCard(card);
    });

    this.props.socket.on(NEW_HAND, (hand) => {
      // console.log("new hand");

      this.props.updateHand(hand);
    });

    this.props.socket.on(LOBBY_NOT_FOUND, () => {
      // console.log("lobby 404");
      this.setState({ home: true });
    });

    this.props.socket.on(IS_TSAR, (value) => {
      // console.log("new tsar");
      this.setState({ tsar: value });
    });

    this.props.socket.on(ROUND_WIN, (msg) => {
      // console.log("round was won");
      this.setState({
        winRound: true,
        tsar: false,
        winGame: false,
        winningCard: msg.winningCard,
        winUsername: msg.username,
        scores: msg.scores,
      });
    });

    this.props.socket.on(GAME_WIN, (msg) => {
      // console.log("game was won");
      this.setState({
        winRound: false,
        tsar: false,
        winGame: true,
        scores: msg,
      });
    });

    this.props.socket.on(GAME_READY, () => {
      this.setState({
        winRound: false,
        tsar: false,
        winGame: false,
      })
      this.props.socket.emit(GAME_STATE, {
        lobbyName: this.props.lobbyName,
        username: this.props.username,
      });
    });
  }

  //on page leave, leave lobby
  componentWillUnmount() {
    this.props.socket.emit(LOBBY_LEAVE, this.props.username);
  }

  //all we have to do, is verify if user is in lobby.
  //if so, we log him in automatically
  //broken rn due to no persist

  render() {
    if (this.state.home) {
      return <Redirect push to={"/"} />;
    }

    if (this.state.tsar) {
      return <TsarPhase socket={this.props.socket} />;
    }

    if (this.state.winRound) {
      return (
        <WinRound
          winningCard={this.state.winningCard}
          winUsername={this.state.winUsername}
          scores={this.state.scores}
        />
      );
    }

    if (this.state.winGame) {
      return <WinGame scores={this.state.scores} />;
    }

    if (!this.props.hand || !this.props.blackCard) {
      return <div>Initialising...</div>;
    }

    return (
      <React.Fragment>
        <SelectionPhase socket={this.props.socket} />
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
