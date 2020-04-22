import React from "react";
import { stringOrEmpty } from "../../../utility/utility";
import PropTypes from "prop-types";

const TextArea = props => {
  let temp = stringOrEmpty(props.obj, props.name);
  // let val = temp && isNaN(temp) ? capitalise(temp) : temp;

  let error = "";
  if (props.errors) {
    props.errors.forEach(el => {
      if (el.name === props.name) {
        if (el.errorMessage && el.errorMessage.length > 0) {
          error = el.errorMessage;
        } else {
          error = "Please insert a value.";
        }
      }
    });
  }

  return (
    <div>
      <div className="sub-title">{props.label}</div>
      <div>
        <div>
          <textarea
            className="textArea"
            type="text"
            name={props.name}
            onChange={props.fn}
            value={temp}
            autoComplete="off"
          />
        </div>
        <div className="errormsg">
          {error}
        </div>
      </div>
    </div>
  );
};

TextArea.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  fn: PropTypes.func,
  errors: PropTypes.array,
  obj: PropTypes.object,
};

export default TextArea;
