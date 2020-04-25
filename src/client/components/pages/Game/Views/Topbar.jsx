import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { NavLink } from "react-router-dom";
import { LOBBY_LEAVE } from "../../../../../server/socket/messages";
import {
  getLobbyName,
  getUsername,
} from "../../../../redux/actions";
import home from "../../../../../../public/images/home.png";


class Topbar extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.props.socket.emit(LOBBY_LEAVE, { lobbyName: this.props.lobbyName, username: this.props.username });
  }


  render() {
    return (
      <div className="topbar">
        <NavLink
          exact
          className="nav-element link"
          to="/"
        >
          <img className="home-icon" src={home} alt="Home" />
        </NavLink>
        <div className="lobby-title">Lobby {this.props.lobbyName}</div>

      </div>
    );

  }
}

Topbar.propTypes = {
  socket: PropTypes.object,
  lobbyName: PropTypes.string,
  username: PropTypes.string
};

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state)
});


export default connect(mapStateToProps, null)(Topbar);
