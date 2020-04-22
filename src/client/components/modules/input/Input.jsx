import React from "react";
import { stringOrEmpty } from "../../../utility/utility";
import PropTypes from "prop-types";

/**
 * input text field
 *
 * label is the text that gets displayed on the left
 * text is the aftertext for short fields
 * name is the API name of the plant field we're editing
 * fn is the change function
 * obj is the optional obj to prefill the value (if obj, we do obj[name], else "")
 * */

const Input = props => {
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
          <input
            className={props.customClass ? props.customClass + " input" : "input"}
            type={props.password ? "password" : "text"}
            name={props.name}
            onChange={props.fn}
            value={temp}
            autoComplete="off"
            required={props.required}
          />
        </div>
        <div className="errormsg">
          {error}
        </div>
      </div>
    </div>
  );
};

Input.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  customClass: PropTypes.string,
  password: PropTypes.string,
  fn: PropTypes.func,
  required: PropTypes.bool,
  errors: PropTypes.array,
  obj: PropTypes.object,
};

export default Input;


