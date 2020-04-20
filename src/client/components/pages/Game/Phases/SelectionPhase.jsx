import React, { Component } from "react";
import Card from "../../../modules/Card";
import Hand from "../Views/Hand";
import PropTypes from "prop-types";


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
import AdminDashboard from "../Views/AdminDashboard";

import {
  CHOICE_RECEIVED,
  CHOICE,
  USER_NO_VOTE
} from "../../../../../server/socket/messages";

class SelectionPhase extends Component {
  constructor(props) {
    super(props);

    this.sendCards = this.sendCards.bind(this);
    this.state = {
      waiting: false,
      notVoted: false,
      voted: false
    };

    this.props.socket.on(CHOICE_RECEIVED, () => {
      console.log("received");
      this.setState({ waiting: true });
    });

    this.props.socket.on(USER_NO_VOTE, () => {
      if (!this.state.voted) {
        this.setState({ notVoted: true });
      }
    });

  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
      selectedCards: PropTypes.array,
      hand: PropTypes.array,
      blackCard: PropTypes.object,
      admin: PropTypes.bool
    };
  }


  sendCards() {
    let hand = this.props.hand;
    let selectedCards = this.props.selectedCards;

    let first = hand[selectedCards[0]];
    let second = hand[selectedCards[1]] ? hand[selectedCards[1]] : null;
    let third = hand[selectedCards[2]] ? hand[selectedCards[2]] : null;

    this.props.socket.emit(CHOICE, {
      lobbyName: this.props.lobbyName,
      username: this.props.username,
      choice: [first, second, third],
    });
    this.setState({ voted: true });
  }

  render() {
    if (this.state.waiting) {
      return <div>Waiting for the Tsar to vote...</div>;
    } else if (this.state.voted) {
      return <div>Waiting for others to vote...</div>;
    } else if (this.state.notVoted) {
      return <div>You haven&apos;t voted in time :/</div>;
    }

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
        <div className="flex-column">
          <div className="flex-row">
            {blackCard}
            <CardSelected />
            <Button value="Confirm" fn={this.sendCards} />
          </div>
          <Hand />
          {this.props.admin ?
            <AdminDashboard socket={this.props.socket} /> : ""}
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
