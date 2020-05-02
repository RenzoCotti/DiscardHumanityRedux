import React from "react";
import PropTypes from "prop-types";

const Timer = (props) => {
  let className = props.time <= 5 ? "timer-critical" : (props.time <= 10 ? "timer-warning" : (props.time <= 20 ? "timer-caution" : ""));
  return (<div>Time left: <span className={className}>{props.time}</span></div>);
};

export default Timer;

Timer.propTypes = {
  time: PropTypes.number,
};