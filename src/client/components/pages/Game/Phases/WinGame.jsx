import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getLobbyName,
  getUsername,
  getBlackCard,
} from "../../../../redux/actions";
import Leaderboard from "../Views/Leaderboard";


class WinRound extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state = { scores: this.props.scores.sort(this.compare) };
  }

  static get propTypes() {
    return {
      // socket: PropTypes.object,
      scores: PropTypes.array,
      winner: PropTypes.string
    };
  }

  compare(a, b) {
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    return 0;
  }

  render() {
    if (!this.state.scores) return <div>Waiting for scores...</div>;

    let winner;
    if (this.props.winner) {
      winner = this.props.winner + " won!";
    } else {
      if (this.state.scores.length > 1) {
        if (this.state.scores[0].score === this.state.scores[1].score) {
          //tie
          winner = "It's a tie!";
        } else {
          winner = this.state.scores[0].username + " won!";
        }
      }
    }

    return (
      <React.Fragment>
        <div className="flex-column">
          <div className="title">{winner}</div>
          {!this.state.winner ?
            <Leaderboard scores={this.state.scores} />
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

export default connect(mapStateToProps, null)(WinRound);
