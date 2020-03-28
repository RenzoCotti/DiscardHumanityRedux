import React, { Component } from "react";
import Button from "../modules/input/Button";
import Input from "../modules/input/Input";

class LobbyEntry extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.joinLobby = this.joinLobby.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.setupSocket();
  }

  setupSocket() {
    // this.socket.on("lobby-joined", () => {
    //   console.log("lobby joined!");
    //   this.socket.emit("lobby-get-list");
    // });
  }

  joinLobby(lobbyName) {
    // console.log(lobbyName);

    this.socket.emit("lobby-login", {
      lobbyName: lobbyName,
      password: this.state.password,
      userName: this.state.username
    });
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value
    });
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      this.validate();
    }
  }

  validate(lobbyName) {
    let arr = [];
    if (!this.state.username || this.state.username.length === 0) {
      arr.push({ name: "username" });
    } else if (this.state.username.length > 64) {
      arr.push({
        name: "username",
        errorMessage: "Please input a shorter username."
      });
    }

    if (!this.state.password || this.state.password.length === 0) {
      arr.push({ name: "password" });
    } else if (this.state.password.length > 64) {
      arr.push({
        name: "password",
        errorMessage: "Please input a shorter password."
      });
    }

    if (arr.length === 0) {
      this.joinLobby(lobbyName);
    } else {
      this.setState({ errors: arr });
    }
  }

  render() {
    return (
      <div className="lobby-entry border-bottom">
        <div className="flex-row">
          <div className="lobby-info">
            <div>{this.props.name}</div>
            <div className="sub-title padded-bottom">
              {this.props.currentUsers}/{this.props.maxUsers} players
            </div>
          </div>

          {this.state.selected === this.props.name &&
          this.props.currentUsers < this.props.maxUsers ? (
            <div className="flex-column">
              <Button
                value="Join"
                short="true"
                fn={() => {
                  this.validate(this.props.name);
                }}
              />
              <Button
                value="Close"
                short="true"
                fn={() => {
                  this.setState({ selected: "" });
                }}
              />
            </div>
          ) : (
            <Button
              value="Details"
              short="true"
              fn={() => {
                this.setState({ selected: this.props.name });
              }}
            />
          )}
        </div>

        {this.state.selected === this.props.name ? (
          <div className="flex-column">
            <Input
              label="Username"
              name="username"
              obj={this.state}
              fn={this.handleChange}
              errors={this.state.errors}
            />
            <Input
              label="Password"
              name="password"
              password={true}
              obj={this.state}
              fn={this.handleChange}
              errors={this.state.errors}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default LobbyEntry;
