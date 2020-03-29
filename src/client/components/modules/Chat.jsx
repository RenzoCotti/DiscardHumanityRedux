import React, { Component } from "react";
import Button from "../modules/input/Button";
import Input from "../modules/input/Input";

class Chat extends Component {
  state = { history: [{ username: "dicc", message: "Test ehuehuehue" }] };

  constructor(props) {
    super(props);
    this.socket = this.props.socket;
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.socket.on("chat-message-new", msg => {
      let history = this.state.history;
      history.push({ username: msg.username, message: msg.message });
      this.setState({ history: history });
    });
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
    this.socket.emit("chat-message", {
      username: this.props.username,
      message: this.state.message,
      lobby: this.props.lobbyName
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

export default Chat;
