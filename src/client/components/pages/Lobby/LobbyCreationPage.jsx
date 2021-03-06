import React, { Component } from "react";
// import { Redirect } from "react-router";
import Button from "../../modules/input/Button";
import Input from "../../modules/input/Input";
import Select from "../../modules/input/Select";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getUsername, getLobbyName, updateUserInfo, updateLobbyType } from "../../../redux/actions";
import {
  LOBBY_EXISTS_ALREADY,
  LOBBY_CREATED,
  LOBBY_NEW,
} from "../../../../server/socket/messages";
import {
  RANDO_USERNAME
} from "../../../../server/socket/internal";
import { MIN_USERS } from "../../../../server/socket/utils";
import Navbar from "../../general/Navbar";
import { Redirect } from "react-router";
class LobbyCreationPage extends Component {


  constructor(props) {
    super(props);
    this.state = {
      maxUsers: 4,
      lobbyName: "",
      username: "",
      password: "",
      confirmPassword: "",
      private: "no",
      ending: "turns",
      points: 5,
      meritocracy: "no",
      redraw: "no",
      voting: "tsar",
      rando: "no",
      jolly: "no",
      jollyNumber: 0
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);


    this.props.socket.on(LOBBY_EXISTS_ALREADY, () => {
      // console.log("here");
      this.setState({ errors: [{ name: "lobbyName", errorMessage: "Lobby name exists already." }] });
    });

    this.props.socket.on(LOBBY_CREATED, (info) => {
      // console.log("lobby created!");
      // console.log(info);
      this.setState({ redirect: true });

      this.props.updateUserInfo({
        username: this.state.username,
        lobbyName: info,
      });
    });
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      updateUserInfo: PropTypes.func,
      updateLobbyType: PropTypes.func,
      username: PropTypes.string,
      lobbyName: PropTypes.string
    };
  }

  componentWillUnmount() {
    this.props.socket.off(LOBBY_EXISTS_ALREADY);
    this.props.socket.off(LOBBY_CREATED);
  }

  onSubmit(e) {
    if (e) e.preventDefault();

    let arr = [];

    if (!this.state.lobbyName || this.state.lobbyName.length === 0) {
      arr.push({ name: "lobbyName" });
    } else if (this.state.lobbyName.length > 32) {
      arr.push({
        name: "lobbyName",
        errorMessage: "Please input a shorter lobby name.",
      });
    }

    if (!this.state.username || this.state.username.length === 0) {
      arr.push({ name: "username" });
    } else if (this.state.username.length > 24) {
      arr.push({
        name: "username",
        errorMessage: "Please input a shorter username.",
      });
    } else if (this.state.username === RANDO_USERNAME) {
      arr.push({
        name: "username",
        errorMessage: "Please choose a different username.",
      });
    }

    if (!this.state.private) {
      arr.push({ name: "private" });
    } else if (this.state.private === "yes") {
      if (!this.state.password || this.state.password.length === 0) {
        arr.push({ name: "password" });
      } else if (this.state.password.length > 32) {
        arr.push({
          name: "password",
          errorMessage: "Please input a shorter password.",
        });
      }

      if (this.state.password !== this.state.confirmPassword) {
        arr.push({
          name: "confirmPassword",
          errorMessage: "The two passwords don't match.",
        });
      }
    }


    if (!this.state.maxUsers) {
      arr.push({ name: "maxUsers" });
    } else if (isNaN(this.state.maxUsers)) {
      arr.push({
        name: "maxUsers",
        errorMessage: "Please input a number.",
      });
    } else if (this.state.maxUsers > 20 || this.state.maxUsers < MIN_USERS) {
      arr.push({
        name: "maxUsers",
        errorMessage: "The number of players has to be " + MIN_USERS + "-20.",
      });
    }

    if (!this.state.voting) {
      arr.push({ name: "voting" });
    }

    if (!this.state.ending) {
      arr.push({ name: "ending" });
    }

    if (!this.state.rando) {
      arr.push({ name: "rando" });
    }

    if (!this.state.jolly) {
      arr.push({ name: "jolly" });
    } else if (this.state.jolly === "yes") {
      if (!this.state.jollyNumber) {
        arr.push({ name: "jollyNumber" });
      } else if (this.state.jollyNumber < 0) {
        arr.push({
          name: "jollyNumber",
          errorMessage: "The number jolly cards has to be above 0.",
        });
      }
    }


    if (this.state.ending !== "haiku") {
      if (!this.state.points) {
        arr.push({ name: "points" });
      } else if (isNaN(this.state.points)) {
        arr.push({
          name: "points",
          errorMessage: "Please input a number.",
        });
      } else if (this.state.points < 0) {
        arr.push({
          name: "points",
          errorMessage: "Please input a value bigger than 0.",
        });
      }
    }


    if (this.state.voting === "tsar") {
      if (!this.state.meritocracy) {
        arr.push({ name: "meritocracy" });
      } else if (!this.state.redraw) {
        arr.push({ name: "redraw" });
      }
    }


    if (arr.length === 0) {
      delete this.state.errors;
      console.log("creating lobby...");
      this.props.socket.emit(LOBBY_NEW, this.state);
      this.props.updateLobbyType(this.state.voting);
    } else {
      this.setState({ errors: arr });
    }
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value,
    });
  }

  handleSelect(e, name) {
    this.setState({
      [name]: e.target.value.toLowerCase()
    });
    return;
  }

  render() {
    if (this.props.username && this.props.lobbyName) {
      return <Redirect push to="/lounge" />;
    } else if (this.state.help) {
      return <Redirect push to="/rules" />;
    }

    // console.log(this.state);

    return (
      <React.Fragment>
        <Navbar />
        <div className="main-container">
          <div className="flex-column flex-horizontal-center ">
            <div className="title padded-bottom padded-right text-center">Create Lobby</div>
            <div className="flex-row flex-wrap  flex-horizontal-center flex-start-vert">
              <div className="flex-column">
                <div className="flex-row flex-wrap flex-horizontal-center">
                  <div className="flex-column padded-right padded-bottom">
                    <Input
                      label="Lobby name"
                      name="lobbyName"
                      obj={this.state}
                      fn={this.handleChange}
                      errors={this.state.errors}
                    />
                    <Input
                      label={"Players (" + MIN_USERS + "-20)"}
                      name="maxUsers"
                      obj={this.state}
                      fn={this.handleChange}
                      errors={this.state.errors}
                    />
                  </div>
                  <div className="flex-column padded-right padded-bottom">
                    <Select
                      label="Private"
                      name="private"
                      arr={["no", "yes"]}
                      fn={this.handleSelect}
                      obj={this.state}
                      errors={this.state.errors}
                    />
                    {this.state.private === "yes" ?
                      <React.Fragment>
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
                      </React.Fragment>
                      : ""}

                  </div>
                </div>
              </div>

              <div className="flex-column padded-right padded-bottom  flex-horizontal-center">
                <Select
                  label="Voting system"
                  name="voting"
                  arr={["tsar", "democracy"]}
                  fn={this.handleSelect}
                  obj={this.state}
                  errors={this.state.errors}
                />

                {this.state.voting === "tsar" ?
                  <React.Fragment>
                    <Select
                      label="Meritocracy"
                      name="meritocracy"
                      arr={["yes", "no"]}
                      fn={this.handleSelect}
                      obj={this.state}
                      errors={this.state.errors}
                    />
                    <Select
                      label="Hand redrawing"
                      name="redraw"
                      arr={["yes", "no"]}
                      fn={this.handleSelect}
                      obj={this.state}
                      errors={this.state.errors}
                    />
                  </React.Fragment>
                  : ""}
              </div>

              <div className="flex-column padded-right padded-bottom  flex-horizontal-center">

                {/* "Russian Roulette" */}
                <Select
                  label="Ending"
                  name="ending"
                  arr={["score", "turns", "haiku"]}
                  fn={this.handleSelect}
                  obj={this.state}
                  errors={this.state.errors}
                />
                {this.state.ending === "score" || this.state.ending === "turns" ?
                  <Input
                    label={"Target " + (this.state.ending)}
                    name="points"
                    obj={this.state}
                    fn={this.handleChange}
                    errors={this.state.errors}
                  /> : ""}
                {/* russianRoulette for points */}
                {/*jollyCards */}
              </div>

              <div className="flex-column padded-right padded-bottom  flex-horizontal-center">

                <Select
                  label={RANDO_USERNAME}
                  name="rando"
                  arr={["yes", "no"]}
                  fn={this.handleSelect}
                  obj={this.state}
                  errors={this.state.errors}
                />

                <Select
                  label="Jolly cards"
                  name="jolly"
                  arr={["yes", "no"]}
                  fn={this.handleSelect}
                  obj={this.state}
                  errors={this.state.errors}
                />
                {this.state.jolly === "yes" ?
                  <Input
                    label="Number of jolly cards"
                    name="jollyNumber"
                    obj={this.state}
                    fn={this.handleChange}
                    errors={this.state.errors}
                  /> : ""}
              </div>

            </div>
            <br />
            <br />


            <div className="padded-right flex-column flex-vertical-center">
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

              <div className="flex-row flex-wrap flex-horizontal-center">
                <Button value="Need help?" fn={() => this.setState({ help: true })} />
                <Button value="Create Lobby" fn={this.onSubmit} />
              </div>
            </div>


          </div>
        </div>
      </React.Fragment>

    );
  }
}

const mapStateToProps = (state) => ({
  username: getUsername(state),
  lobbyName: getLobbyName(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateUserInfo: (value) => dispatch(updateUserInfo(value)),
  updateLobbyType: (value) => dispatch(updateLobbyType(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyCreationPage);
