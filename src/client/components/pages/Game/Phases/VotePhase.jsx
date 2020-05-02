import React, { Component } from "react";
import { TSAR_VOTING, TSAR_VOTE, DEMOCRACY_VOTE, TSAR_REDRAW, NOT_ENOUGH_POINTS, HAND_REDRAWN } from "../../../../../server/socket/messages";
import { POINTS_FOR_REDRAW } from "../../../../../server/socket/utils";
import Card from "../../../modules/Card";
// import Chat from "../../modules/Chat";
// import Hand from "./Views/Hand";
// import { Redirect } from "react-router";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import {
  getLobbyName,
  getUsername,
  getBlackCard,
} from "../../../../redux/actions";
import Button from "../../../modules/input/Button";
import Timer from "../Views/Timer";
import AdminDashboard from "../Views/AdminDashboard";
// import CardSelected from "./Views/CardSelected";
// import Button from "../../../modules/input/Button";

import {
  TSAR_VOTE_TIMEOUT
} from "../../../../../server/socket/utils";

class VotePhase extends Component {
  constructor(props) {
    super(props);

    this.selectCard = this.selectCard.bind(this);
    this.voteCard = this.voteCard.bind(this);
    this.redrawHand = this.redrawHand.bind(this);
    this.lowerTimer = this.lowerTimer.bind(this);
    this.state = {
      selected: null,
      choices: (this.props.democracy ? this.props.democracy : []),
      error: "",
      timer: TSAR_VOTE_TIMEOUT,
      voted: false
    };

    if (this.state.choices) {
      this.timeout = setInterval(this.lowerTimer, 1000);
    }


    this.props.socket.on(TSAR_VOTING, (arr) => {
      this.setState({ choices: arr });
    });

    this.props.socket.on(NOT_ENOUGH_POINTS, () => {
      this.setState({ error: "Not enough points. You need at least " + POINTS_FOR_REDRAW + "." });
    });

    this.props.socket.on(HAND_REDRAWN, () => {
      this.setState({ error: "", message: "Hand redrawn." });
    });
  }

  componentWillUnmount() {
    clearInterval(this.timeout);
    this.props.socket.off(TSAR_VOTING);
    this.props.socket.off(NOT_ENOUGH_POINTS);
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
      selectedCards: PropTypes.array,
      hand: PropTypes.array,
      blackCard: PropTypes.object,
      democracyCards: PropTypes.array,
      democracy: PropTypes.bool,
      redraw: PropTypes.bool,
      admin: PropTypes.bool
    };
  }

  lowerTimer() {
    let newTimer = this.state.timer > 0 ? (this.state.timer - 1) : 0;
    this.setState({ timer: newTimer });
  }

  selectCard(index) {
    // console.log("selecting " + index);
    this.setState({ selected: index });
  }

  voteCard() {
    if (this.state.selected === null) {
      this.setState({ error: "Please vote a card." });
      return;
    }

    let voted = this.state.choices[this.state.selected];


    if (this.props.democracy) {
      this.props.socket.emit(DEMOCRACY_VOTE, {
        lobbyName: this.props.lobbyName,
        username: this.props.username,
        votedUsername: voted.username,
      });
    } else {
      this.props.socket.emit(TSAR_VOTE, {
        lobbyName: this.props.lobbyName,
        username: voted.username,
        winningCard: voted.choice,
      });
    }

    this.setState({ voted: true });
  }

  redrawHand() {
    if (this.props.redraw) {
      this.props.socket.emit(TSAR_REDRAW, {
        lobbyName: this.props.lobbyName,
        username: this.props.username
      });
    }
  }

  render() {

    let div;
    if (this.state.choices.length === 0) {
      if (this.props.democracy) {
        div = <div className="info-message">Waiting for all users to pick a card combination.</div>;
      } else {
        div = (
          <div className="flex-column flex-horizontal-center">
            <div className="info-message">You&apos;re the Tsar.</div>

            <div className="flex-row flex-vertical-center flex-horizontal-center">
              <div className="padded-right">Current card: </div>
              <Card
                content={this.props.blackCard.content}
                colour="card-black"
                size="card-big"
              />
            </div>
          </div>);
      }
    } else {
      //we have a list of black cards

      let arr = [];


      for (let i = 0; i < this.state.choices.length; i++) {
        let entry = this.state.choices[i];

        //adding fillings for card
        let temp = [];
        for (let card of entry.choice) {
          if (card !== null) {
            temp.push(card.content);
          }
        }

        arr.push(
          <Card
            content={this.props.blackCard.content}
            colour="card-black"
            size="card-big"
            fillGaps={temp}
            key={i}
            hover={true}
            selected={i === this.state.selected ? true : false}
            onClick={() => this.selectCard(i)}
          />
        );
      }

      div =
        (<div className="flex-column">
          <div className="flex-row flex-space">
            <div className="title padded-bottom">{!this.props.democracy ? "Despotically pick the best card." : "Vote the best card, the majority will win."}</div>
            <Timer time={this.state.timer} />
          </div>
          <div className="flex-column padded-bottom">
            <div className="flex-row flex-wrap">
              {arr}
            </div>
            <br />
            <br />
            {this.state.voted ?
              <div className="info-message">You voted.</div> :
              <Button value="Confirm" short={true} fn={this.voteCard} />
            }
            <div className="errormsg">{this.state.error}</div>
          </div>
        </div>);
    }





    return (
      <React.Fragment>
        {div}
        <div className="flex-row flex-wrap">
          {this.props.redraw ? <Button value="Redraw hand" fn={this.redrawHand} /> : ""}
          {this.props.admin ? <AdminDashboard socket={this.props.socket} /> : ""}
        </div>

        <div className="errormsg">{this.state.error}</div>
        <div>{this.state.message}</div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state),
  blackCard: getBlackCard(state),
});

export default connect(mapStateToProps, null)(VotePhase);
