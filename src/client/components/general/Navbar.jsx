import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.getOptions = this.getOptions.bind(this);
  }

  state = {
    options: ["Home", "Lobbies", "Deck Creation", "Login", "About"]
  };

  getOptions() {
    return (
      <React.Fragment>
        {this.state.options.map(op => {
          let link = op.toLowerCase();
          if (op === "Home") {
            return (
              <NavLink exact className="nav-element link" key={op} to="/">
                {op}
              </NavLink>
            );
          } else if (op === "Lobbies") {
            return (
              <NavLink exact className="nav-element link" key={op} to="/lobby">
                {op}
              </NavLink>
            );
          } else if (op === "Deck Creation") {
            return (
              <NavLink
                exact
                className="nav-element link"
                key={op}
                to="/deck-creation"
              >
                {op}
              </NavLink>
            );
          }

          return (
            <NavLink className="nav-element link" key={op} to={"/" + link}>
              {op}
            </NavLink>
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    return <div className="navbar">{this.getOptions()}</div>;
  }
}

export default Navbar;
