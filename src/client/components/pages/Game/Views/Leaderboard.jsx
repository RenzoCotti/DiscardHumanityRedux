import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getScores } from "../../../../redux/actions";


class Leaderboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let scores = this.props.scores;

    // console.log(scores);
    if (!scores || scores.length === 0) return <div className="text-center">No scores available.</div>;
    else if (scores && this.props.short) scores = scores.slice(0, 3);

    return (
      <table className="full-width">
        <thead>
          <tr>
            <th></th>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((el, index) => (
            <tr key={index}><td>{index + 1}.</td><td>{el.username}</td><td>{el.score}</td></tr>
          ))}
        </tbody>

      </table>
    );
  }
}

Leaderboard.propTypes = {
  scores: PropTypes.array,
  short: PropTypes.bool
};

const mapStateToProps = (state) => ({
  scores: getScores(state),
});

export default connect(mapStateToProps, null)(Leaderboard);
