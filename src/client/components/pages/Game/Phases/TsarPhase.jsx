import React, { Component } from "react";
import { TSAR_VOTING, TSAR_VOTE } from "../../../../../server/socket/messages";
import Card from "../../../modules/Card";
// import Chat from "../../modules/Chat";
// import Hand from "./Views/Hand";
// import { Redirect } from "react-router";

import { connect } from "react-redux";
import {
  getLobbyName,
  getUsername,
  getBlackCard,
} from "../../../../redux/actions";
import Button from "../../../modules/input/Button";
// import CardSelected from "./Views/CardSelected";
// import Button from "../../../modules/input/Button";

class TsarPhase extends Component {
  state = { selected: null, choices: null };
  constructor(props) {
    super(props);

    this.selectCard = this.selectCard.bind(this);
    this.voteCard = this.voteCard.bind(this);

    this.props.socket.on(TSAR_VOTING, (arr) => {
      this.setState({ choices: arr });
    });
  }

  selectCard(index) {
    // console.log("selecting " + index);
    this.setState({ selected: index });
  }

  voteCard() {
    if (this.state.selected === null) return;

    // console.log("voted ");
    let voted = this.state.choices[this.state.selected];
    // console.log(voted);

    this.props.socket.emit(TSAR_VOTE, {
      lobbyName: this.props.lobbyName,
      winningCard: voted,
    });
    console.log("voted for " + voted.id);

    // this.setState({ voted: true });
  }

  render() {
    if (!this.state.choices) return <div>You're the Tsar</div>;
    // let first = hand[selectedCards[0]] ? hand[selectedCards[0]].content : [];
    // let second = hand[selectedCards[1]] ? hand[selectedCards[1]].content : [];
    // let third = hand[selectedCards[2]] ? hand[selectedCards[2]].content : [];

    // let blackCard = (
    //   <Card
    //     content={this.props.blackCard.content}
    //     colour="card-black"
    //     size="card-big"
    //     fillGaps={[first, second, third]}
    //   />
    // );

    let arr = [];
    for (let i = 0; i < this.state.choices.length; i++) {
      let entry = this.state.choices[i];
      arr.push(
        <Card
          content={this.props.blackCard.content}
          colour="card-black"
          size="card-big"
          fillGaps={entry.choice}
          key={i}
          hover={true}
          selected={i === this.state.selected ? true : ""}
          onClick={() => this.selectCard(i)}
        />
      );
    }

    // console.log(this.state.choices);
    //map over all the black cards
    return (
      <React.Fragment>
        <div className="flex-column">
          <div>Tsar choices</div>
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

export default connect(mapStateToProps, null)(TsarPhase);
