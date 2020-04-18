import React, { Component } from "react";
import { Redirect } from "react-router";
import Button from "../modules/input/Button";
import Input from "../modules/input/Input";
import Select from "../modules/input/Select";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getUsername, getLobbyName, updateUserInfo } from "../../redux/actions";
import {
  LOBBY_EXISTS_ALREADY,
  LOBBY_CREATED,
  LOBBY_NEW,
} from "../../../server/socket/messages";

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
      points: "5",
      meritocracy: "no",
      voting: "tsar"
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);


    this.props.socket.on(LOBBY_EXISTS_ALREADY, () => {
      this.setState({ errors: [{ lobbyName: "Lobby name exists already." }] });
    });

    this.props.socket.on(LOBBY_CREATED, (info) => {
      console.log("lobby created!");
      this.setState({ redirect: true });

      // console.log(this.state);
      // this.updatePersistence(this.state.username, info, this.state.password);
      this.props.updateUserInfo({
        username: this.state.username,
        lobbyName: info,
      });
    });
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      updateUserInfo: PropTypes.func
    };
  }

  // async updatePersistence(username, lobbyName, password) {
  //   let req = await fetch("/api/persist/login", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       username: username,
  //       lobbyName: lobbyName,
  //       password: password
  //     })
  //   });

  //   let code = req.status;
  //   if (code === 200) {
  //     console.log("persistence set!");
  //     // let res = await req.json();
  //     // this.setState({ decks: res });
  //   } else {
  //     // this.setState({ error: true });
  //   }
  // }

  onSubmit(e) {
    if (e) e.preventDefault();

    let arr = [];

    if (!this.state.lobbyName || this.state.lobbyName.length === 0) {
      arr.push({ name: "lobbyName" });
    } else if (this.state.lobbyName.length > 64) {
      arr.push({
        name: "lobbyName",
        errorMessage: "Please input a shorter lobby name.",
      });
    }

    if (!this.state.username || this.state.username.length === 0) {
      arr.push({ name: "username" });
    } else if (this.state.username.length > 64) {
      arr.push({
        name: "username",
        errorMessage: "Please input a shorter username.",
      });
    }

    if (this.state.private === "yes") {
      if (!this.state.password || this.state.password.length === 0) {
        arr.push({ name: "password" });
      } else if (this.state.password.length > 64) {
        arr.push({
          name: "password",
          errorMessage: "Please input a shorter password.",
        });
      }

      if (this.state.password !== this.state.confirmPassword) {
        arr.push({
          name: "confirmPassword",
          errorMessage: "The two passwords don't match",
        });
      }
    }



    if (!this.state.maxUsers) {
      arr.push({ name: "maxUsers" });
    } else if (this.state.maxUsers > 20 || this.state.maxUsers < 2) {
      arr.push({
        name: "maxUsers",
        errorMessage: "The number of players has to be 2-20",
      });
    }

    if (!this.state.voting) {
      arr.push({ name: "maxUsers" });
    }

    if (!this.state.ending) {
      arr.push({ name: "maxUsers" });
    }

    if (arr.length === 0) {
      delete this.state.errors;
      console.log("creating lobby...");
      this.props.socket.emit(LOBBY_NEW, this.state);
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
    if (this.state.redirect) {
      return <Redirect push to="/deck-selection" />;
    }

    // console.log(this.state);

    return (
      <div className="create-lobby">
        <div className="title padded-bottom">Create Lobby</div>
        <form onSubmit={this.onSubmit}>
          <div className="flex-row">
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

                  <br />
                  <br />
                  <br />
                  <br />


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
                <div className="flex-column">
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

            <div className="flex-column">
              <Select
                label="Voting system"
                name="voting"
                arr={["tsar", "democracy"]}
                fn={this.handleSelect}
                obj={this.state}
                errors={this.state.errors}
              />

              {/* , "Haiku", "Russian Roulette" */}
              <Select
                label="Ending"
                name="ending"
                arr={["score", "turns"]}
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
              {this.state.voting === "tsar" ?
                <Select
                  label="Meritocracy"
                  name="meritocracy"
                  arr={["yes", "no"]}
                  fn={this.handleSelect}
                  obj={this.state}
                  errors={this.state.errors}
                /> : ""}

              {/* russianRoulette for points */}
              {/* refreshHand: false,
              randoCardissian: false,
              jollyCards */}

            </div>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  username: getUsername(state),
  lobbyName: getLobbyName(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateUserInfo: (value) => dispatch(updateUserInfo(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyCreationPage);