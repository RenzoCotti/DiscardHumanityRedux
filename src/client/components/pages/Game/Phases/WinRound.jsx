import React, { Component } from "react";
// import { TSAR_VOTING, TSAR_VOTE } from "../../../../../server/socket/messages";
import Card from "../../../modules/Card";
import PropTypes from "prop-types";

// import Chat from "../../modules/Chat";
// import Hand from "./Views/Hand";
// import { Redirect } from "react-router";

import { connect } from "react-redux";
import {
  getLobbyName,
  getUsername,
  getBlackCard,
} from "../../../../redux/actions";
import Leaderboard from "../../../modules/Leaderboard";
// import Button from "../../../modules/input/Button";
// import CardSelected from "./Views/CardSelected";
// import Button from "../../../modules/input/Button";

class WinRound extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static get propTypes() {
    return {
      winningCard: PropTypes.object,
      blackCard: PropTypes.object,
      scores: PropTypes.array,
      noVote: PropTypes.bool,
      winUsername: PropTypes.string,
      nobodyVoted: PropTypes.bool
    };
  }

  render() {
    let arr = [];
    if (this.props.winningCard) {
      for (let a of this.props.winningCard) {
        if (a !== null) {
          arr.push(a.content);
        }
      }
    }

    let message = "";
    if (this.props.noVote) {
      message = "The Tsar didn't vote last round...";
    } else if (this.props.nobodyVoted) {
      message = "Nobody chose a card.";
    }

    //map over all the black cards
    return (
      <React.Fragment>
        <div className="flex-column">
          {message ? <div>{message}</div> :
            <React.Fragment>
              <div>{this.props.winUsername} won last round.</div>
              <Card
                content={this.props.blackCard.content}
                colour="card-black"
                size="card-big"
                fillGaps={arr}
              />
            </React.Fragment>
          }
          <Leaderboard scores={this.props.scores} />
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
