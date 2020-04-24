import React from "react";
import PropTypes from "prop-types";

const Leaderboard = (props) => {
  let shortArr = props.scores;
  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {shortArr.map((el, index) => (
          <tr key={index}><td>{index + 1}.</td><td>{el.username}</td><td>{el.score}</td></tr>
        ))}
      </tbody>

    </table>
  );
};

export default Leaderboard;

Leaderboard.propTypes = {
  scores: PropTypes.array,
};