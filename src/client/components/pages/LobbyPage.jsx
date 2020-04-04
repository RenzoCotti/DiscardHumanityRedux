import React, { Component } from "react";
import LobbyEntry from "../modules/LobbyEntry";
import CreateLobby from "../modules/CreateLobby";
import { connect } from "react-redux";

class LobbyPage extends Component {
  state = {};
  constructor(props) {
    super(props);

    // console.log(this.state);

    this.setupSocket();
    this.props.socket.emit("lobby-get-list");
  }

  setupSocket() {
    this.props.socket.on("lobby-update", () => {
      this.props.socket.emit("lobby-get-list");
    });

    this.props.socket.on("lobby-list", list => {
      this.setState({ lobbies: list });
    });
  }

  render() {
    let list;
    if (this.state.lobbies && this.state.lobbies.length > 0) {
      list = this.state.lobbies.map(el => {
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

        <CreateLobby socket={this.props.socket} />

        {/* <div className="errormsg"></div> */}

        {/* </div> */}
      </React.Fragment>
    );
  }
}

// const mapStateToProps = state => ({
//   socket: getSocket(state)
// });
export default LobbyPage;
// export default connect(mapStateToProps, null)(LobbyPage);
