import React from "react";
import { capitalise, stringOrEmpty } from "../../../utility/utility";
import { Select as MaterializeSelect } from "react-materialize";
import PropTypes from "prop-types";

//label, name, arr, fn
const Select = props => {
  let temp = stringOrEmpty(props.obj, props.name);
  let val = temp ? capitalise(temp) : "";

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
          <MaterializeSelect onChange={v => props.fn(v, props.name)} value={val}>
            <option value="" />
            {props.customArr
              ? props.customArr
              : props.arr.map(o => {
                if (props.link) {
                  return <option value={capitalise(o)} key={capitalise(o)} data-icon={"./public/images/" + props.link + o + ".png"}
                  >
                    {capitalise(o)}
                  </option>;
                } else {
                  return <option value={capitalise(o)} key={capitalise(o)} >
                    {capitalise(o)}
                  </option>;
                }
              })
            }
          </MaterializeSelect>
        </div>
        <div className="errormsg">
          {error}
        </div>
      </div>
    </div>
  );
};

Select.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  arr: PropTypes.array,
  customArr: PropTypes.array,
  link: PropTypes.string,
  fn: PropTypes.func,
  errors: PropTypes.array,
  obj: PropTypes.object,
};


export default Select;
