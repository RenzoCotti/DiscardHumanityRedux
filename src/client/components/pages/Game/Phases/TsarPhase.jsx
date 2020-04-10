import React, { Component } from "react";
import { TSAR_VOTING } from "../../../../../server/socket/messages";
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
// import CardSelected from "./Views/CardSelected";
// import Button from "../../../modules/input/Button";

class TsarPhase extends Component {
  state = {};
  constructor(props) {
    super(props);

    this.props.socket.on(TSAR_VOTING, (arr) => {
      console.log("choices");

      this.setState({ choices: arr });
    });
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
    for (let entry of this.state.choices) {
      console.log(entry);
      arr.push(
        <Card
          content={this.props.blackCard.content}
          colour="card-black"
          size="card-big"
          fillGaps={entry.choice}
          key={entry.id}
        />
      );
    }

    // console.log(this.state.choices);
    //map over all the black cards
    return (
      <React.Fragment>
        <div>Tsar choices</div>
        <div>{arr}</div>
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
