import React, { Component } from "react";
import LobbyEntry from "../modules/LobbyEntry";
// import CreateLobby from "../modules/CreateLobby";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import Button from "../modules/input/Button";

import PropTypes from "prop-types";
import { getUsername, getLobbyName } from "../../redux/actions";
import {
  LOBBY_GET_LIST,
  LOBBY_LIST_UPDATE,
  USER_EXISTS,
  LOBBY_LIST,
} from "../../../server/socket/messages";

class LobbyPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.setupSocket();
    this.createLobby = this.createLobby.bind(this);

    this.props.socket.emit(LOBBY_GET_LIST);
    //checks if a user already joined a lobby
    // if (this.props.username && this.props.lobbyName) {
    //   this.props.socket.emit(LOBBY_HAS_USER, {
    //     username: this.props.username,
    //     lobbyName: this.props.lobbyName,
    //   });
    // }
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
    };
  }

  setupSocket() {
    this.props.socket.on(LOBBY_LIST_UPDATE, () => {
      this.props.socket.emit(LOBBY_GET_LIST);
    });

    this.props.socket.on(LOBBY_LIST, (list) => {
      this.setState({ lobbies: list });
    });

    this.props.socket.on(USER_EXISTS, () => {
      this.setState({ lounge: true });
    });
  }

  createLobby() {
    this.setState({ create: true });
  }

  render() {
    if (this.state.lounge) {
      return <Redirect push to={"/lounge"} />;
    } else if (this.state.create) {
      return <Redirect push to={"/create-lobby"} />;
    }

    let list;
    if (this.state.lobbies && this.state.lobbies.length > 0) {
      list = this.state.lobbies.map((el) => {
        return (
          <LobbyEntry
            name={el.name}
            maxUsers={el.maxUsers}
            currentUsers={el.currentUsers}
            key={el.name}
            password={el.password}
            socket={this.props.socket}
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


        <Button value="Create Lobby" fn={this.createLobby} />

        {/* <div className="errormsg"></div> */}

        {/* </div> */}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  username: getUsername(state),
  lobbyName: getLobbyName(state),
});
// export default LobbyPage;
export default connect(mapStateToProps, null)(LobbyPage);
