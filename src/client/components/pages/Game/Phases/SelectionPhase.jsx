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

import {
  USER_CHOICE_TIMEOUT
} from "../../../../../server/socket/utils";

class SelectionPhase extends Component {
  constructor(props) {
    super(props);

    this.sendCards = this.sendCards.bind(this);
    this.lowerTimer = this.lowerTimer.bind(this);

    this.state = {
      waiting: false,
      notVoted: false,
      voted: false,
      setJolly: false,
      error: "",
      timer: USER_CHOICE_TIMEOUT
    };

    this.props.socket.on(CHOICE_RECEIVED, () => {
      // console.log("received");
      this.setState({ waiting: true });
    });

    this.props.socket.on(USER_NO_VOTE, () => {
      if (!this.state.voted) {
        this.setState({ notVoted: true });
      }
    });

    this.timeout = setInterval(this.lowerTimer, 1000);
  }

  lowerTimer() {
    let newTimer = this.state.timer > 0 ? (this.state.timer - 1) : 0;
    this.setState({ timer: newTimer });
  }

  componentWillUnmount() {
    clearInterval(this.timeout);
    this.props.socket.off(CHOICE_RECEIVED);
    this.props.socket.off(USER_NO_VOTE);
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

    let count = 0;
    for (let i = 0; i < this.props.blackCard.pick; i++) {
      if (this.props.selectedCards[i] !== null) {
        count++;
      }
    }

    if (count !== this.props.blackCard.pick) {
      this.setState({ error: "Please choose all cards (" + this.props.blackCard.pick + " needed)." });
      return;
    }

    let hand = this.props.hand;
    let selectedCards = this.props.selectedCards;

    let first = hand[selectedCards[0]];
    let second = hand[selectedCards[1]] ? hand[selectedCards[1]] : null;
    let third = hand[selectedCards[2]] ? hand[selectedCards[2]] : null;

    if (first.jolly || second && second.jolly || third && third.jolly) {
      //todo, force user for input
      this.setState({ setJolly: true });
      return;
    } else {
      this.setState({ setJolly: false });
    }

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
        <div className="flex-row flex-space">
          <div className="title padded-bottom">Pick the best combination.</div>
          <div>Time left: {this.state.timer}</div>
        </div>
        <div className="flex-row flex-around flex-vertical-center flex-wrap padded-bottom">
          {blackCard}
          <br />

          <div className="flex-column">
            <div className="flex-row flex-vertical-center">
              <CardSelected setJolly={this.state.setJolly} />
            </div>
            <Button value="Confirm" short={true} fn={this.sendCards} />
            <div className="errormsg">{this.state.error}</div>
          </div>

          <br />

        </div>
        <Hand />
        <br />
        {this.props.admin ?
          <AdminDashboard socket={this.props.socket} /> :
          ""
        }
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
  updateHand: (value) => dispatch(updateHand(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectionPhase);
