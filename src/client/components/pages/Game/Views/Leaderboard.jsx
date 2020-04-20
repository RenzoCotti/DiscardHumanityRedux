import React from "react";
import PropTypes from "prop-types";

const Leaderboard = (props) => {
  let shortArr = props.scores;
  return (
    <table>
      <tr>
        <th></th>
        <th>Username</th>
        <th>Score</th>
      </tr>
      {shortArr.map((el, index) => (
        <tr key={index}><td>{index + 1}.</td><td>{el.username}</td><td>{el.score}</td></tr>
      ))}
    </table>
  );
};

export default Leaderboard;

Leaderboard.propTypes = {
  scores: PropTypes.array,
};