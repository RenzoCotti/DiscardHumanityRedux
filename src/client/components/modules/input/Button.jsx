import React from "react";

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

export default Button;
