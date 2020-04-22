import React from "react";
import { capitalise, arrOrEmpty } from "../../../utility/utility";
import { Select as MaterializeSelect } from "react-materialize";
import PropTypes from "prop-types";

const MultiSelect = props => {
  let temp = arrOrEmpty(props.obj, props.name);
  // let data = temp ? temp.map(x => capitalise(x)) : [];

  let error = "";
  if (props.errors) {
    props.errors.forEach(el => {
      if (el.name === props.name) {
        if (el.errorMessage && el.errorMessage.length > 0) {
          error = el.errorMessage;
        } else {
          error = "Please select a value.";
        }
      }
    });
  }

  return (
    <div>
      <div className="label-table sub-title">{props.label}</div>
      <div>
        <div>
          <MaterializeSelect
            onChange={val => props.fn(val, props.name, true)}
            multiple
            value={temp}
          >

            {props.arr.map(o => (
              <option value={o} key={o}>
                {capitalise(o)}
              </option>
            ))}
          </MaterializeSelect>
        </div>
        <div className="errormsg">
          {error}
        </div>
      </div>
    </div>
  );
};

MultiSelect.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  arr: PropTypes.array,
  fn: PropTypes.func,
  errors: PropTypes.array,
  obj: PropTypes.object,
};


export default MultiSelect;
