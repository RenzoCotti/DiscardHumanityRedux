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
      home: false,
      winningCard: null,
      winUsername: null,
      nobodyVoted: false,
      democracy: null,
      scores: [],
    };

    this.resetState = this.resetState.bind(this);

    this.props.socket.on(NEW_BLACK_CARD, (card) => {
      this.props.updateBlackCard(card);
    });

    this.props.socket.on(NEW_HAND, (hand) => {
      this.props.updateHand(hand);
    });

    this.props.socket.on(IS_TSAR, (value) => {
      this.setState({ tsar: value });
    });

    this.props.socket.on(DEMOCRACY_CHOICES, (value) => {
      // console.log("new tsar");
      this.setState({ democracy: value });
    });

    this.props.socket.on(NOBODY_VOTED, (msg) => {
      this.resetState();
      this.setState({
        winRound: true,
        scores: msg,
      });
    });

    this.props.socket.on(TSAR_NO_VOTE, (msg) => {
      this.resetState();
      this.setState({
        winRound: true,
        scores: msg,
      });
    });


    this.props.socket.on(ROUND_WIN, (msg) => {
      this.resetState();
      this.setState({
        winRound: true,
        winningCard: msg.winningCard,
        winUsername: msg.username,
        scores: msg.scores,
      });
    });

    this.props.socket.on(GAME_WIN, (msg) => {
      this.resetState();
      this.setState({
        winGame: true,
        scores: msg,
      });
    });


    this.props.socket.on(GAME_READY, () => {
      this.resetState();

      this.props.socket.emit(GAME_STATE, {
        lobbyName: this.props.lobbyName,
        username: this.props.username,
      });
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

  resetState() {
    this.setState({
      winRound: false,
      winGame: false,
      tsar: false,
      noVote: false,
      home: false,
      winningCard: null,
      winUsername: null,
      nobodyVoted: false,
      democracy: null,
      scores: [],
    });
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
      toReturn = <VotePhase socket={this.props.socket} />;
    } else if (this.state.democracy) {
      toReturn = <VotePhase socket={this.props.socket} democracy={this.state.democracy} />;
    }
    else if (!this.props.hand || !this.props.blackCard) {
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
