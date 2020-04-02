import React, { Component } from "react";
import Button from "../modules/input/Button";
import Input from "../modules/input/Input";
import { connect } from "react-redux";
import {
  getLobbyName,
  getSocket,
  getUsername,
  getChatHistory,
  updateChatHistory
} from "../../redux/actions";

class Chat extends Component {
  state = {
    message: "",
    history: [],
    listeners: []
  };

  listeners = {};

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.addChatMessage = this.addChatMessage.bind(this);
    this.addSystemMessage = this.addSystemMessage.bind(this);

    // this=.setState({ history: this.props.history });

    //TODO: CURRENTLY EACH TIME COMPONENT IS MOUNTED, NEW LISTENERS ARE CREATED

    if (!this.init) {
    }
  }

  componentDidMount() {
    this.props.socket.on("chat-message-new", msg => {
      console.log("event message");
      this.addChatMessage({ username: msg.username, message: msg.message });
    });

    this.props.socket.on("user-connect", name => {
      this.addSystemMessage("User " + name + " has connected.");
    });

    this.props.socket.on("user-disconnect", name => {
      this.addSystemMessage("User " + name + " has disconnected.");
    });

    // console.log(this.props.socket);
  }

  componentWillUnmount() {
    this.props.socket.off("chat-message-new");
    this.props.socket.off("user-connect");
    this.props.socket.off("user-disconnect");

    // console.log(this.props.socket);
  }

  addChatMessage(message) {
    // console.log("new message");
    let history = this.props.chatHistory;
    // console.log(history);
    // console.log(message);
    history.push(message);
    this.props.updateChatHistory(history);
    this.setState({ history: history });
  }

  addSystemMessage(message) {
    this.addChatMessage({ username: "Discard Humanity", message: message });
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value
    });
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.state.message.trim().length === 0) return;

    this.props.socket.emit("chat-message", {
      username: this.props.username,
      message: this.state.message,
      lobbyName: this.props.lobbyName
    });

    this.setState({ message: "" });
  }

  render() {
    let messages = this.state.history.map((el, index) => (
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

const mapStateToProps = state => ({
  socket: getSocket(state),
  lobbyName: getLobbyName(state),
  username: getUsername(state),
  chatHistory: getChatHistory(state)
});

const mapDispatchToProps = dispatch => ({
  updateChatHistory: value => dispatch(updateChatHistory(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
