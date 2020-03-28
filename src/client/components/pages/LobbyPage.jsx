import React, { Component } from "react";
import LobbyEntry from "../modules/LobbyEntry";
import CreateLobby from "../modules/CreateLobby";
import { Redirect } from "react-router";

class LobbyPage extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.socket = this.props.socket;

    this.setupSocket();
  }

  setupSocket() {
    this.socket.on("lobby-update", () => {
      this.socket.emit("lobby-get-list");
    });

    this.socket.on("lobby-list", list => {
      this.setState({ lobbies: list });
    });

    this.socket.on("lobby-created", info => {
      console.log("lobby created!");
      this.setState({ joinAdmin: info });
    });

    this.socket.on("lobby-joined", info => {
      console.log("lobby joined!");

      this.setState({ joinUser: info });
    });

    this.socket.on("lobby-incorrect-credentials", () => {
      console.log("incorrect creds");
    });
  }

  render() {
    if (this.state.joinAdmin) {
      return <Redirect push to={"/lobby/" + this.state.joinAdmin + "/deck"} />;
    }

    if (this.state.joinUser) {
      return <Redirect push to={"/lounge/" + this.state.joinUser} />;
    }

    let list;
    if (this.state.lobbies && this.state.lobbies.length > 0) {
      list = this.state.lobbies.map(el => {
        return (
          <LobbyEntry
            name={el.name}
            maxUsers={el.maxUsers}
            currentUsers={el.currentUsers}
            socket={this.socket}
            key={el.name}
          />
        );
      });
    }

    return (
      <React.Fragment>
        <div className="flex-column">
          <div className="title padded-bottom">List of lobbies</div>
          <div className="lobby-list">
            {list ? list : "No lobbies available."}
          </div>
        </div>

        <CreateLobby socket={this.socket}></CreateLobby>

        {/* <div className="errormsg"></div> */}

        {/* </div> */}
      </React.Fragment>
    );
  }
}

export default LobbyPage;
