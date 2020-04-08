import React, { Component } from "react";
import Card from "../../../modules/Card";
import Chat from "../../../modules/Chat";
import Hand from "../Views/Hand";
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
} from "../../../../redux/actions";
import CardSelected from "../Views/CardSelected";
import Button from "../../../modules/input/Button";

class SelectionPhase extends Component {
  state = {};
  constructor(props) {
    super(props);
  }

  render() {
    let hand = this.props.hand;
    let selectedCards = this.props.selectedCards;

    let first = hand[selectedCards[0]] ? hand[selectedCards[0]].content : [];
    let second = hand[selectedCards[1]] ? hand[selectedCards[1]].content : [];
    let third = hand[selectedCards[2]] ? hand[selectedCards[2]].content : [];

    let blackCard = (
      <Card
        content={this.props.blackCard.content}
        colour="card-black"
        size="card-big"
        fillGaps={[first, second, third]}
      />
    );

    return (
      <React.Fragment>
        <div className="flex-row">
          <div className="flex-column">
            <div className="flex-row">
              {blackCard}
              <CardSelected />
              <Button value="Confirm" fn={() => {}} />
            </div>
            <Hand />
          </div>

          <Chat socket={this.props.socket} />
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectionPhase);