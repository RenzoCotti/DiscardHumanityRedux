import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getLobbyName,
  getUsername,
  getBlackCard,
} from "../../../../redux/actions";
import Leaderboard from "../Views/Leaderboard";
import Card from "../../../modules/Card";

import { RANDO_USERNAME } from "../../../../../server/socket/utils";


class WinGame extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static get propTypes() {
    return {
      // socket: PropTypes.object,
      scores: PropTypes.array,
      winner: PropTypes.string,
      winningCard: PropTypes.array,
      blackCard: PropTypes.object
    };
  }

  render() {
    if (!this.props.scores) return <div>Waiting for scores...</div>;

    let winner;
    if (this.props.winner && this.props.winner === RANDO_USERNAME) {
      winner = "Wow guys, really? You got beaten by a bot randomly picking cards. Wow.";
    } else if (this.props.winner) {
      winner = this.props.winner + " won!";
    } else {
      if (this.props.scores.length > 1) {
        if (this.props.scores[0].score === this.props.scores[1].score) {
          //tie
          winner = "It's a tie!";
        } else {
          winner = this.props.scores[0].username + " won!";
        }
      }
    }

    let arr = [];
    if (this.props.winningCard) {
      for (let a of this.props.winningCard) {
        if (a !== null) {
          arr.push(a.content);
        }
      }
    }

    return (
      <React.Fragment>
        <div className="flex-column">
          <div className="title padded-bottom">{winner}</div>
          <Card
            content={this.props.blackCard.content}
            colour="card-black"
            size="card-big"
            fillGaps={arr}
          />
          <br />
          <br />
          {!this.props.winner ?
            <Leaderboard scores={this.props.scores} />
            : ""}
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

export default connect(mapStateToProps, null)(WinGame);
