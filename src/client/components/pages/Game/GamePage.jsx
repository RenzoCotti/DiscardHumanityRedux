import React, { Component } from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
  getLobbyName,
  getHand,
  getUsername,
  getSelectedCards,
  updateHand,
  updateBlackCard,
  getBlackCard,
  updateScores,
  getScores
} from "../../../redux/actions";

import {
  NEW_BLACK_CARD,
  NEW_HAND,
  GAME_STATE,
  ROUND_WIN,
  GAME_WIN,
  GAME_READY,
  IS_TSAR,
  TSAR_NO_VOTE,
  NOBODY_VOTED,
  DEMOCRACY_CHOICES,
  IS_ADMIN,
  USER_KICKED,
  NEW_SCORES
} from "../../../../server/socket/messages";

import WinRound from "./Phases/WinRound";
import WinGame from "./Phases/WinGame";
import SelectionPhase from "./Phases/SelectionPhase";
import VotePhase from "./Phases/VotePhase";

class GamePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winRound: false,
      winGame: false,
      tsar: false,
      noVote: false,
      winningCard: null,
      winUsername: null,
      nobodyVoted: false,
      democracy: null,
      isAdmin: false,
      scores: [],
    };

    this.resetState = this.resetState.bind(this);

    this.props.socket.on(NEW_BLACK_CARD, (card) => {
      this.props.updateBlackCard(card);
    });

    this.props.socket.on(NEW_HAND, (hand) => {
      this.props.updateHand(hand);
    });

    this.props.socket.on(NEW_SCORES, (scores) => {
      this.props.updateScores(scores);
    });

    this.props.socket.on(IS_TSAR, (msg) => {
      // console.log(msg);
      this.setState({ tsar: msg.tsar, redraw: msg.redraw });
    });

    this.props.socket.on(IS_ADMIN, () => {
      // console.log("Admin " + msg);
      this.setState({ isAdmin: true });
    });

    this.props.socket.on(DEMOCRACY_CHOICES, (msg) => {
      // console.log("new tsar");
      // console.log("democracy");
      // console.log(msg);
      this.setState({ democracy: msg });
    });

    this.props.socket.on(NOBODY_VOTED, (msg) => {
      // console.log("nobody voted");
      // console.log(msg);
      this.resetState();
      this.props.updateScores(msg);
      this.setState({
        winRound: true,
        nobodyVoted: true
      });
    });

    this.props.socket.on(TSAR_NO_VOTE, (msg) => {
      this.resetState();
      this.props.updateScores(msg);

      this.setState({
        winRound: true,
        noVote: true
      });
    });


    this.props.socket.on(ROUND_WIN, (msg) => {
      // console.log("round won");
      // console.log(msg);
      this.resetState();
      this.props.updateScores(msg.scores);

      this.setState({
        winRound: true,
        winningCard: msg.winningCard,
        winUsername: msg.username,
        multipleWinners: msg.multipleWinners
      });
    });

    this.props.socket.on(GAME_WIN, (msg) => {
      // console.log("game won");
      // console.log(msg);
      this.resetState();
      this.props.updateScores(msg.scores);
      this.setState({
        winGame: true,
        winner: msg.username,
        winningCard: msg.winningCard
      });
    });


    this.props.socket.on(GAME_READY, () => {
      this.resetState();
      // console.log("ready");
      this.props.socket.emit(GAME_STATE, {
        lobbyName: this.props.lobbyName,
        username: this.props.username,
      });
    });

    this.props.socket.on(USER_KICKED, (username) => {
      if (username === this.props.username) {
        // console.log("KICKED");
        this.resetState();
        this.setState({ kicked: true });
      }
    });

  }

  componentWillUnmount() {
    this.props.socket.off(NEW_BLACK_CARD);
    this.props.socket.off(NEW_HAND);
    this.props.socket.off(NEW_SCORES);
    this.props.socket.off(IS_TSAR);
    this.props.socket.off(IS_ADMIN);
    this.props.socket.off(DEMOCRACY_CHOICES);
    this.props.socket.off(NOBODY_VOTED);
    this.props.socket.off(TSAR_NO_VOTE);
    this.props.socket.off(ROUND_WIN);
    this.props.socket.off(GAME_WIN);
    this.props.socket.off(GAME_READY);
    this.props.socket.off(USER_KICKED);
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
      updateScores: PropTypes.func,
      scores: PropTypes.array
    };
  }

  resetState() {
    this.setState({
      winRound: false,
      winGame: false,
      tsar: false,
      noVote: false,
      winningCard: null,
      winUsername: null,
      nobodyVoted: false,
      democracy: null,
      kicked: false,
      scores: [],
    });
  }

  //all we have to do, is verify if user is in lobby.
  //if so, we log him in automatically
  //broken rn due to no persist

  render() {
    let toReturn;
    if (this.state.kicked) {
      return <Redirect push to={"/kicked"} />;
    } else if (this.state.toLounge) {
      return <Redirect push to={"/lounge"} />;
    } else if (this.state.winRound) {
      toReturn = (
        <WinRound
          noVote={this.state.noVote}
          nobodyVoted={this.state.nobodyVoted}
          winningCard={this.state.winningCard}
          winUsername={this.state.winUsername}
          multipleWinners={this.state.multipleWinners}
        />
      );
    } else if (this.state.winGame) {
      toReturn = <WinGame winner={this.state.winner} winningCard={this.state.winningCard} />;
    } else if (this.state.tsar) {
      toReturn = <VotePhase socket={this.props.socket} redraw={this.state.redraw} admin={this.state.isAdmin} />;
    } else if (this.state.democracy) {
      toReturn = <VotePhase socket={this.props.socket} democracy={this.state.democracy} admin={this.state.isAdmin} />;
    }
    else if (!this.props.hand || !this.props.blackCard) {
      // console.log(this.props);
      toReturn = <div>Initialising...</div>;
    } else {
      toReturn = <SelectionPhase socket={this.props.socket} admin={this.state.isAdmin} />;
    }

    return (
      <div className="flex-column full-width">
        {toReturn}
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
  scores: getScores(state)
});

const mapDispatchToProps = (dispatch) => ({
  updateHand: (value) => dispatch(updateHand(value)),
  updateBlackCard: (value) => dispatch(updateBlackCard(value)),
  updateScores: (value) => dispatch(updateScores(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);
