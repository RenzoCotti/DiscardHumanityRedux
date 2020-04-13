import React from "react";
import PropTypes from "prop-types";

const Button = props => {
  return (
    <input
      type={"button"}
      value={props.value}
      onClick={props.fn}
      className={props.short ? "short-button button" : "button"}
    />
  );
};

Button.propTypes = {
  value: PropTypes.string,
  short: PropTypes.bool,
  fn: PropTypes.func,
};

export default Button;
