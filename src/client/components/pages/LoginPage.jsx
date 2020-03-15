import React, { Component } from "react";
import { connect } from "react-redux";
import { getLogin, updateLogin } from "../../redux/actions";
import Input from "../modules/input/Input";
import Button from "../modules/input/Button";

class LoginPage extends Component {
  //initialise the state for controlled component
  state = { username: "", password: "", error: "" };

  constructor(props) {
    super(props);
    this.postRequest = this.postRequest.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.login = this.login.bind(this);
    // this.deleteAccount = this.deleteAccount.bind(this);
    // this.createNewAccount = this.createNewAccount.bind(this);
    this.logout = this.logout.bind(this);
    this.validate = this.validate.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleChange(e) {
    let name = e.target.name;
    this.setState({
      [name]: e.target.value
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.validate()
    }
  }

  async postRequest(url) {
    let req = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    });
    let res = await req.text();

    if (res.toLowerCase() === "ok") {
      this.setState({ username: "", password: "" });
      this.props.updateLogin(true);
    } else if (res.toLowerCase() === "nope") {
      this.setState({ errors: [{ name: "general", errorMessage: "Invalid credentials." }] })
    }
    return res;
  }

  async login() {
    await this.postRequest("/api/admin/login");
  }

  // async createNewAccount(ev) {
  //   ev.preventDefault();
  //   await this.postRequest("/api/admin/new");
  // }

  // async deleteAccount(ev) {
  //   ev.preventDefault();
  //   let req = await fetch("/api/admin/delete", {
  //     method: "DELETE",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json"
  //     }
  //   });
  //   await req.text();
  // }

  async logout() {
    let req = await fetch("/api/admin/logout");
    let res = await req.text();
    if (res === "logout") this.props.updateLogin(false);
  }

  validate() {
    let arr = [];
    if (!this.state.username || this.state.username.length === 0) {
      arr.push({ name: "username" });
    } else if (this.state.username.length > 64) {
      arr.push({ name: "username", errorMessage: "Please input a shorter username." });
    }

    if (!this.state.password || this.state.password.length === 0) {
      arr.push({ name: "password" });
    } else if (this.state.password.length > 64) {
      arr.push({ name: "password", errorMessage: "Please input a shorter password." });
    }

    if (arr.length === 0) {
      this.login();
    } else {
      this.setState({ errors: arr });
    }
  }

  render() {
    //the user is logged in
    if (this.props.login) {
      return (
        <div className="secondary-container" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>Logged in.</div>
          <Button value="Logout" fn={this.logout} />
        </div>
      );
    }


    let general = "";
    if (this.state.errors) {
      this.state.errors.forEach(el => {
        if (el.name === "general") {
          general = el.errorMessage;
        }
      });
    }

    return (
      <div className="secondary-container">
        <div className="super-title padded-bottom">Login</div>

        <div>
          <form onKeyDown={this.handleKeyDown}>
            <Input
              label="Username"
              name="username"
              obj={this.state}
              fn={this.handleChange}
              errors={this.state.errors}
            />
            <Input
              label="Password"
              name="password"
              password={true}
              obj={this.state}
              fn={this.handleChange}
              errors={this.state.errors}
            />


            <div className="errormsg" style={general ?
              { height: "30px", display: "flex", flexDirection: "row", justifyContent: "center" } :
              { height: "30px" }}>
              {general}
            </div>



            <div style={{ marginTop: "50px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Button value="Login" fn={this.validate} />
              {/* <Button value="New" fn={this.createNewAccount} />
              <Button value="Delete" fn={this.deleteAccount} /> */}
            </div>

          </form>
        </div>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  login: getLogin(state)
});

const mapDispatchToProps = dispatch => ({
  updateLogin: value => dispatch(updateLogin(value))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
