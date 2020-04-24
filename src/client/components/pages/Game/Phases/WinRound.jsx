import React, { Component } from "react";
import Card from "../../../modules/Card";
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
    // console.log(this.props.multipleWinners);
  }

  static get propTypes() {
    return {
      winningCard: PropTypes.array,
      blackCard: PropTypes.object,
      scores: PropTypes.array,
      noVote: PropTypes.bool,
      winUsername: PropTypes.string,
      nobodyVoted: PropTypes.bool,
      multipleWinners: PropTypes.bool
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
    } else if (this.props.multipleWinners) {
      message = "There was a tie, a coin flip decided " + this.props.winUsername + " won";
    }

    //map over all the black cards
    return (
      <React.Fragment>
        <div className="flex-column">
          {message ? <div className="title">{message}</div> :
            <React.Fragment>
              <div className="title padded-bottom">{this.props.winUsername} won last round.</div>
              <Card
                content={this.props.blackCard.content}
                colour="card-black"
                size="card-big"
                fillGaps={arr}
              />
            </React.Fragment>
          }
          <br />
          <br />
          <br />
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
