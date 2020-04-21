import React, { Component } from "react";
import { TSAR_VOTING, TSAR_VOTE, DEMOCRACY_VOTE } from "../../../../../server/socket/messages";
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
    this.state = { selected: null, choices: (this.props.democracy ? this.props.democracy : null) };

    this.props.socket.on(TSAR_VOTING, (arr) => {
      this.setState({ choices: arr });
    });
  }

  componentWillUnmount() {
    this.props.socket.off(TSAR_VOTING);
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
      democracy: PropTypes.bool
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


    console.log("voted for " + voted.username);

    // this.setState({ voted: true });
  }

  render() {
    console.log("state: ");
    console.log(this.state);
    if (!this.state.choices) {
      if (this.props.democracy) {
        return <div>Democracy: Waiting for users to pick a card.</div>;
      } else {
        return <div>You&apos;re the Tsar</div>;
      }
    } else if (this.state.choices.length === 0) {
      return <div>No user voted.</div>;
    }


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


    return (
      <React.Fragment>
        <div className="flex-column">
          <div>{!this.props.democracy ? "Tsar: despotically pick the best card." : "Democracy: vote the best card, the majority wins."}</div>
          <div className="flex-row">{arr}</div>
          <Button value="Confirm" fn={this.voteCard} />
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
