import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { NavLink } from "react-router-dom";
// import { LOBBY_LEAVE } from "../../../../../server/socket/messages";
import {
  getLobbyName,
  getUsername,
  getTabSelected,
  updateTabSelected
} from "../../../../redux/actions";
import home from "../../../../../../public/images/home.png";


class Topbar extends Component {
  constructor(props) {
    super(props);

    if (!this.props.tabSelected) {
      this.props.updateTabSelected("chat");
    }
  }

  // componentWillUnmount() {
  //   this.props.socket.emit(LOBBY_LEAVE, { lobbyName: this.props.lobbyName, username: this.props.username });
  // }



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
        <div className="flex-row tab-switch">
          <div className={"nav-element link " + (this.props.tabSelected === "chat" ? "tab-selected" : "")} onClick={() => this.props.updateTabSelected("chat")}>Chat</div>
          <div className={"nav-element link " + (this.props.tabSelected === "scores" ? "tab-selected" : "")} onClick={() => this.props.updateTabSelected("scores")}>Scores</div>
        </div>

      </div>
    );

  }
}

Topbar.propTypes = {
  socket: PropTypes.object,
  lobbyName: PropTypes.string,
  username: PropTypes.string,
  updateTabSelected: PropTypes.func,
  tabSelected: PropTypes.string
};

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state),
  tabSelected: getTabSelected(state)
});

const mapDispatchToProps = (dispatch) => ({
  updateTabSelected: (value) => dispatch(updateTabSelected(value)),
});


export default connect(mapStateToProps, mapDispatchToProps)(Topbar);
