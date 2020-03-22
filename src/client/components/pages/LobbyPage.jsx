import React, { Component } from "react";
import Button from "../modules/input/Button";
import Input from "../modules/input/Input";

class LobbyPage extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.joinLobby = this.joinLobby.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.socket.emit("lobby-get-list");
    this.setupSocket();
  }

  setupSocket() {
    this.socket.on("lobby-list", list => {
      this.setState({ lobbies: list });
    });
    this.socket.on("lobby-joined", () => {
      console.log("lobby joined!");
      this.socket.emit("lobby-get-list");
    });
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
    let list;
    if (this.state.lobbies && this.state.lobbies.length > 0) {
      list = this.state.lobbies.map(el => {
        return (
          <div className="lobby-entry" key={el.name}>
            <div className="lobby-info">
              <div>{el.name}</div>
              <div>
                {el.currentUsers}/{el.maxUsers} players
              </div>
            </div>

            <Button
              value="Join"
              short="true"
              fn={() => {
                this.validate(el.name);
              }}
            />
          </div>
        );
      });
      let temp = [];
      for (let a of list) {
        temp.push(a);
        temp.push(a);
        temp.push(a);
        temp.push(a);
        temp.push(a);
        temp.push(a);
        temp.push(a);
        temp.push(a);
      }
      list = temp;
    }

    return (
      <React.Fragment>
        <div className="lobby-list">{list ? list : "No entries here"}</div>

        {/* <div className="errormsg"></div> */}
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
        {/* </div> */}
      </React.Fragment>
    );
  }
}

export default LobbyPage;
