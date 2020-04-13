import React, { Component } from "react";
import Button from "../modules/input/Button";
import Input from "../modules/input/Input";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
  getLobbyName,
  getUsername,
  getChatHistory,
  addChatMessage,
} from "../../redux/actions";

import {
  USER_CONNECT,
  USER_DISCONNECT,
  CHAT_MESSAGE,
  SEND_CHAT_MESSAGE,
} from "../../../server/socket/messages";

class Chat extends Component {

  constructor(props) {
    super(props);
    this.state = {
      message: "",
      history: [],
      listeners: [],
    };
    this.listeners = {};

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.addChatMessage = this.addChatMessage.bind(this);
    this.addSystemMessage = this.addSystemMessage.bind(this);
  }

  static get propTypes() {
    return {
      socket: PropTypes.object,
      lobbyName: PropTypes.string,
      username: PropTypes.string,
      chatHistory: PropTypes.array,
      addChatMessage: PropTypes.func,
    };
  }

  componentDidMount() {
    this.props.socket.on(CHAT_MESSAGE, (msg) => {
      this.addChatMessage({ username: msg.username, message: msg.message });
    });

    this.props.socket.on(USER_CONNECT, (name) => {
      this.addSystemMessage("User " + name + " has connected.");
    });

    this.props.socket.on(USER_DISCONNECT, (name) => {
      this.addSystemMessage("User " + name + " has disconnected.");
    });
  }

  componentWillUnmount() {
    this.props.socket.off(CHAT_MESSAGE);
    this.props.socket.off(USER_CONNECT);
    this.props.socket.off(USER_DISCONNECT);
  }

  addChatMessage(message) {
    this.props.addChatMessage(message);
  }

  addSystemMessage(message) {
    this.addChatMessage({ username: "Discard Humanity", message: message });
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value,
    });
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.state.message.trim().length === 0) return;

    this.props.socket.emit(SEND_CHAT_MESSAGE, {
      username: this.props.username,
      message: this.state.message,
      lobbyName: this.props.lobbyName,
    });

    this.setState({ message: "" });
  }

  render() {
    let messages = this.props.chatHistory.map((el, index) => (
      <div className="flex-row" key={index}>
        <div className="chat-username">{el.username}</div>
        <div className="chat-message">{el.message}</div>
      </div>
    ));
    return (
      <div className="flex-column chat">
        <div className="chat-history">{messages}</div>
        <div className="flex-row" onKeyDown={this.handleKeyDown}>
          <Input name="message" obj={this.state} fn={this.handleChange} />
          <Button value="Send" short="true" fn={this.sendMessage} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  lobbyName: getLobbyName(state),
  username: getUsername(state),
  chatHistory: getChatHistory(state),
});

const mapDispatchToProps = (dispatch) => ({
  addChatMessage: (value) => dispatch(addChatMessage(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
