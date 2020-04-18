import React, { Component } from "react";
// import { TSAR_VOTING, TSAR_VOTE } from "../../../../../server/socket/messages";
// import Card from "../../../modules/Card";
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
// import Button from "../../../modules/input/Button";
// import CardSelected from "./Views/CardSelected";
// import Button from "../../../modules/input/Button";

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
      // username: PropTypes.string,
      // selectedCards: PropTypes.array,
      // hand: PropTypes.array,
      // blackCard: PropTypes.object,
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
    // console.log(this.state.choices);
    //map over all the black cards
    return (
      <React.Fragment>
        <div className="flex-column">
          <div>{this.state.scores[0].username} won!</div>
          {this.state.scores.map((el, index) => (
            <div key={index}>
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
