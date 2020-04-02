import React, { Component } from "react";
import { Redirect } from "react-router";
import Button from "./input/Button";
import Input from "./input/Input";
import { connect } from "react-redux";
import {
  getSocket,
  updateLobbyName,
  updateUsername,
  getUsername,
  getLobbyName
} from "../../redux/actions";

class CreateLobby extends Component {
  state = {
    maxUsers: 4,
    lobbyName: "",
    username: "",
    password: "",
    confirmPassword: ""
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    // this.props.socket.on("lobby-created", () => {
    //   // this.props.socket.emit("lobby-get-list");
    //   this.setState({
    //     lobbyName: "",
    //     password: "",
    //     maxUsers: "",
    //     username: "",
    //     confirmPassword: ""
    //   });
    // });

    this.props.socket.on("lobby-exists-already", () => {
      this.setState({ errors: [{ lobbyName: "Lobby name exists already." }] });
    });

    this.props.socket.on("lobby-created", info => {
      console.log("lobby created!");
      this.props.updateLobbyName(this.state.lobbyName);
      this.props.updateUsername(this.state.username);
    });
  }

  onSubmit(e) {
    if (e) e.preventDefault();

    let arr = [];

    if (!this.state.lobbyName || this.state.lobbyName.length === 0) {
      arr.push({ name: "lobbyName" });
    } else if (this.state.lobbyName.length > 64) {
      arr.push({
        name: "lobbyName",
        errorMessage: "Please input a shorter lobby name."
      });
    }

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

    if (this.state.password !== this.state.confirmPassword) {
      arr.push({
        name: "confirmPassword",
        errorMessage: "The two passwords don't match"
      });
    }

    if (!this.state.maxUsers) {
      arr.push({ name: "maxUsers" });
    } else if (this.state.maxUsers > 20 || this.state.maxUsers < 2) {
      arr.push({
        name: "maxUsers",
        errorMessage: "The number of players has to be 2-20"
      });
    }

    if (arr.length === 0) {
      delete this.state.errors;
      console.log("creating lobby...");
      // this.props.updateLobbyName(this.state.lobbyName);
      // this.props.updateUsername(this.state.username);
      this.props.socket.emit("lobby-new", this.state);
    } else {
      this.setState({ errors: arr });
    }
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value
    });
  }

  render() {
    if (
      this.props.username === this.state.username &&
      this.props.lobbyName === this.state.lobbyName
    ) {
      return <Redirect push to="/deck-selection" />;
    }

    return (
      <div className="create-lobby">
        <div className="title padded-bottom">Create Lobby</div>
        <form onSubmit={this.onSubmit}>
          <div className="flex-column">
            <div className="flex-row">
              <div className="flex-column padded-right">
                <Input
                  label="Lobby name"
                  name="lobbyName"
                  obj={this.state}
                  fn={this.handleChange}
                  errors={this.state.errors}
                />
                <Input
                  label="Max Players"
                  name="maxUsers"
                  obj={this.state}
                  fn={this.handleChange}
                  errors={this.state.errors}
                />
              </div>

              <div className="flex-column">
                <Input
                  label="Lobby password"
                  name="password"
                  password={true}
                  obj={this.state}
                  fn={this.handleChange}
                  errors={this.state.errors}
                />
                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  password={true}
                  obj={this.state}
                  fn={this.handleChange}
                  errors={this.state.errors}
                />
              </div>
            </div>

            <br />
            <br />

            <div className="padded-right">
              <Input
                label="Username"
                name="username"
                obj={this.state}
                fn={this.handleChange}
                errors={this.state.errors}
              />
              <div className="errormsg" style={{ height: "30px" }}>
                {this.state.error}
              </div>

              <Button value="Create Lobby" fn={this.onSubmit} />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  socket: getSocket(state),
  username: getUsername(state),
  lobbyName: getLobbyName(state)
});

const mapDispatchToProps = dispatch => ({
  updateUsername: value => dispatch(updateUsername(value)),
  updateLobbyName: value => dispatch(updateLobbyName(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateLobby);
