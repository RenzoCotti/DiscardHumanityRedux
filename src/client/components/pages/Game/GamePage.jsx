import React, { Component } from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import SelectionPhase from "./Phases/SelectionPhase";
import TsarPhase from "./Phases/TsarPhase";
// import Chat from "../../modules/Chat";
import PropTypes from "prop-types";


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
  GAME_STATE,
  ROUND_WIN,
  GAME_WIN,
  GAME_READY,
  IS_TSAR,
  TSAR_NO_VOTE,
  NOBODY_VOTED,
  LOBBY_HAS_USER,
  GAME_LOUNGE
} from "../../../../server/socket/messages";
import WinRound from "./Phases/WinRound";
import WinGame from "./Phases/WinGame";

class GamePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winRound: false,
      winGame: false,
      tsar: false,
      noVote: false,
      home: false,
      winningCard: null,
      winUsername: null,
      nobodyVoted: false,
      scores: [],
    };

    this.props.socket.on(NEW_BLACK_CARD, (card) => {
      // console.log("new card of colour");

      this.props.updateBlackCard(card);
    });

    this.props.socket.on(NEW_HAND, (hand) => {
      // console.log("new hand");

      this.props.updateHand(hand);
    });

    this.props.socket.on(IS_TSAR, (value) => {
      // console.log("new tsar");
      this.setState({ tsar: value });
    });

    this.props.socket.on(ROUND_WIN, (msg) => {
      // console.log("round was won");
      this.setState({
        winRound: true,
        winGame: false,
        tsar: false,
        noVote: false,
        winningCard: msg.winningCard,
        winUsername: msg.username,
        scores: msg.scores,
      });
    });

    this.props.socket.on(GAME_WIN, (msg) => {
      // console.log("game was won");
      this.setState({
        winRound: false,
        winGame: true,
        tsar: false,
        noVote: false,
        nobodyVoted: false,
        scores: msg,
      });
    });

    this.props.socket.on(NOBODY_VOTED, (msg) => {
      // console.log("game was won");
      this.setState({
        winRound: true,
        winGame: false,
        tsar: false,
        noVote: false,
        nobodyVoted: true,
        scores: msg,
      });
    });

    this.props.socket.on(GAME_READY, () => {
      this.setState({
        winRound: false,
        winGame: false,
        tsar: false,
        noVote: false,
        nobodyVoted: false,
      });

      this.props.socket.emit(GAME_STATE, {
        lobbyName: this.props.lobbyName,
        username: this.props.username,
      });
    });

    this.props.socket.on(TSAR_NO_VOTE, (msg) => {
      console.log("tsar didnt vote");
      this.setState({
        winRound: true,
        winGame: false,
        tsar: false,
        noVote: true,
        nobodyVoted: false,
        scores: msg,
      });
      // this.props.socket.emit(LOBBY_HAS_USER);

      // this.props.socket.emit(GAME_STATE, {
      //   lobbyName: this.props.lobbyName,
      //   username: this.props.username,
      // });
    });
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      updateBlackCard: PropTypes.func,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
      blackCard: PropTypes.object,
      updateHand: PropTypes.func,
      hand: PropTypes.array,
    };
  }

  //all we have to do, is verify if user is in lobby.
  //if so, we log him in automatically
  //broken rn due to no persist

  render() {
    let toReturn;
    if (this.state.home) {
      return <Redirect push to={"/"} />;
    } else if (this.state.toLounge) {
      return <Redirect push to={"/lounge"} />;
    } else if (this.state.winRound) {
      toReturn = (
        <WinRound
          noVote={this.state.noVote}
          nobodyVoted={this.state.nobodyVoted}
          winningCard={this.state.winningCard}
          winUsername={this.state.winUsername}
          scores={this.state.scores}
        />
      );
    } else if (this.state.winGame) {
      toReturn = <WinGame scores={this.state.scores} />;
    } else if (this.state.tsar) {
      toReturn = <TsarPhase socket={this.props.socket} />;
    } else if (!this.props.hand || !this.props.blackCard) {
      // console.log(this.props);
      toReturn = <div>Initialising...</div>;
    } else {
      toReturn = <SelectionPhase socket={this.props.socket} />;
    }

    return (
      <div className="flex-row">
        {toReturn}
        {/* <Chat socket={this.props.socket} /> */}
      </div>
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
