import React, { Component } from "react";
import { Redirect } from "react-router";
import Button from "./input/Button";
import Input from "./input/Input";

class CreateLobby extends Component {
  state = { query: "" };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  onSubmit(e) {
    if (e) e.preventDefault();
    if (!this.state.query) {
      this.setState({ error: "Please input a query." });
      return;
    }
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value
    });
  }

  render() {
    if (this.state.redirect) return <Redirect push to="/list" />;

    return (
      <div className="create-lobby">
        <div className="title padded-bottom">Create Lobby</div>
        <form onSubmit={this.onSubmit}>
          <div className="flex-row">
            <div className="flex-column padded-right">
              <Input
                label="Lobby name"
                name="lobbyName"
                obj={this.state}
                fn={this.handleChange}
                errors={this.state.errors}
              />
              <Input
                label="Max Players"
                name="maxUsers"
                obj={this.state}
                fn={this.handleChange}
                errors={this.state.errors}
              />
            </div>

            <div className="flex-column">
              <Input
                label="Lobby password"
                name="password"
                password={true}
                obj={this.state}
                fn={this.handleChange}
                errors={this.state.errors}
              />
              <Input
                label="Confirm password"
                name="password"
                password={true}
                obj={this.state}
                fn={this.handleChange}
                errors={this.state.errors}
              />
            </div>
          </div>

          <br />
          <br />

          <Input
            label="Username"
            name="username"
            obj={this.state}
            fn={this.handleChange}
            errors={this.state.errors}
          />
          <div className="errormsg" style={{ height: "30px" }}>
            {this.state.error}
          </div>

          <Button value="Create Lobby" fn={this.onSubmit} />
        </form>
      </div>
    );
  }
}

export default CreateLobby;
