import React from "react";
import { capitalise, arrOrEmpty } from "../../../../utility/utility";
import { Select as MaterializeSelect } from "react-materialize";

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
    <div className="row-table">
      <div className="label-table sub-title">{props.label}</div>
      <div className="content-table">
        <div className="content-inner">
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

export default MultiSelect;
