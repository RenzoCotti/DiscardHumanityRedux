import React, { Component } from "react";
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
import SelectionPhase from "./Phases/SelectionPhase";

import {
  NEW_BLACK_CARD,
  NEW_HAND,
  LOBBY_NOT_FOUND,
  CHECK_START,
  LOBBY_LEAVE,
} from "../../../../server/socket/messages";

class GamePage extends Component {
  state = {};
  constructor(props) {
    super(props);

    this.props.socket.on(NEW_BLACK_CARD, (card) => {
      this.props.updateBlackCard(card);
    });

    this.props.socket.on(NEW_HAND, (hand) => {
      this.props.updateHand(hand);
    });

    this.props.socket.on(LOBBY_NOT_FOUND, () => {
      this.setState({ home: true });
    });

    this.props.socket.emit(CHECK_START, this.props.lobbyName);
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
