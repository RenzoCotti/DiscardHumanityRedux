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
// import CardSelected from "./Views/CardSelected";
// import Button from "../../../modules/input/Button";

class VotePhase extends Component {
  constructor(props) {
    super(props);

    this.selectCard = this.selectCard.bind(this);
    this.voteCard = this.voteCard.bind(this);
    this.redrawHand = this.redrawHand.bind(this);
    this.state = { selected: null, choices: (this.props.democracy ? this.props.democracy : []), error: "" };

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
      redraw: PropTypes.bool
    };
  }

  selectCard(index) {
    // console.log("selecting " + index);
    this.setState({ selected: index });
  }

  voteCard() {
    if (this.state.selected === null) return;
    // console.log(this.state);

    // console.log("voted ");
    let voted = this.state.choices[this.state.selected];

    if (this.props.democracy) {
      this.props.socket.emit(DEMOCRACY_VOTE, {
        lobbyName: this.props.lobbyName,
        votedUsername: voted.username,
        username: this.props.username
      });
    } else {
      this.props.socket.emit(TSAR_VOTE, {
        lobbyName: this.props.lobbyName,
        username: voted.username,
        winningCard: voted.choice,
      });
    }


    // console.log("voted for " + voted.username);

    // this.setState({ voted: true });
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
        div = <div className="info-message">You&apos;re the Tsar.</div>;
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
          <div className="title padded-bottom">{!this.props.democracy ? "Despotically pick the best card." : "Vote the best card, the majority will win."}</div>
          <div className="flex-column padded-bottom">
            <div className="flex-row">
              {arr}
            </div>
            <Button value="Confirm" fn={this.voteCard} />
          </div>
        </div>);
    }





    return (
      <React.Fragment>
        <div className="flex-column">
          {div}
          {this.props.redraw ? <Button value="Redraw hand" fn={this.redrawHand} /> : ""}
          <div className="errormsg">{this.state.error}</div>
          <div>{this.state.message}</div>
        </div>
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
