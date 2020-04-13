import React, { Component } from "react";
import Button from "../modules/input/Button";
import Input from "../modules/input/Input";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getLobbyName, updateUserInfo, getUsername } from "../../redux/actions";
import {
  LOBBY_JOINED,
  LOBBY_LOGIN,
  LOBBY_INCORRECT_CREDENTIALS,
} from "../../../server/socket/messages";

class LobbyEntry extends Component {

  constructor(props) {
    super(props);
    this.state = { username: "", password: "", redirect: false };

    this.joinLobby = this.joinLobby.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      password: PropTypes.bool,
      name: PropTypes.string,
      updateUserInfo: PropTypes.func,
      currentUsers: PropTypes.number,
      maxUsers: PropTypes.number,
    };
  }

  joinLobby() {
    // console.log("username " + this.state.username);
    // console.log("lobby " + this.props.name);
    this.props.socket.emit(LOBBY_LOGIN, {
      lobbyName: this.props.name,
      password: this.state.password,
      username: this.state.username,
    });

    this.props.socket.on(LOBBY_JOINED, () => {
      console.log("lobby joined!");

      this.props.updateUserInfo({
        username: this.state.username,
        lobbyName: this.props.name,
      });
      this.setState({ redirect: true });
    });

    this.props.socket.on(LOBBY_INCORRECT_CREDENTIALS, () => {
      console.log("incorrect creds");
    });
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value,
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
        errorMessage: "Please input a shorter username.",
      });
    }

    if (this.props.password) {
      if (!this.state.password || this.state.password.length === 0) {
        arr.push({ name: "password" });
      } else if (this.state.password.length > 64) {
        arr.push({
          name: "password",
          errorMessage: "Please input a shorter password.",
        });
      }
    }

    if (arr.length === 0) {
      this.joinLobby(lobbyName);
    } else {
      this.setState({ errors: arr });
    }
  }

  render() {
    // console.log(this.props);
    // console.log(this.state);
    if (this.state.redirect) {
      return <Redirect push to="/lounge" />;
    }

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
            {this.props.password ? (
              <Input
                label="Password"
                name="password"
                password={true}
                obj={this.state}
                fn={this.handleChange}
                errors={this.state.errors}
              />
            ) :
              ""
            }
          </div>
        ) :
          ""
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateUserInfo: (value) => dispatch(updateUserInfo(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyEntry);
