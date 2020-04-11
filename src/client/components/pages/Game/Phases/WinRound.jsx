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

class WinRound extends Component {
  state = {};
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props.winningCard);
    let arr = [];
    for (let a of this.props.winningCard) {
      if (a !== null) {
        arr.push(a.content);
      }
    }
    // console.log(this.state.choices);
    //map over all the black cards
    return (
      <React.Fragment>
        <div className="flex-column">
          <div>{this.props.winUsername} won last round.</div>
          <Card
            content={this.props.blackCard.content}
            colour="card-black"
            size="card-big"
            fillGaps={arr}
          />
          {this.props.scores.map((el) => (
            <div>
              {el.username}: {el.score}
            </div>
          ))}
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

export default connect(mapStateToProps, null)(WinRound);
