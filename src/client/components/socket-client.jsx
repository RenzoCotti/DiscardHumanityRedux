import React, { Component } from "react";

class Socket extends Component {
  constructor(props) {
    super(props);

    // console.log(this.socket);
    this.socket = this.props.socket;

    this.socket.on("new_user", msg => {
      console.log(msg);
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    return <div>hi</div>;
  }
}
export default Socket;
