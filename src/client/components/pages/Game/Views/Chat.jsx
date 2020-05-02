import React, { Component } from "react";
import Button from "../../../modules/input/Button";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
  getLobbyName,
  getUsername,
  getChatHistory,
  addChatMessage,
} from "../../../../redux/actions";

import {
  USER_CONNECT,
  USER_DISCONNECT,
  CHAT_MESSAGE,
  SEND_CHAT_MESSAGE,
} from "../../../../../server/socket/messages";

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
    this.scrollToBottom = this.scrollToBottom.bind(this);
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
    this.scrollToBottom();
  }

  addSystemMessage(message) {
    this.addChatMessage({ username: "System", message: message, system: true });
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

  scrollToBottom() {
    this.endOfMessages.scrollIntoView({ behavior: "smooth" });
  }

  render() {
    let messages = this.props.chatHistory.map((el, index) => (
      <div className="flex-row" key={index}>
        {el.system ?
          <div className="system-message">{el.message}</div>
          :
          <React.Fragment>
            <div className="chat-username">{el.username}</div>
            <div className="chat-message">{el.message}</div>
          </React.Fragment>
        }
      </div>
    ));
    return (
      <div className="chat-container">
        <div className="chat-history">{messages}
          <div ref={(el) => { this.endOfMessages = el; }} />
        </div>
        <div className="chat-controls" onKeyDown={this.handleKeyDown}>
          <input
            className="chat-textbox input"
            type="text"
            name="message"
            value={this.state.message}
            onChange={this.handleChange}
            autoComplete="off"
          />
          <Button value="Send" short={true} fn={this.sendMessage} />
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
